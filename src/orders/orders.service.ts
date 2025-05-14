import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Instrument } from 'src/entities/instrument.entity';
import { MarketData } from 'src/entities/marketdata.entity';
import { Order } from 'src/entities/order.entity';
import { User } from 'src/entities/user.entity';
import { OrderSide, OrderStatus, OrderType } from 'src/enums/order.enums';
import { Repository } from 'typeorm';
import { CreateOrderDto } from './dto/createOrder.dto';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Instrument)
    private instrumentsRepository: Repository<Instrument>,
    @InjectRepository(MarketData)
    private marketdataRepository: Repository<MarketData>,
  ) { }

  async createOrder(dto: CreateOrderDto): Promise<Order> {
    const {
      instrumentId,
      side,
      type,
      price,
      userId,
    } = dto;

    const user = await this.findUserOrThrow(userId);
    const instrument = await this.findInstrumentOrThrow(instrumentId);
    const marketData = await this.findMarketDataOrThrow(instrumentId);

    await this.validateOrderConditions(dto);
    const lastPrice = marketData.close;
    const finalSize = this.getSizeOrThrow(dto, lastPrice);
    const totalOrderAmount = this.getTotalOrderAmount(dto, lastPrice, finalSize)

    //validate available funds
    if (side === OrderSide.BUY) {
      const cashAvailable = await this.getUserCashBalance(userId);
      if (totalOrderAmount > cashAvailable) {
        this.logger.warn(`User ${userId} has insufficient funds to buy ${finalSize} shares of ${instrument.ticker}`);
        return this.saveOrder({ ...dto, price: lastPrice, size: finalSize, status: OrderStatus.REJECTED }, user, instrument);
      }
    }

    if (side === OrderSide.SELL) {
      const sharesOwned = await this.getUserInstrumentHoldings(userId, instrumentId);
      if (finalSize > sharesOwned) {
        this.logger.warn(`User ${userId} has insufficient shares to sell ${finalSize} shares of ${instrument.ticker}`);
        return this.saveOrder({ ...dto, price: lastPrice, size: finalSize, status: OrderStatus.REJECTED }, user, instrument);
      }
    }

    const status = this.getOrderStatus(type);
    const executionPrice = type === OrderType.MARKET ? lastPrice : price;

    return this.saveOrder({
      ...dto,
      size: finalSize,
      price: executionPrice,
      status,
    }, user, instrument);
  }

  private async validateOrderConditions(params: CreateOrderDto) {
    if (params.type === OrderType.LIMIT) {
      this.validateOrderLimitPrice(params.price ?? 0);
    }
  }

  private validateOrderLimitPrice(price: number) {
    if (!price) {
      throw new BadRequestException('Price is required for LIMIT orders');
    }
  }

  private getOrderStatus(type: OrderType): OrderStatus {
    return type === OrderType.MARKET ? OrderStatus.FILLED : OrderStatus.NEW;
  }

  private getTotalOrderAmount(params: CreateOrderDto, lastPrice: number, finalSize: number): number {
    const { type, price } = params
    return finalSize * (type === OrderType.MARKET ? lastPrice : price ?? 0);
  }

  private async findUserOrThrow(userId: number): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (user) {
      return user;
    }
    throw new NotFoundException('User not found');
  }

  private async findInstrumentOrThrow(instrumentId: number): Promise<Instrument> {
    const instrument = await this.instrumentsRepository.findOneBy({ id: instrumentId });
    if (instrument) {
      return instrument;
    }
    throw new NotFoundException('Instrument not found');
  }

  private async findMarketDataOrThrow(instrumentId: number): Promise<MarketData> {
    const marketData = await this.findMarketData(instrumentId);
    if (marketData) {
      return marketData;
    }
    throw new NotFoundException('No market data available');
  }

  private async findMarketData(instrumentId: number): Promise<MarketData | null> {
    return this.marketdataRepository.findOne({
      where: { instrument: { id: instrumentId } },
      order: { date: 'DESC' },
    });
  }

  private getSizeOrThrow(params: CreateOrderDto, lastPrice: number): number {
    const { size, investmentAmount, type, price } = params;

    if (size && size > 0) {
      return size;
    }

    if (investmentAmount && investmentAmount > 0) {
      const finalPrice = type === OrderType.MARKET ? lastPrice : Number(price ?? 0);

      if (finalPrice <= 0) {
        throw new BadRequestException('Invalid price for order size calculation');
      }

      const calculatedSize = Math.floor(investmentAmount / finalPrice);

      if (calculatedSize > 0) {
        return calculatedSize;
      }

      throw new BadRequestException('Investment amount too small to calculate a valid size');
    }

    throw new BadRequestException('Size or investment amount is required and must be greater than zero');
  }

  private async getUserCashBalance(userId: number): Promise<number> {
    const result = await this.ordersRepository
      .createQueryBuilder('o')
      .select("SUM(CASE WHEN o.side IN ('CASH_IN', 'SELL') THEN o.size * o.price ELSE -o.size * o.price END)", 'balance')
      .where('o.userId = :userId', { userId })
      .andWhere("o.status = 'FILLED'")
      .getRawOne();

    return parseFloat(result.balance ?? 0);
  }

  private async getUserInstrumentHoldings(userId: number, instrumentId: number): Promise<number> {
    const result = await this.ordersRepository
      .createQueryBuilder('o')
      .select("SUM(CASE WHEN o.side = 'BUY' THEN o.size WHEN o.side = 'SELL' THEN -o.size ELSE 0 END)", 'shares')
      .where('o.userId = :userId', { userId })
      .andWhere('o.instrumentId = :instrumentId', { instrumentId })
      .andWhere("o.status = 'FILLED'")
      .getRawOne();

    return parseInt(result.shares ?? 0);
  }

  private async saveOrder(
    data: Partial<CreateOrderDto & { status: OrderStatus; size: number; price: number }>,
    user: User,
    instrument: Instrument,
  ): Promise<Order> {
    const order = this.ordersRepository.create({
      instrument,
      user,
      side: data.side,
      type: data.type,
      price: data.price,
      size: data.size,
      status: data.status,
      datetime: new Date(),
    });

    return this.ordersRepository.save(order);
  }
}

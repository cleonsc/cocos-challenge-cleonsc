import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Instrument } from 'src/entities/instrument.entity';
import { MarketData } from 'src/entities/marketdata.entity';
import { Order } from 'src/entities/order.entity';
import { OrderSide, OrderStatus } from 'src/enums/order.enums';
import { Sorting } from 'src/enums/sorting.enum';
import { Repository } from 'typeorm';
import { ShareBalancePosition, SharePosition } from './portfolio.interface';

@Injectable()
export class PortfolioService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(Instrument) private instrumentRepo: Repository<Instrument>,
    @InjectRepository(MarketData) private marketDataRepo: Repository<MarketData>,
  ) { }

  async getPortfolio(userId: number) {
    const filledOrders: Order[] = await this.getFilledOrdersByUser(userId);
    const cash: number = this.getCashByUser(filledOrders);
    const shares = this.getSharedPositions(filledOrders);
    const shareMarketBalance: ShareBalancePosition[] = await this.getBalancePosition(shares);
    const totalValue = shareMarketBalance.reduce((acc, pos) => acc + pos.marketValue, 0) + cash;

    return {
      userId,
      totalValue,
      availableCash: cash,
      positions: shareMarketBalance,
    };
  }

  private async getFilledOrdersByUser(userId: number): Promise<Order[]> {
    return this.orderRepo.find({
      where: { user: { id: userId }, status: OrderStatus.FILLED },
      relations: ['instrument'],
    });
  }

  private getCashByUser(orders: Order[]): number {
    let cash = 0;

    for (const order of orders) {
      if (order.side === OrderSide.CASH_IN) cash += Number(order.size);
      if (order.side === OrderSide.CASH_OUT) cash -= Number(order.size);
      if (order.instrument.type === 'MONEDA') {
        if (order.side === OrderSide.BUY) cash -= Number(order.size) * Number(order.price);
        if (order.side === OrderSide.SELL) cash += Number(order.size) * Number(order.price);
      }
    }

    return cash;
  }

  private getSharedPositions(orders: Order[]): Map<number, SharePosition> {
    const shares = new Map<number, SharePosition>();

    for (const order of orders) {
      const instrumentId = order.instrument.id;
      if (order.instrument.type === 'MONEDA') continue;
      if (!shares.has(instrumentId)) {
        shares.set(instrumentId, {
          instrument: order.instrument,
          totalSize: 0,
          totalSpent: 0,
        });
      }

      const pos = shares.get(instrumentId)!;
      if (order.side === OrderSide.BUY) {
        pos.totalSize += Number(order.size);
        pos.totalSpent += Number(order.size) * Number(order.price);
      } else if (order.side === OrderSide.SELL) {
        pos.totalSize -= Number(order.size);
        const avgPrice = pos.totalSpent / pos.totalSize;
        pos.totalSpent -= Number(order.size) * avgPrice;
      }
    }

    return shares;
  }

  private async getMarketDataOrder(instrumentId: number, sortBy: Sorting): Promise<MarketData | null> {
    return this.marketDataRepo.findOne({
      where: { instrument: { id: instrumentId } },
      order: { date: sortBy },
    });

  }

  private async getBalancePosition(shares: Map<number, SharePosition>): Promise<ShareBalancePosition[]> {
    const result: ShareBalancePosition[] = [];

    for (const share of shares.values()) {
      if (share.totalSize <= 0) continue;

      const marketData = await this.getMarketDataOrder(share.instrument.id, Sorting.DESC);

      const currentPrice = Number(marketData?.close ?? 0);
      const marketValue = share.totalSize * currentPrice;
      const avgPrice = share.totalSpent / share.totalSize;
      const performance = ((currentPrice - avgPrice) / avgPrice) * 100;

      result.push({
        instrumentId: share.instrument.id,
        ticker: share.instrument.ticker,
        name: share.instrument.name,
        quantity: share.totalSize,
        marketValue,
        performance,
      });
    }

    return result;
  }
}

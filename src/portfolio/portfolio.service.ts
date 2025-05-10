import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MarketData } from 'src/entities/marketdata.entity';
import { Order } from 'src/entities/order.entity';
import { OrderSide, OrderStatus } from 'src/enums/order.enums';
import { Sorting } from 'src/enums/sorting.enum';
import { Repository } from 'typeorm';
import { PortfolioDto, ShareBalancePosition, SharePosition } from './portfolio.interface';

@Injectable()
export class PortfolioService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(MarketData) private marketDataRepo: Repository<MarketData>,
  ) { }

  async getPortfolio(userId: number): Promise<PortfolioDto> {
    const filledOrders: Order[] = await this.getFilledOrdersByUser(userId);
    if (filledOrders.length === 0) {
      return {
        userId,
        totalValue: 0,
        availableCash: 0,
        positions: [],
      };
    }

    const cash: number = this.getCashByUser(filledOrders);
    const shares = this.calculatePositionsFromOrders(filledOrders);
    const positionsWithMarketData: ShareBalancePosition[] = await this.getBalancePosition(shares);
    const totalValue = positionsWithMarketData.reduce((acc, pos) => acc + pos.marketValue, 0) + cash;

    return {
      userId,
      totalValue,
      availableCash: cash,
      positions: positionsWithMarketData,
    };
  }

  private async getFilledOrdersByUser(userId: number): Promise<Order[]> {
    return this.orderRepo.find({
      where: { user: { id: userId }, status: OrderStatus.FILLED },
      order: { datetime: Sorting.ASC },
      relations: ['instrument'],
    });
  }

  private getCashByUser(orders: Order[]): number {
    let cash = 0;

    for (const order of orders) {
      if (order.side === OrderSide.CASH_IN) {
        cash += Number(order.size);
      } else if (order.side === OrderSide.CASH_OUT) {
        cash -= Number(order.size);
      } else if (order.instrument.type !== 'MONEDA') {
        if (order.side === OrderSide.BUY) {
          cash -= Number(order.size) * Number(order.price);
        } else if (order.side === OrderSide.SELL) {
          cash += Number(order.size) * Number(order.price);
        }
      }
    }

    return cash;
  }

  private calculatePositionsFromOrders(orders: Order[]): Map<number, SharePosition> {
    const shares = new Map<number, SharePosition>();

    for (const order of orders) {
      const instrumentId = order.instrument.id;
      if (order.instrument.type === 'MONEDA') continue;

      const size = Number(order.size);
      const price = Number(order.price);

      if (!shares.has(instrumentId)) {
        if (order.side === OrderSide.SELL) {
          console.warn(`Invalid sale for instrument ${instrumentId} without previous position.`);
          continue;
        }

        shares.set(instrumentId, {
          instrument: order.instrument,
          totalSize: 0,
          totalSpent: 0,
        });
      }

      const pos = shares.get(instrumentId)!;

      if (order.side === OrderSide.BUY) {
        pos.totalSize += size;
        pos.totalSpent += size * price;
      } else if (order.side === OrderSide.SELL) {
        if (size > pos.totalSize) {
          console.warn(`Invalid sale: you try to sell ${size} but only have ${pos.totalSize} of ${instrumentId}`);
          shares.delete(instrumentId); // eliminamos la posición incorrecta
          continue;
        }

        const avgPrice = pos.totalSpent / pos.totalSize;

        pos.totalSpent -= size * avgPrice;
        pos.totalSize -= size;

        // evitamos residuos negativos muy chicos
        if (pos.totalSize <= 0.0001) {
          shares.delete(instrumentId);
        }
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
    const results = await Promise.all(
      Array.from(shares.values()).map(async (share) => {
        if (share.totalSize <= 0) return null;

        const marketData = await this.getMarketDataOrder(share.instrument.id, Sorting.DESC);
        const currentPrice = Number(marketData?.close ?? 0);
        const marketValue = share.totalSize * currentPrice;
        const avgPrice = share.totalSpent / share.totalSize;
        const performance = avgPrice > 0 ? ((currentPrice - avgPrice) / avgPrice) * 100 : 0;

        return {
          instrumentId: share.instrument.id,
          ticker: share.instrument.ticker,
          name: share.instrument.name,
          quantity: share.totalSize,
          marketValue,
          performance,
        };
      })
    );

    return results.filter((r): r is ShareBalancePosition => r !== null);
  }
}

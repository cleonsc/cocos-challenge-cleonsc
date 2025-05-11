import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MarketData } from 'src/entities/marketdata.entity';
import { Order } from 'src/entities/order.entity';
import { OrderSide } from 'src/enums/order.enums';
import { Sorting } from 'src/enums/sorting.enum';
import { mockMarketData } from './__mocks__/mock-marketData';
import { mockOrders } from './__mocks__/mock-orders';
import { PortfolioService } from './portfolio.service';

describe('PortfolioService', () => {
  let service: PortfolioService;
  const mockOrderRepository = {
    find: jest.fn(),
  };

  const mockMarketDataRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PortfolioService,
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrderRepository,
        },
        {
          provide: getRepositoryToken(MarketData),
          useValue: mockMarketDataRepository,
        },
      ],
    }).compile();

    service = module.get<PortfolioService>(PortfolioService);
    jest.spyOn(console, 'warn').mockImplementation(() => { }); // Suppress console.warn in tests
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPortfolio', () => {
    it('should return an empty portfolio if no orders are found', async () => {
      mockOrderRepository.find.mockResolvedValue([]);

      const result = await service.getPortfolio(1);

      expect(result).toEqual({
        userId: 1,
        totalValue: 0,
        availableCash: 0,
        positions: [],
      });
    });

    it('should calculate the portfolio correctly', async () => {
      mockOrderRepository.find.mockResolvedValue(mockOrders);

      jest.spyOn(service as any, 'getMarketDataOrder').mockImplementation(async (instrumentId: number, sortBy: Sorting) => {
        const [first] = mockMarketData.filter((data) => data.instrumentid === instrumentId);
        return first;
      });

      const userId = 1;
      const result = await service.getPortfolio(userId);

      expect(result).toBeDefined();
      expect(result.positions).toHaveLength(2);
      expect(result.positions.map((p) => p.ticker)).toEqual(['PAMP', 'METR']);
      expect(result.positions.map((p) => p.quantity)).toEqual([40, 500]);
      expect(result.availableCash).toBe(753000);
      expect(result.totalValue).toBe(904784);
    });
  })

  describe('getCashByUser - private method', () => {
    it('should calculate cash correctly', () => {
      const mockOrders = [
        { side: OrderSide.CASH_IN, size: 1000, instrument: { type: 'MONEDA' } },
        { side: OrderSide.CASH_OUT, size: 500, instrument: { type: 'MONEDA' } },
        { side: OrderSide.BUY, size: 10, price: 50, instrument: { type: 'ACCION' } },
        { side: OrderSide.SELL, size: 5, price: 60, instrument: { type: 'ACCION' } },
      ];

      const result = service['getCashByUser'](mockOrders as Order[]);

      expect(result).toBe(300); // 1000 - 500 - (10 * 50) + (5 * 60)
    });
  });

  describe('calculatePositionsFromOrders - private method', () => {
    it('should calculate positions correctly', () => {
      const mockOrders = [
        {
          instrument: { id: 1, type: 'ACCION', ticker: 'AAPL', name: 'Apple' },
          size: 10,
          price: 150,
          side: OrderSide.BUY,
        },
        {
          instrument: { id: 1, type: 'ACCION', ticker: 'AAPL', name: 'Apple' },
          size: 5,
          price: 160,
          side: OrderSide.SELL,
        },
      ];

      const result = service['calculatePositionsFromOrders'](mockOrders as Order[]);

      expect(result.size).toBe(1);
      const position = result.get(1);
      expect(position).toBeDefined();
      expect(position?.totalSize).toBe(5); // 10 - 5
      expect(position?.totalSpent).toBe(750); // 10 * 150 - 5 * 150
    });
  });

  describe('getBalancePosition', () => {
    it('should calculate balance positions correctly', async () => {
      const mockShares = new Map<number, any>();
      mockShares.set(1, {
        instrument: { id: 1, ticker: 'AAPL', name: 'Apple' },
        totalSize: 10,
        totalSpent: 1500,
      });

      const mockMarketData = {
        id: 1,
        instrument: { id: 1 },
        close: 170,
        date: new Date(),
      };

      mockMarketDataRepository.findOne.mockResolvedValue(mockMarketData);

      const [result] = await service['getBalancePosition'](mockShares);

      expect(result).toBeDefined();
      expect(result.ticker).toBe('AAPL');
      expect(result.marketValue).toBe(1700); // 10 * 170
      expect(result.performance).toBeCloseTo(13.33, 2); // ((170 - 150) / 150) * 100
    });
  });
});
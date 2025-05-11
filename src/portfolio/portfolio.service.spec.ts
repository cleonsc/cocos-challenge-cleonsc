import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MarketData } from 'src/entities/marketdata.entity';
import { Order } from 'src/entities/order.entity';
import { Sorting } from 'src/enums/sorting.enum';
import { mockMarketData } from './__mocks__/mock-marketData';
import { mockOrders } from './__mocks__/mock-orders';
import { PortfolioService } from './portfolio.service';

describe('PortfolioService', () => {
  let service: PortfolioService;
  const mockOrderRepository = {
    find: jest.fn(),
    save: jest.fn(),
  };

  const mockMarketDataRepository = {
    find: jest.fn(),
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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should compute correct positions excluding oversold instruments', async () => {
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
});
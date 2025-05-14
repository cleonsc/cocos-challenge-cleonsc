import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Instrument } from 'src/entities/instrument.entity';
import { MarketData } from 'src/entities/marketdata.entity';
import { Order } from 'src/entities/order.entity';
import { User } from 'src/entities/user.entity';
import { OrderSide, OrderStatus, OrderType } from 'src/enums/order.enums';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  let service: OrdersService;

  const mockOrdersRepository = {
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockUsersRepository = {
    findOneBy: jest.fn(),
  };

  const mockInstrumentsRepository = {
    findOneBy: jest.fn(),
  };

  const mockMarketDataRepository = {
    findOne: jest.fn(),
  };


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrdersService,
        { provide: getRepositoryToken(Order), useValue: mockOrdersRepository },
        { provide: getRepositoryToken(User), useValue: mockUsersRepository },
        { provide: getRepositoryToken(Instrument), useValue: mockInstrumentsRepository },
        { provide: getRepositoryToken(MarketData), useValue: mockMarketDataRepository },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrder', () => {
    it('should throw NotFoundException if user is not found', async () => {
      mockUsersRepository.findOneBy.mockResolvedValue(null);

      await expect(
        service.createOrder({
          userId: 1,
          instrumentId: 1,
          side: OrderSide.BUY,
          type: OrderType.MARKET,
          price: 100,
          size: 10,
        }),
      ).rejects.toThrow(NotFoundException);

      expect(mockUsersRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('should throw NotFoundException if instrument is not found', async () => {
      mockUsersRepository.findOneBy.mockResolvedValue({ id: 1 });
      mockInstrumentsRepository.findOneBy.mockResolvedValue(null);

      await expect(
        service.createOrder({
          userId: 1,
          instrumentId: 1,
          side: OrderSide.BUY,
          type: OrderType.MARKET,
          price: 100,
          size: 10,
        }),
      ).rejects.toThrow(NotFoundException);

      expect(mockInstrumentsRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('should throw BadRequestException if market data is not found', async () => {
      mockUsersRepository.findOneBy.mockResolvedValue({ id: 1 });
      mockInstrumentsRepository.findOneBy.mockResolvedValue({ id: 1 });
      mockMarketDataRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createOrder({
          userId: 1,
          instrumentId: 1,
          side: OrderSide.BUY,
          type: OrderType.MARKET,
          price: 100,
          size: 10,
        }),
      ).rejects.toThrow(NotFoundException);

      expect(mockMarketDataRepository.findOne).toHaveBeenCalledWith({
        where: { instrument: { id: 1 } },
        order: { date: 'DESC' },
      });
    });

    it('should reject a BUY order if user has insufficient funds', async () => {
      mockUsersRepository.findOneBy.mockResolvedValue({ id: 1 });
      mockInstrumentsRepository.findOneBy.mockResolvedValue({ id: 1, ticker: 'AAPL' });
      mockMarketDataRepository.findOne.mockResolvedValue({ close: 100 });

      jest.spyOn(service as any, 'getUserCashBalance').mockResolvedValue(500);
      (service as any).saveOrder = jest.fn().mockResolvedValue({ status: OrderStatus.REJECTED } as Order);

      const result = await service.createOrder({
        userId: 1,
        instrumentId: 1,
        side: OrderSide.BUY,
        type: OrderType.MARKET,
        price: 100,
        size: 10,
      });

      expect(result.status).toBe(OrderStatus.REJECTED);
      expect((service as any).saveOrder).toHaveBeenCalledWith(
        expect.objectContaining({ status: OrderStatus.REJECTED }),
        expect.any(Object),
        expect.any(Object),
      );
    });

    it('should accept a BUY order if user has sufficient funds', async () => {
      mockUsersRepository.findOneBy.mockResolvedValue({ id: 1 });
      mockInstrumentsRepository.findOneBy.mockResolvedValue({ id: 1, ticker: 'AAPL' });
      mockMarketDataRepository.findOne.mockResolvedValue({ close: 100 });
      jest.spyOn(service as any, 'getUserCashBalance').mockResolvedValue(2000);
      (service as any).saveOrder = jest.fn().mockResolvedValue({ status: OrderStatus.FILLED } as Order);

      const result = await service.createOrder({
        userId: 1,
        instrumentId: 1,
        side: OrderSide.BUY,
        type: OrderType.MARKET,
        price: 100,
        size: 10,
      });

      expect(result.status).toBe(OrderStatus.FILLED);
      expect((service as any).saveOrder).toHaveBeenCalledWith(
        expect.objectContaining({ status: OrderStatus.FILLED }),
        expect.any(Object),
        expect.any(Object),
      );
    });

    it('should reject a SELL order if user has insufficient shares', async () => {
      mockUsersRepository.findOneBy.mockResolvedValue({ id: 1 });
      mockInstrumentsRepository.findOneBy.mockResolvedValue({ id: 1, ticker: 'AAPL' });
      mockMarketDataRepository.findOne.mockResolvedValue({ close: 100 });
      jest.spyOn(service as any, 'getUserInstrumentHoldings').mockResolvedValue(5);
      (service as any).saveOrder = jest.fn().mockResolvedValue({ status: OrderStatus.REJECTED } as Order);

      const result = await service.createOrder({
        userId: 1,
        instrumentId: 1,
        side: OrderSide.SELL,
        type: OrderType.MARKET,
        price: 100,
        size: 10, // User tries to sell 10 shares
      });

      expect(result.status).toBe(OrderStatus.REJECTED);
      expect((service as any).saveOrder).toHaveBeenCalledWith(
        expect.objectContaining({ status: OrderStatus.REJECTED }),
        expect.any(Object),
        expect.any(Object),
      );
    });

    it('should accept a SELL order if user has sufficient shares', async () => {
      mockUsersRepository.findOneBy.mockResolvedValue({ id: 1 });
      mockInstrumentsRepository.findOneBy.mockResolvedValue({ id: 1, ticker: 'AAPL' });
      mockMarketDataRepository.findOne.mockResolvedValue({ close: 100 });
      jest.spyOn(service as any, 'getUserInstrumentHoldings').mockResolvedValue(20); // User owns 20 shares
      (service as any).saveOrder = jest.fn().mockResolvedValue({ status: OrderStatus.FILLED } as Order);

      const result = await service.createOrder({
        userId: 1,
        instrumentId: 1,
        side: OrderSide.SELL,
        type: OrderType.MARKET,
        price: 100,
        size: 10,
      });

      expect(result.status).toBe(OrderStatus.FILLED);
      expect((service as any).saveOrder).toHaveBeenCalledWith(
        expect.objectContaining({ status: OrderStatus.FILLED }),
        expect.any(Object),
        expect.any(Object),
      );
    });
  });
});

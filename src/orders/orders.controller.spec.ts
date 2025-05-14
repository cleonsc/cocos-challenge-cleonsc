import { Test, TestingModule } from '@nestjs/testing';
import { Instrument } from 'src/entities/instrument.entity';
import { Order } from 'src/entities/order.entity';
import { User } from 'src/entities/user.entity';
import { OrderSide, OrderStatus, OrderType } from 'src/enums/order.enums';
import { CreateOrderDto } from './dto/createOrder.dto';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

describe('OrdersController', () => {
  let controller: OrdersController;
  let service: OrdersService;

  const mockOrdersService = {
    createOrder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [{
        provide: OrdersService,
        useValue: mockOrdersService,
      },],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    service = module.get<OrdersService>(OrdersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createOrder', () => {
    it('should call OrdersService.createOrder with the correct DTO', async () => {
      const dto: CreateOrderDto = {
        userId: 1,
        instrumentId: 1,
        side: OrderSide.BUY,
        type: OrderType.MARKET,
        price: 100,
        size: 10,
      };

      const mockOrder: Order = {
        id: 1,
        user: { id: 1, name: 'Test User' } as unknown as User,
        instrument: { id: 1, ticker: 'AAPL' } as Instrument,
        side: OrderSide.BUY,
        type: OrderType.MARKET,
        price: 100,
        size: 10,
        status: OrderStatus.FILLED,
        datetime: new Date(),
      };

      mockOrdersService.createOrder.mockResolvedValue(mockOrder);

      const result = await controller.createOrder(dto);

      expect(service.createOrder).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockOrder);
    });

    it('should throw an error if OrdersService.createOrder fails', async () => {
      const dto: CreateOrderDto = {
        userId: 1,
        instrumentId: 1,
        side: OrderSide.BUY,
        type: OrderType.MARKET,
        price: 100,
        size: 10,
      };

      mockOrdersService.createOrder.mockRejectedValue(new Error('Service error'));

      await expect(controller.createOrder(dto)).rejects.toThrow('Service error');
      expect(service.createOrder).toHaveBeenCalledWith(dto);
    });
  });
});

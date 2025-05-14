import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { OrderSide, OrderType } from 'src/enums/order.enums';
import { CreateOrderDto } from 'src/orders/dto/createOrder.dto';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { loadSqlFixture } from './utils/load-sql-fixtures';

describe('OrdersController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = app.get(DataSource);
    await loadSqlFixture(dataSource, 'seed-e2e.sql');
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  it('should create an order successfully', async () => {
    const dto: CreateOrderDto = {
      userId: 3,
      instrumentId: 1,
      side: OrderSide.BUY,
      type: OrderType.MARKET,
      price: 100,
      size: 10,
    };

    const response = await request(app.getHttpServer())
      .post('/orders')
      .send(dto)
      .expect(201);

    const order = response.body;
    expect(order).toBeDefined();
    expect(order.id).toBeDefined();
    expect(order.side).toBe(dto.side);
    expect(order.type).toBe(dto.type);
    expect(order.price).toBe("259.00");
    expect(order.size).toBe(dto.size);
    expect(order.status).toBe("FILLED");
    expect(order.datetime).toBeDefined();
    expect(order.instrument).toBeDefined();
    expect(order.instrument.id).toBe(dto.instrumentId);
    expect(order.instrument.ticker).toBe('DYCA');
    expect(order.user).toBeDefined();
    expect(order.user.id).toBe(dto.userId);
    expect(order.user.email).toBe('francisco@test.com');
  });

  it('should return 400 if validation fails', async () => {
    const invalidDto = {
      instrumentId: 1,
    };

    const response = await request(app.getHttpServer())
      .post('/orders')
      .send(invalidDto)
      .expect(400);

    expect(response.body.message).toContain('Size or investment amount is required and must be greater than zero');
  });
});
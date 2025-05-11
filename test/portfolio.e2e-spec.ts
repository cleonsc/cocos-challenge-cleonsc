import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from './../src/app.module';
import { loadSqlFixture } from './utils/load-sql-fixtures';

describe('PortfolioController (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = app.get(DataSource);
    await loadSqlFixture(dataSource, 'seed-e2e.sql');
    jest.spyOn(console, 'warn').mockImplementation(() => { }); // Suppress console.warn in tests
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  it('/portfolio/:userId (GET) - should return the portfolio for a user', async () => {
    const userId = 1;

    const response = await request(app.getHttpServer())
      .get(`/portfolio/${userId}`)
      .expect(200);

    expect(response.body).toBeDefined();
    expect(response.body.userId).toBe(userId);
    expect(response.body.positions).toHaveLength(2);
    expect(response.body.totalValue).toBe(904784);
    expect(response.body.availableCash).toBe(753000);

    const [shareOne, shareTwo] = response.body.positions;
    expect(shareOne.instrumentId).toBe(47);
    expect(shareOne.ticker).toBe('PAMP');
    expect(shareOne.quantity).toBe(40);
    expect(shareOne.marketValue).toBe(37034);
    expect(shareOne.performance).toBeCloseTo(-0.4462365591397825, 12);

    expect(shareTwo.instrumentId).toBe(54);
    expect(shareTwo.ticker).toBe('METR');
    expect(shareTwo.quantity).toBe(500);
    expect(shareTwo.marketValue).toBe(114750);
    expect(shareTwo.performance).toBeCloseTo(-8.200000000000001, 12);

  });

  it('/portfolio/:userId (GET) - should return an empty portfolio for a user with no orders', async () => {
    const userId = 2;

    const response = await request(app.getHttpServer())
      .get(`/portfolio/${userId}`)
      .expect(200);

    expect(response.body).toEqual({
      userId,
      totalValue: 0,
      availableCash: 0,
      positions: [],
    });
  });
});
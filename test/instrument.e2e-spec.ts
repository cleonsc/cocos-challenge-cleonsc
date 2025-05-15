import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from './../src/app.module';
import { loadSqlFixture } from './utils/load-sql-fixtures';

describe('InstrumentsController (e2e)', () => {
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

  it('/instruments/search (GET) - should return instruments filtered by ticker', async () => {
    const response = await request(app.getHttpServer())
      .get('/instruments/search')
      .query({ ticker: 'GGAL' })
      .expect(200);

    expect(response.body).toBeDefined();
    expect(response.body).toHaveLength(1);
    expect(response.body[0].ticker).toBe('GGAL');
    expect(response.body[0].name).toBe('Grupo Financiero Galicia');
  });

  it('/instruments/search (GET) - should return instruments filtered by name', async () => {
    const response = await request(app.getHttpServer())
      .get('/instruments/search')
      .query({ name: 'Agrometal' })
      .expect(200);

    expect(response.body).toBeDefined();
    expect(response.body).toHaveLength(1);
    expect(response.body[0].ticker).toBe('AGRO');
    expect(response.body[0].name).toBe('Agrometal');
  });

  it('/instruments/search (GET) - should return instruments filtered by both ticker and name', async () => {
    const response = await request(app.getHttpServer())
      .get('/instruments/search')
      .query({ ticker: 'AGRO', name: 'Aluar' })
      .expect(200);

    expect(response.body).toBeDefined();
    expect(response.body).toHaveLength(2);
    expect(response.body.map((instrument: { ticker: string; }) => instrument.ticker)).toEqual(['AGRO', 'ALUA']);
  });

  it('/instruments/search (GET) - should return all instruments if no filters are provided', async () => {
    const response = await request(app.getHttpServer())
      .get('/instruments/search')
      .expect(200);

    expect(response.body).toBeDefined();
    expect(response.body).toHaveLength(66);
  });

  it('/instruments/search (GET) - should return an empty array if no instruments match the filters', async () => {
    const response = await request(app.getHttpServer())
      .get('/instruments/search')
      .query({ ticker: 'XYZ', name: 'Unknown' })
      .expect(200);

    expect(response.body).toBeDefined();
    expect(response.body).toHaveLength(0);
  });
});
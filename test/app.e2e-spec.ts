import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from './../src/app.module';
import { loadSqlFixture } from './utils/load-sql-fixtures';

describe('AppController (e2e)', () => {
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
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('should load users data and work', async () => {
    const result = await dataSource.query('SELECT COUNT(*) FROM users');
    expect(parseInt(result[0].count)).toBe(4);
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Instrument } from 'src/entities/instrument.entity';
import { MarketData } from 'src/entities/marketdata.entity';
import { Order } from 'src/entities/order.entity';
import { PortfolioService } from './portfolio.service';

describe('PortfolioService', () => {
  let service: PortfolioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PortfolioService,
        {
          provide: getRepositoryToken(Order),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Instrument),
          useValue: {},
        },
        {
          provide: getRepositoryToken(MarketData),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<PortfolioService>(PortfolioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

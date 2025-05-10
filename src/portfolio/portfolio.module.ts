import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Instrument } from 'src/entities/instrument.entity';
import { MarketData } from 'src/entities/marketdata.entity';
import { Order } from 'src/entities/order.entity';
import { User } from 'src/entities/user.entity';
import { PortfolioController } from './portfolio.controller';
import { PortfolioService } from './portfolio.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, User, Instrument, MarketData]),
  ],
  providers: [PortfolioService],
  controllers: [PortfolioController]
})
export class PortfolioModule { }

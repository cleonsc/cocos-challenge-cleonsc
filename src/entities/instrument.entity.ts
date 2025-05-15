import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { MarketData } from './marketdata.entity';
import { Order } from './order.entity';

@Entity({ name: 'instruments' })
export class Instrument {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  ticker: string;

  @Column()
  name: string;

  @Column()
  type: string;

  @OneToMany(() => Order, order => order.instrument)
  orders: Order[];

  @OneToMany(() => MarketData, data => data.instrument)
  marketData: MarketData[];
}
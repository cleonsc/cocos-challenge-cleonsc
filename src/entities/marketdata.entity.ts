import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Instrument } from './instrument.entity';

@Entity({ name: 'marketdata' })
export class MarketData {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  instrumentId: number;

  @Column('decimal')
  high: number;

  @Column('decimal')
  low: number;

  @Column('decimal')
  open: number;

  @Column('decimal')
  close: number;

  @Column('decimal')
  previousClose: number;

  @Column({ type: 'timestamp' })
  datetime: Date;

  @ManyToOne(() => Instrument, instrument => instrument.marketData)
  instrument: Instrument;
}
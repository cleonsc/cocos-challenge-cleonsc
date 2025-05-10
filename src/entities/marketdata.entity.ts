import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Instrument } from './instrument.entity';

@Entity({ name: 'marketdata' })
export class MarketData {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal')
  high: number;

  @Column('decimal')
  low: number;

  @Column('decimal')
  open: number;

  @Column('decimal')
  close: number;

  @Column('decimal', { name: 'previousclose' })
  previousClose: number;

  @Column({ type: 'timestamp', name: 'date' })
  date: Date;

  @ManyToOne(() => Instrument, instrument => instrument.marketData)
  @JoinColumn({ name: 'instrumentid' })
  instrument: Instrument;
}
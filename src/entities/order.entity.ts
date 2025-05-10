import { OrderSide, OrderStatus, OrderType } from 'src/enums/order.enums';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Instrument } from './instrument.entity';
import { User } from './user.entity';

@Entity({ name: 'orders' })
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: OrderSide,
  })
  side: OrderSide;

  @Column('decimal')
  size: number;

  @Column('decimal', { precision: 3, scale: 2 })
  price: number;

  @Column({ type: 'enum', enum: OrderType })
  type: OrderType;

  @Column({ type: 'enum', enum: OrderStatus })
  status: OrderStatus;

  @Column({ type: 'timestamp' })
  datetime: Date;

  @ManyToOne(() => Instrument, { eager: true })
  @JoinColumn({ name: 'instrumentid' })
  instrument: Instrument;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'userid' })
  user: User;
}

import { OrderSide, OrderStatus, OrderType } from 'src/enums/order.enums';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Instrument } from './instrument.entity';
import { User } from './user.entity';

@Entity({ name: 'orders' })
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  instrumentId: number;

  @Column()
  userId: number;

  @Column({
    type: 'enum',
    enum: OrderSide,
  })
  side: OrderSide;

  @Column('decimal')
  size: number;

  @Column('decimal', { precision: 12, scale: 2 })
  price: number;

  @Column({ type: 'enum', enum: OrderType, })
  type: OrderType;

  @Column({ type: 'enum', enum: OrderStatus, })
  status: OrderStatus;

  @Column({ type: 'timestamp' })
  datetime: Date;

  @ManyToOne(() => Instrument, instrument => instrument.orders)
  instrument: Instrument;

  @ManyToOne(() => User, user => user.orders)
  user: User;
}
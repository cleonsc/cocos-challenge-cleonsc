import { IsEnum, IsNotEmpty, IsOptional, IsPositive } from 'class-validator';
import { OrderSide, OrderType } from 'src/enums/order.enums';

export class CreateOrderDto {
  @IsNotEmpty()
  instrumentId: number;

  @IsEnum(OrderSide)
  side: OrderSide;

  @IsEnum(OrderType)
  type: OrderType;

  @IsOptional()
  @IsPositive()
  size?: number;

  @IsOptional()
  @IsPositive()
  investmentAmount?: number;

  @IsOptional()
  @IsPositive()
  price?: number;

  @IsNotEmpty()
  userId: number;
}
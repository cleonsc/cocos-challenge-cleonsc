import { OrderSide } from 'src/enums/order.enums';

export const mockOrders = [
  {
    instrument: { id: 66, type: 'MONEDA', name: 'ARS', ticker: 'ARS' },
    size: 1000000,
    price: 1,
    side: OrderSide.CASH_IN,
    datetime: new Date('2023-07-12T12:11:20Z'),
  },
  {
    instrument: { id: 47, type: 'ACCIONES', name: 'Pampa Holding S.A.', ticker: 'PAMP' },
    size: 50,
    price: 930,
    side: OrderSide.BUY,
    datetime: new Date('2023-07-12T12:31:20Z'),
  },
  {
    instrument: { id: 47, type: 'ACCIONES', name: 'Pampa Holding S.A.', ticker: 'PAMP' },
    size: 10,
    price: 940,
    side: OrderSide.SELL,
    datetime: new Date('2023-07-12T14:51:20Z'),
  },
  {
    instrument: { id: 66, type: 'MONEDA', name: 'ARS', ticker: 'ARS' },
    size: 100000,
    price: 1,
    side: OrderSide.CASH_OUT,
    datetime: new Date('2023-07-13T12:31:20Z'),
  },
  {
    instrument: { id: 31, type: 'ACCIONES', name: 'Banco Macro S.A.', ticker: 'BMA' },
    size: 20,
    price: 1540,
    side: OrderSide.BUY,
    datetime: new Date('2023-07-13T12:51:20Z'),
  },
  {
    instrument: { id: 54, type: 'ACCIONES', name: 'MetroGAS S.A.', ticker: 'METR' },
    size: 500,
    price: 250,
    side: OrderSide.BUY,
    datetime: new Date('2023-07-13T14:11:20Z'),
  },
  {
    instrument: { id: 31, type: 'ACCIONES', name: 'Banco Macro S.A.', ticker: 'BMA' },
    size: 30,
    price: 1530,
    side: OrderSide.SELL,
    datetime: new Date('2023-07-13T15:13:20Z'),
  },
]

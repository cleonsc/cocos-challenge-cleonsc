import { Instrument } from 'src/entities/instrument.entity';

export interface SharePosition {
  instrument: Instrument;
  totalSize: number;
  totalSpent: number;
}

export interface ShareBalancePosition {
  instrumentId: number;
  ticker: string;
  name: string;
  quantity: number;
  marketValue: number;
  performance: number;
}

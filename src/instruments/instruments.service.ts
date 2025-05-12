import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Instrument } from 'src/entities/instrument.entity';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { SearchInstrumentDto } from './dto/searchInstrument.dto';

@Injectable()
export class InstrumentsService {
  constructor(
    @InjectRepository(Instrument)
    private instrumentsRepository: Repository<Instrument>,
  ) { }

  async searchInstruments(dto: SearchInstrumentDto): Promise<Instrument[]> {
    const { ticker, name } = dto;

    const conditions: FindOptionsWhere<Instrument>[] = [];

    if (ticker) {
      conditions.push({ ticker: ILike(`%${ticker}%`) });
    }

    if (name) {
      conditions.push({ name: ILike(`%${name}%`) });
    }

    if (conditions.length === 0) {
      // No hay filtros: devolver todos (funcionalidad extra)
      return this.instrumentsRepository.find();
    }

    return this.instrumentsRepository.find({
      where: conditions,
    });
  }
}

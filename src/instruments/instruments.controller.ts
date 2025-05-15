import { Controller, Get, Query } from '@nestjs/common';
import { Instrument } from 'src/entities/instrument.entity';
import { SearchInstrumentDto } from './dto/searchInstrument.dto';
import { InstrumentsService } from './instruments.service';

@Controller('instruments')
export class InstrumentsController {
  constructor(private readonly instrumentsService: InstrumentsService) { }

  @Get('search')
  async search(@Query() dto: SearchInstrumentDto): Promise<Instrument[]> {
    return this.instrumentsService.searchInstruments(dto);
  }
}

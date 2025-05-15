import { IsOptional, IsString } from 'class-validator';

export class SearchInstrumentDto {
  @IsOptional()
  @IsString()
  ticker?: string;

  @IsOptional()
  @IsString()
  name?: string;
}

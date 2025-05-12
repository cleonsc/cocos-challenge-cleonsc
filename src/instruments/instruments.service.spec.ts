import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Instrument } from 'src/entities/instrument.entity';
import { ILike } from 'typeorm';
import { InstrumentsService } from './instruments.service';

describe('InstrumentsService', () => {
  let service: InstrumentsService;

  const mockInstrumentRepository = {
    find: jest.fn(),
  };

  const mockInstruments = [
    { id: 1, ticker: 'AAPL', name: 'Apple Inc.' },
    { id: 2, ticker: 'GOOGL', name: 'Alphabet Inc.' },
    { id: 3, ticker: 'MSFT', name: 'Microsoft Corp.' },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InstrumentsService, {
        provide: getRepositoryToken(Instrument),
        useValue: mockInstrumentRepository,
      },],
    }).compile();

    service = module.get<InstrumentsService>(InstrumentsService);

  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('searchInstruments', () => {
    it('should return all instruments if no filters are provided', async () => {
      mockInstrumentRepository.find.mockResolvedValue(mockInstruments);

      const result = await service.searchInstruments({});
      expect(mockInstrumentRepository.find).toHaveBeenCalledWith();
      expect(result).toEqual(mockInstruments);
    });

    it('should filter instruments by ticker', async () => {
      const filteredInstruments = [{ id: 1, ticker: 'AAPL', name: 'Apple Inc.' }];
      mockInstrumentRepository.find.mockResolvedValue(filteredInstruments);

      const result = await service.searchInstruments({ ticker: 'AAPL' });
      expect(mockInstrumentRepository.find).toHaveBeenCalledWith({
        where: [{ ticker: ILike('%AAPL%') }],
      });
      expect(result).toEqual(filteredInstruments);
    });

    it('should filter instruments by name', async () => {
      const filteredInstruments = [{ id: 2, ticker: 'GOOGL', name: 'Alphabet Inc.' }];
      mockInstrumentRepository.find.mockResolvedValue(filteredInstruments);

      const result = await service.searchInstruments({ name: 'Alphabet' });
      expect(mockInstrumentRepository.find).toHaveBeenCalledWith({
        where: [{ name: ILike('%Alphabet%') }],
      });
      expect(result).toEqual(filteredInstruments);
    });

    it('should filter instruments by both ticker and name', async () => {
      const filteredInstruments = [
        { id: 1, ticker: 'AAPL', name: 'Apple Inc.' },
        { id: 2, ticker: 'GOOGL', name: 'Alphabet Inc.' },
      ];
      mockInstrumentRepository.find.mockResolvedValue(filteredInstruments);

      const result = await service.searchInstruments({ ticker: 'A', name: 'Inc.' });
      expect(mockInstrumentRepository.find).toHaveBeenCalledWith({
        where: [
          { ticker: ILike('%A%') },
          { name: ILike('%Inc.%') },
        ],
      });
      expect(result).toEqual(filteredInstruments);
    });
  });
});

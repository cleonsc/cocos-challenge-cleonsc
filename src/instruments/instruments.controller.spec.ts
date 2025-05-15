import { Test, TestingModule } from '@nestjs/testing';
import { InstrumentsController } from './instruments.controller';
import { InstrumentsService } from './instruments.service';

describe('InstrumentsController', () => {
  let controller: InstrumentsController;
  let service: InstrumentsService;

  const mockInstruments = [
    { id: 1, ticker: 'AAPL', name: 'Apple Inc.' },
    { id: 2, ticker: 'GOOGL', name: 'Alphabet Inc.' },
  ];

  const mockInstrumentsService = {
    searchInstruments: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InstrumentsController],
      providers: [{
        provide: InstrumentsService,
        useValue: mockInstrumentsService,
      }],
    }).compile();

    controller = module.get<InstrumentsController>(InstrumentsController);
    service = module.get<InstrumentsService>(InstrumentsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('search', () => {
    it('should call InstrumentsService.searchInstruments with the correct parameters', async () => {
      const dto = { ticker: 'AAPL', name: 'Apple' };
      mockInstrumentsService.searchInstruments.mockResolvedValue(mockInstruments);

      const result = await controller.search(dto);

      expect(service.searchInstruments).toHaveBeenCalledWith(dto);
      expect(result.length).toEqual(2);
      expect(result).toEqual(mockInstruments);

    });

    it('should return an empty array if no instruments are found', async () => {
      const dto = { ticker: 'XYZ', name: 'Unknown' };
      mockInstrumentsService.searchInstruments.mockResolvedValue([]);

      const result = await controller.search(dto);

      expect(service.searchInstruments).toHaveBeenCalledWith(dto);
      expect(result.length).toEqual(0);
      expect(result).toEqual([]);
    });
  });
});

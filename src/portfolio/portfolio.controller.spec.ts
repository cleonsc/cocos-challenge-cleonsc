import { Test, TestingModule } from '@nestjs/testing';
import { PortfolioController } from './portfolio.controller';
import { PortfolioService } from './portfolio.service';

describe('PortfolioController', () => {
  let controller: PortfolioController;
  let service: PortfolioService;


  const mockPortfolioService = {
    getPortfolio: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PortfolioController],
      providers: [
        {
          provide: PortfolioService,
          useValue: mockPortfolioService,
        },
      ],
    }).compile();

    controller = module.get<PortfolioController>(PortfolioController);
    service = module.get<PortfolioService>(PortfolioService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getPortfolio', () => {
    it('should call PortfolioService.getPortfolio with the correct userId', async () => {
      const mockPortfolio = {
        userId: 1,
        totalValue: 1000,
        availableCash: 500,
        positions: [],
      };
      mockPortfolioService.getPortfolio.mockResolvedValue(mockPortfolio);

      const userId = 1;
      const result = await controller.getPortfolio(userId);

      expect(service.getPortfolio).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockPortfolio);
    });

    it('should return an empty portfolio if the service returns an empty result', async () => {
      const mockPortfolio = {
        userId: 2,
        totalValue: 0,
        availableCash: 0,
        positions: [],
      };
      mockPortfolioService.getPortfolio.mockResolvedValue(mockPortfolio);

      const userId = 2;
      const result = await controller.getPortfolio(userId);

      expect(service.getPortfolio).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockPortfolio);
    });
  });
});

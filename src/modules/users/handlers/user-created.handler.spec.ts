import { Test, TestingModule } from '@nestjs/testing';
import { UserCreatedHandler } from './user-created.handler';
import { ProcessedEventRepository } from '../repository/processed-event.repository';
import { UserCreatedV1Event } from '../events/user-created-v1.event';

describe('UserCreatedHandler', () => {
  let handler: UserCreatedHandler;
  let processedEventRepo: jest.Mocked<ProcessedEventRepository>;

  beforeEach(async () => {
    const mockProcessedEventRepo = {
      isProcessed: jest.fn(),
      markProcessed: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserCreatedHandler,
        {
          provide: ProcessedEventRepository,
          useValue: mockProcessedEventRepo,
        },
      ],
    }).compile();

    handler = module.get<UserCreatedHandler>(UserCreatedHandler);
    processedEventRepo = module.get(ProcessedEventRepository);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('handle', () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('should process new event and mark as processed', async () => {
      const event = new UserCreatedV1Event(
        'event-123',
        1,
        1,
        1, // Admin role
      );

      processedEventRepo.isProcessed.mockResolvedValue(false);
      processedEventRepo.markProcessed.mockResolvedValue({
        id: 'event-123',
        processedAt: new Date(),
      });

      await handler.handle(event);

      expect(processedEventRepo.isProcessed).toHaveBeenCalledWith('event-123');
      expect(consoleSpy).toHaveBeenCalledWith(
        `User created: 
      ID=1, 
      version=1, 
      storeId=1, 
      role=1`,
      );
      expect(processedEventRepo.markProcessed).toHaveBeenCalledWith('event-123');
    });

    it('should skip processing if event already processed (idempotency)', async () => {
      const event = new UserCreatedV1Event(
        'event-123',
        1,
        1,
        2, // Different role
      );

      processedEventRepo.isProcessed.mockResolvedValue(true);

      await handler.handle(event);

      expect(processedEventRepo.isProcessed).toHaveBeenCalledWith('event-123');
      expect(consoleSpy).not.toHaveBeenCalled();
      expect(processedEventRepo.markProcessed).not.toHaveBeenCalled();
    });

    it('should handle different event data correctly', async () => {
      const event = new UserCreatedV1Event(
        'event-456',
        42,
        5,
        3, // Different role
      );

      processedEventRepo.isProcessed.mockResolvedValue(false);
      processedEventRepo.markProcessed.mockResolvedValue({
        id: 'event-456',
        processedAt: new Date(),
      });

      await handler.handle(event);

      expect(processedEventRepo.isProcessed).toHaveBeenCalledWith('event-456');
      expect(consoleSpy).toHaveBeenCalledWith(
        `User created: 
      ID=42, 
      version=1, 
      storeId=5, 
      role=3`,
      );
      expect(processedEventRepo.markProcessed).toHaveBeenCalledWith('event-456');
    });

    it('should handle repository errors during isProcessed check', async () => {
      const event = new UserCreatedV1Event('event-123', 1, 1, 1);
      const error = new Error('Database connection failed');

      processedEventRepo.isProcessed.mockRejectedValue(error);

      await expect(handler.handle(event)).rejects.toThrow(error);
      expect(processedEventRepo.markProcessed).not.toHaveBeenCalled();
    });

    it('should handle repository errors during markProcessed', async () => {
      const event = new UserCreatedV1Event('event-123', 1, 1, 1);
      const error = new Error('Failed to mark as processed');

      processedEventRepo.isProcessed.mockResolvedValue(false);
      processedEventRepo.markProcessed.mockRejectedValue(error);

      await expect(handler.handle(event)).rejects.toThrow(error);
      expect(consoleSpy).toHaveBeenCalled();
    });
  });
});

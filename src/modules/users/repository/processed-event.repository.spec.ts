import { Test, TestingModule } from '@nestjs/testing';
import { ProcessedEventRepository } from './processed-event.repository';
import { PrismaService } from '@database/prisma/prisma.service';
import { UserProcessedEvent } from '@prisma/client';

describe('ProcessedEventRepository', () => {
  let repository: ProcessedEventRepository;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const mockPrismaService = {
      userProcessedEvent: {
        update: jest.fn(),
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessedEventRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<ProcessedEventRepository>(ProcessedEventRepository);
    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('markProcessed', () => {
    it('should mark an event as processed', async () => {
      const eventId = 'event-123';
      const mockProcessedEvent: UserProcessedEvent = {
        id: eventId,
        processedAt: new Date(),
      };

      (prismaService.userProcessedEvent.update as jest.Mock).mockResolvedValue(mockProcessedEvent);

      const result = await repository.markProcessed(eventId);

      expect(prismaService.userProcessedEvent.update).toHaveBeenCalledWith({
        where: { id: eventId },
        data: { processedAt: expect.any(Date) },
      });
      expect(result).toEqual(mockProcessedEvent);
    });

    it('should throw error if event does not exist', async () => {
      const eventId = 'non-existent-event';
      const error = new Error('Event not found');

      (prismaService.userProcessedEvent.update as jest.Mock).mockRejectedValue(error);

      await expect(repository.markProcessed(eventId)).rejects.toThrow(error);
    });
  });

  describe('isProcessed', () => {
    it('should return true if event is processed', async () => {
      const eventId = 'event-123';
      const mockProcessedEvent: UserProcessedEvent = {
        id: eventId,
        processedAt: new Date(),
      };

      (prismaService.userProcessedEvent.findUnique as jest.Mock).mockResolvedValue(
        mockProcessedEvent,
      );

      const result = await repository.isProcessed(eventId);

      expect(prismaService.userProcessedEvent.findUnique).toHaveBeenCalledWith({
        where: { id: eventId },
      });
      expect(result).toBe(true);
    });

    it('should return false if event is not processed', async () => {
      const eventId = 'event-123';

      (prismaService.userProcessedEvent.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.isProcessed(eventId);

      expect(prismaService.userProcessedEvent.findUnique).toHaveBeenCalledWith({
        where: { id: eventId },
      });
      expect(result).toBe(false);
    });

    it('should handle database errors', async () => {
      const eventId = 'event-123';
      const error = new Error('Database connection failed');

      (prismaService.userProcessedEvent.findUnique as jest.Mock).mockRejectedValue(error);

      await expect(repository.isProcessed(eventId)).rejects.toThrow(error);
    });
  });
});

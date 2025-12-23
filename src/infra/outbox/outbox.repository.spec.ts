import { Test, TestingModule } from '@nestjs/testing';
import { OutboxRepository } from './outbox.repository';
import { PrismaService } from '../database/prisma/prisma.service';
import { OutboxEvent, OutboxStatus, OutboxType } from 'prisma/generated/client';

describe('OutboxRepository', () => {
  let repository: OutboxRepository;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const mockPrismaService = {
      outboxEvent: {
        findMany: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OutboxRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<OutboxRepository>(OutboxRepository);
    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findUnpublished', () => {
    it('should find unpublished events with default limit', async () => {
      const mockEvents: OutboxEvent[] = [
        {
          id: 'event-1',
          type: 'USER_CREATED' as OutboxType,
          payload: { userId: 1 },
          version: 1,
          status: OutboxStatus.PENDING,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (prismaService.outboxEvent.findMany as jest.Mock).mockResolvedValue(mockEvents);

      const result = await repository.findUnpublished();

      expect(prismaService.outboxEvent.findMany).toHaveBeenCalledWith({
        where: { status: OutboxStatus.PENDING },
        orderBy: { createdAt: 'asc' },
        take: 100,
      });
      expect(result).toEqual(mockEvents);
    });

    it('should find unpublished events with custom limit', async () => {
      const mockEvents: OutboxEvent[] = [];
      const customLimit = 50;

      (prismaService.outboxEvent.findMany as jest.Mock).mockResolvedValue(mockEvents);

      const result = await repository.findUnpublished(customLimit);

      expect(prismaService.outboxEvent.findMany).toHaveBeenCalledWith({
        where: { status: OutboxStatus.PENDING },
        orderBy: { createdAt: 'asc' },
        take: customLimit,
      });
      expect(result).toEqual(mockEvents);
    });

    it('should handle database errors', async () => {
      const error = new Error('Database connection failed');

      (prismaService.outboxEvent.findMany as jest.Mock).mockRejectedValue(error);

      await expect(repository.findUnpublished()).rejects.toThrow(error);
    });
  });

  describe('markPublished', () => {
    it('should mark event as published', async () => {
      const eventId = 'event-123';
      const mockUpdatedEvent: OutboxEvent = {
        id: eventId,
        type: OutboxType.USER_CREATED,
        payload: { userId: 1 },
        version: 1,
        status: OutboxStatus.PUBLISHED,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prismaService.outboxEvent.update as jest.Mock).mockResolvedValue(mockUpdatedEvent);

      const result = await repository.markPublished(eventId);

      expect(prismaService.outboxEvent.update).toHaveBeenCalledWith({
        where: { id: eventId },
        data: { status: OutboxStatus.PUBLISHED },
      });
      expect(result).toEqual(mockUpdatedEvent);
    });

    it('should throw error if event does not exist', async () => {
      const eventId = 'non-existent-event';
      const error = new Error('Event not found');

      (prismaService.outboxEvent.update as jest.Mock).mockRejectedValue(error);

      await expect(repository.markPublished(eventId)).rejects.toThrow(error);
    });
  });
});

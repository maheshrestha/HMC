import { Test, TestingModule } from '@nestjs/testing';
import { OutboxProcessor } from './outbox.processor';
import { OutboxRepository } from './outbox.repository';
import { EventBus } from '@nestjs/cqrs';
import { OutboxEvent, OutboxStatus, OutboxType } from 'prisma/generated/client';

describe('OutboxProcessor', () => {
  let processor: OutboxProcessor;
  let outboxRepository: jest.Mocked<OutboxRepository>;
  let eventBus: jest.Mocked<EventBus>;

  beforeEach(async () => {
    const mockOutboxRepository = {
      findUnpublished: jest.fn(),
      markPublished: jest.fn(),
    };

    const mockEventBus = {
      publish: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OutboxProcessor,
        {
          provide: OutboxRepository,
          useValue: mockOutboxRepository,
        },
        {
          provide: EventBus,
          useValue: mockEventBus,
        },
      ],
    }).compile();

    processor = module.get<OutboxProcessor>(OutboxProcessor);
    outboxRepository = module.get(OutboxRepository);
    eventBus = module.get(EventBus);
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });

  describe('processPendingEvents', () => {
    it('should process pending events successfully', async () => {
      const mockEvents: OutboxEvent[] = [
        {
          id: 'event-1',
          type: OutboxType.USER_CREATED,
          payload: { userId: 1, storeId: 1, role: 1 },
          version: 1,
          status: OutboxStatus.PENDING,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'event-2',
          type: OutboxType.USER_CREATED,
          payload: { userId: 2, storeId: 1, role: 2 },
          version: 1,
          status: OutboxStatus.PENDING,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      outboxRepository.findUnpublished.mockResolvedValue(mockEvents);
      outboxRepository.markPublished.mockResolvedValue({
        ...mockEvents[0],
        status: OutboxStatus.PUBLISHED,
      });

      await processor.processPendingEvents();

      expect(outboxRepository.findUnpublished).toHaveBeenCalledWith(100);
      expect(eventBus.publish).toHaveBeenCalledTimes(2);
      expect(eventBus.publish).toHaveBeenNthCalledWith(1, mockEvents[0].payload);
      expect(eventBus.publish).toHaveBeenNthCalledWith(2, mockEvents[1].payload);
      expect(outboxRepository.markPublished).toHaveBeenCalledTimes(2);
      expect(outboxRepository.markPublished).toHaveBeenNthCalledWith(1, 'event-1');
      expect(outboxRepository.markPublished).toHaveBeenNthCalledWith(2, 'event-2');
    });

    it('should handle empty pending events list', async () => {
      outboxRepository.findUnpublished.mockResolvedValue([]);

      await processor.processPendingEvents();

      expect(outboxRepository.findUnpublished).toHaveBeenCalledWith(100);
      expect(eventBus.publish).not.toHaveBeenCalled();
      expect(outboxRepository.markPublished).not.toHaveBeenCalled();
    });

    it('should handle event publishing errors gracefully', async () => {
      const mockEvents: OutboxEvent[] = [
        {
          id: 'event-1',
          type: OutboxType.USER_CREATED,
          payload: { userId: 1, storeId: 1, role: 1 },
          version: 1,
          status: OutboxStatus.PENDING,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      outboxRepository.findUnpublished.mockResolvedValue(mockEvents);
      eventBus.publish.mockImplementation(() => {
        throw new Error('Event bus error');
      });

      await processor.processPendingEvents();

      expect(outboxRepository.findUnpublished).toHaveBeenCalledWith(100);
      expect(eventBus.publish).toHaveBeenCalledWith(mockEvents[0].payload);
      expect(consoleSpy).toHaveBeenCalledWith('Failed to publish event', expect.any(Error));
      expect(outboxRepository.markPublished).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should handle mixed success and failure scenarios', async () => {
      const mockEvents: OutboxEvent[] = [
        {
          id: 'event-1',
          type: OutboxType.USER_CREATED,
          payload: { userId: 1, storeId: 1, role: 1 },
          version: 1,
          status: OutboxStatus.PENDING,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'event-2',
          type: OutboxType.USER_CREATED,
          payload: { userId: 2, storeId: 1, role: 2 },
          version: 1,
          status: OutboxStatus.PENDING,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      outboxRepository.findUnpublished.mockResolvedValue(mockEvents);
      eventBus.publish
        .mockImplementationOnce(() => {
          throw new Error('First event failed');
        })
        .mockImplementationOnce(() => {
          // Second event succeeds
        });

      outboxRepository.markPublished.mockResolvedValue({
        ...mockEvents[1],
        status: OutboxStatus.PUBLISHED,
      });

      await processor.processPendingEvents();

      expect(eventBus.publish).toHaveBeenCalledTimes(2);
      expect(consoleSpy).toHaveBeenCalledWith('Failed to publish event', expect.any(Error));
      expect(outboxRepository.markPublished).toHaveBeenCalledTimes(1);
      expect(outboxRepository.markPublished).toHaveBeenCalledWith('event-2');

      consoleSpy.mockRestore();
    });

    it('should handle repository errors', async () => {
      const error = new Error('Database connection failed');

      outboxRepository.findUnpublished.mockRejectedValue(error);

      await expect(processor.processPendingEvents()).rejects.toThrow(error);
    });
  });
});

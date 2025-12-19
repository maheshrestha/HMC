import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { OutboxRepository } from './outbox.repository';

@Injectable()
export class OutboxProcessor {
  constructor(
    private readonly outboxRepository: OutboxRepository,
    private readonly eventBus: EventBus,
  ) {}

  async processPendingEvents(): Promise<void> {
    const events = await this.outboxRepository.findUnpublished(100);

    for (const event of events) {
      try {
        this.eventBus.publish(event.payload);
        await this.outboxRepository.markPublished(event.id);
      } catch (err) {
        console.error('Failed to publish event', err);
      }
    }
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/infra/database/prisma/prisma.service';
import { UserProcessedEvent } from 'prisma/generated/client';

/**
 * Repository for managing processed event tracking.
 *
 * This repository provides idempotency guarantees for event processing
 * by tracking which events have already been handled. It uses the
 * UserProcessedEvent table to store event processing status.
 */
@Injectable()
export class ProcessedEventRepository {
  constructor(private prisma: PrismaService) {}

  /**
   * Marks an event as processed by recording it in the database.
   *
   * @param id - The unique identifier of the event
   * @returns The created UserProcessedEvent record
   */
  async markProcessed(id: string): Promise<UserProcessedEvent> {
    return this.prisma.userProcessedEvent.update({
      where: { id },
      data: { processedAt: new Date() },
    });
  }

  /**
   * Checks if an event has already been processed.
   *
   * @param id - The unique identifier of the event
   * @returns True if the event has been processed, false otherwise
   */
  async isProcessed(id: string): Promise<boolean> {
    const record = await this.prisma.userProcessedEvent.findUnique({
      where: { id },
    });

    return record !== null;
  }
}

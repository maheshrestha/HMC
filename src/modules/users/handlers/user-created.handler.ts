import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { UserCreatedV1Event } from '../events/user-created-v1.event';
import { ProcessedEventRepository } from '../repository/processed-event.repository';

/**
 * Event handler for UserCreatedV1Event.
 *
 * This handler processes user creation events with idempotency guarantees.
 * It logs the user creation details and ensures each event is processed only once
 * using the UserProcessedEvent table for tracking.
 *
 * Features:
 * - Idempotent event processing
 * - Logging of user creation events
 * - Integration with CQRS event sourcing pattern
 */
@EventsHandler(UserCreatedV1Event)
export class UserCreatedHandler implements IEventHandler<UserCreatedV1Event> {
  constructor(private readonly processedRepo: ProcessedEventRepository) {}

  /**
   * Handles the UserCreatedV1Event.
   *
   * @param event - The user created event containing user details
   * @returns Promise that resolves when event processing is complete
   */
  async handle(event: UserCreatedV1Event): Promise<void> {
    // Idempotency check: skip if event already processed
    if (await this.processedRepo.isProcessed(event.id)) {
      return;
    }

    // Log user creation details for monitoring/auditing
    console.log(
      `User created: 
      ID=${event.userId}, 
      version=${UserCreatedV1Event.version}, 
      storeId=${event.storeId}, 
      role=${event.role}`,
    );

    // Mark event as processed to ensure idempotency
    await this.processedRepo.markProcessed(event.id);
  }
}

import { OutboxType } from '@prisma/client';

/**
 * Event representing the creation of a new user (Version 1).
 *
 * This event is published through the outbox pattern when a user is successfully
 * created in the system. It contains the essential user information needed for
 * event-driven processing and integration with other system components.
 */
export class UserCreatedV1Event {
  /** The outbox event type identifier */
  static readonly type = OutboxType.USER_CREATED;

  /** The version of this event schema */
  static readonly version = 1;

  /**
   * Creates a new UserCreatedV1Event.
   *
   * @param id - Unique identifier for this event instance
   * @param userId - The ID of the created user
   * @param storeId - The ID of the store associated with the user
   * @param role - The role assigned to the user (numeric enum value)
   */
  constructor(
    public readonly id: string,
    public readonly userId: number,
    public readonly storeId: number,
    public readonly role: number,
  ) {}
}

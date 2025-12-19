import { OutboxType } from '@prisma/client';

export class UserCreatedV1Event {
  static readonly type = OutboxType.USER_CREATED;
  static readonly version = 1;

  constructor(
    public readonly userId: number,
    public readonly storeId: number,
    public readonly role: number,
  ) {}
}

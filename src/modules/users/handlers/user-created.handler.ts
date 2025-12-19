import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { UserCreatedV1Event } from '../events/user-created-v1.event';

@EventsHandler(UserCreatedV1Event)
export class UserCreatedHandler implements IEventHandler<UserCreatedV1Event> {
  handle(event: UserCreatedV1Event): void {
    console.log(
      `User created: 
      ID=${event.userId}, 
      version=${UserCreatedV1Event.version}, 
      storeId=${event.storeId}, 
      role=${event.role}`,
    );
  }
}

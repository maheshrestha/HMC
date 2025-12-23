import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersRepository } from './repository/users.repository';
import { PrismaService } from '@src/infra/database/prisma/prisma.service';
import { UserCreatedHandler } from './handlers/user-created.handler';
import { ProcessedEventRepository } from './repository/processed-event.repository';

const EventHandlers = [UserCreatedHandler];
const Repositories = [UsersRepository, ProcessedEventRepository];

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService, ...Repositories, ...EventHandlers],
})
export class UsersModule {}

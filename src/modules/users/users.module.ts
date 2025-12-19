import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersRepository } from './repository/users.repository';
import { PrismaService } from '@src/infra/database/prisma/prisma.service';
import { UserCreatedHandler } from './handlers/user-created.handler';

const EventHandlers = [UserCreatedHandler];

@Module({
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, PrismaService, ...EventHandlers],
})
export class UsersModule {}

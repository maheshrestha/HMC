import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/infra/database/prisma/prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { OutboxStatus, OutboxType, User } from 'prisma/generated/client';

@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    return this.prisma.$transaction<User>(async tx => {
      const user = await tx.user.create({
        data: createUserDto,
      });

      await tx.outboxEvent.create({
        data: {
          version: 1,
          type: OutboxType.USER_CREATED,
          payload: { userId: user.id },
          status: OutboxStatus.PENDING,
        },
      });

      return user;
    });
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async findOne(id: string): Promise<User> {
    return this.prisma.user.findUniqueOrThrow({
      where: { id },
    });
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<User> {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}

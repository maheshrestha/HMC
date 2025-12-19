import { Test, TestingModule } from '@nestjs/testing';
import { UsersRepository } from './users.repository';
import { PrismaService } from '@database/prisma/prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { OutboxStatus, OutboxType, UserRole } from '@prisma/client';

describe('UsersRepository', () => {
  let repository: UsersRepository;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const mockPrismaService = {
      $transaction: jest.fn(),
      user: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      outboxEvent: {
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<UsersRepository>(UsersRepository);
    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a user and outbox event', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.Admin,
        sub: 'sub123',
        userName: 'johndoe',
      };
      const mockUser = { id: '1', ...createUserDto };

      const mockTx = {
        user: {
          create: jest.fn().mockResolvedValue(mockUser),
        },
        outboxEvent: {
          create: jest.fn().mockResolvedValue({}),
        },
      };

      prismaService.$transaction.mockImplementation(async callback =>
        callback(mockTx as unknown as Parameters<typeof callback>[0]),
      );

      const result = await repository.create(createUserDto);

      expect(prismaService.$transaction).toHaveBeenCalled();
      expect(mockTx.user.create).toHaveBeenCalledWith({ data: createUserDto });
      expect(mockTx.outboxEvent.create).toHaveBeenCalledWith({
        data: {
          version: 1,
          type: OutboxType.USER_CREATED,
          payload: { userId: '1' },
          status: OutboxStatus.PENDING,
        },
      });
      expect(result).toEqual(mockUser);
    });
  });
});

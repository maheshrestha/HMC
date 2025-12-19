import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from './repository/users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole, User } from '@prisma/client';

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<UsersRepository>;

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(UsersRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.Admin,
        sub: 'sub123',
        userName: 'johndoe',
      };
      const mockUser = { id: '1', ...createUserDto };

      repository.create.mockResolvedValue(mockUser as User);

      const result = await service.create(createUserDto);

      expect(repository.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const mockUsers = [{ id: '1', email: 'test@example.com' }];
      repository.findAll.mockResolvedValue(mockUsers as User[]);

      const result = await service.findAll();

      expect(repository.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const id = '1';
      const mockUser = { id: '1', email: 'test@example.com' };
      repository.findOne.mockResolvedValue(mockUser as User);

      const result = await service.findOne(id);

      expect(repository.findOne).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockUser);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const id = '1';
      const updateUserDto: UpdateUserDto = { firstName: 'Jane' };
      const mockUser = { id: '1', firstName: 'Jane' };
      repository.update.mockResolvedValue(mockUser as User);

      const result = await service.update(id, updateUserDto);

      expect(repository.update).toHaveBeenCalledWith(id, updateUserDto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const id = '1';
      const mockUser = { id: '1', email: 'test@example.com' };
      repository.remove.mockResolvedValue(mockUser as User);

      const result = await service.remove(id);

      expect(repository.remove).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockUser);
    });
  });
});

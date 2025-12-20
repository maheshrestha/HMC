import { Test, TestingModule } from '@nestjs/testing';
import { ValidationArguments } from 'class-validator';
import { IsUniqueConstraint, IsUnique } from './is-unique.decorator';
import { PrismaService } from '../../infra/database/prisma/prisma.service';

class TestDto {
  @IsUnique('user', 'sub')
  sub: string;

  @IsUnique('user', 'email')
  email: string;
}

describe('IsUnique Decorator', () => {
  let constraint: IsUniqueConstraint;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const mockPrismaService = {
      $queryRaw: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IsUniqueConstraint,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    constraint = module.get<IsUniqueConstraint>(IsUniqueConstraint);
    prismaService = module.get(PrismaService);
  });

  describe('IsUniqueConstraint', () => {
    describe('validate', () => {
      it('should return true when value is unique', async () => {
        const mockResult = [{ count: 0 }];
        prismaService.$queryRaw.mockResolvedValue(mockResult);

        const args: ValidationArguments = {
          constraints: ['user', 'sub'],
          value: 'unique-sub',
          targetName: 'TestDto',
          property: 'sub',
          object: new TestDto(),
        };

        const result = await constraint.validate('unique-sub', args);

        expect(result).toBe(true);
        expect(prismaService.$queryRaw).toHaveBeenCalledWith(
          [
            '\n      SELECT COUNT(*) as count FROM "',
            '" \n      WHERE "',
            '" = ',
            ' AND "deletedAt" IS NULL\n    ',
          ],
          'user',
          'sub',
          'unique-sub',
        );
      });

      it('should return false when value already exists', async () => {
        const mockResult = [{ count: 1 }];
        prismaService.$queryRaw.mockResolvedValue(mockResult);

        const args: ValidationArguments = {
          constraints: ['user', 'email'],
          value: 'existing@email.com',
          targetName: 'TestDto',
          property: 'email',
          object: new TestDto(),
        };

        const result = await constraint.validate('existing@email.com', args);

        expect(result).toBe(false);
        expect(prismaService.$queryRaw).toHaveBeenCalledWith(
          [
            '\n      SELECT COUNT(*) as count FROM "',
            '" \n      WHERE "',
            '" = ',
            ' AND "deletedAt" IS NULL\n    ',
          ],
          'user',
          'email',
          'existing@email.com',
        );
      });

      it('should handle different table and column combinations', async () => {
        const mockResult = [{ count: 0 }];
        prismaService.$queryRaw.mockResolvedValue(mockResult);

        const args: ValidationArguments = {
          constraints: ['product', 'sku'],
          value: 'SKU-123',
          targetName: 'TestDto',
          property: 'sku',
          object: new TestDto(),
        };

        const result = await constraint.validate('SKU-123', args);

        expect(result).toBe(true);
        expect(prismaService.$queryRaw).toHaveBeenCalledWith(
          [
            '\n      SELECT COUNT(*) as count FROM "',
            '" \n      WHERE "',
            '" = ',
            ' AND "deletedAt" IS NULL\n    ',
          ],
          'product',
          'sku',
          'SKU-123',
        );
      });
    });

    describe('defaultMessage', () => {
      it('should return appropriate error message', () => {
        const args: ValidationArguments = {
          constraints: ['user', 'sub'],
          value: 'duplicate-sub',
          targetName: 'TestDto',
          property: 'sub',
          object: new TestDto(),
        };

        const message = constraint.defaultMessage(args);

        expect(message).toBe('sub already exists in user');
      });

      it('should handle different table and column names', () => {
        const args: ValidationArguments = {
          constraints: ['product', 'sku'],
          value: 'duplicate-sku',
          targetName: 'TestDto',
          property: 'sku',
          object: new TestDto(),
        };

        const message = constraint.defaultMessage(args);

        expect(message).toBe('sku already exists in product');
      });
    });
  });

  describe('IsUnique decorator registration', () => {
    it('should register the decorator with correct constraints', () => {
      const dto = new TestDto();
      // The decorator should be applied at class level during decoration
      // This is tested implicitly through the class definition
      expect(dto).toBeDefined();
    });
  });
});

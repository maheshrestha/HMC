import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/database/prisma/prisma.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsUniqueConstraint implements ValidatorConstraintInterface {
  constructor(private readonly prisma: PrismaService) {}

  async validate(value: unknown, args: ValidationArguments): Promise<boolean> {
    const [table, column] = args.constraints;
    const result = await this.prisma.$queryRaw<{ count: number }[]>`
      SELECT COUNT(*) as count FROM "${table}" 
      WHERE "${column}" = ${value} AND "deletedAt" IS NULL
    `;

    return result[0].count === 0;
  }

  defaultMessage(args: ValidationArguments): string {
    const [table, column] = args.constraints;

    return `${column} already exists in ${table}`;
  }
}

export function IsUnique(table: string, column: string, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [table, column],
      validator: IsUniqueConstraint,
    });
  };
}

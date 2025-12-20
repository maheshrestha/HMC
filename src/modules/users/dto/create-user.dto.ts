import { UserRole } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { IsUnique } from '../../../common/decorators/is-unique.decorator';

export class CreateUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
    format: 'email',
  })
  @IsEmail()
  @IsNotEmpty()
  @IsUnique('user', 'email', { message: 'User with this email already exists' })
  email: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    enum: UserRole,
    description: 'User role in the system',
    example: UserRole.Admin,
    enumName: 'UserRole',
  })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({
    description: 'Authentication provider subject identifier (unique)',
    example: 'auth0|123456789',
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty()
  @IsUnique('user', 'sub', { message: 'User with this sub already exists' })
  sub: string;

  @ApiProperty({
    description: 'Unique username for the user',
    example: 'johndoe',
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty()
  @IsUnique('user', 'userName', { message: 'User with this userName already exists' })
  userName: string;
}

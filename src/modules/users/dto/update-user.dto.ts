import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from 'prisma/generated/client';

/**
 * DTO for updating user information.
 * All fields are optional - only provided fields will be updated.
 * Extends CreateUserDto but makes all properties optional.
 */
export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({
    description: 'User email address (optional)',
    example: 'john.doe@example.com',
    format: 'email',
  })
  email?: string;

  @ApiPropertyOptional({
    description: 'User first name (optional)',
    example: 'John',
    minLength: 1,
  })
  firstName?: string;

  @ApiPropertyOptional({
    description: 'User last name (optional)',
    example: 'Doe',
    minLength: 1,
  })
  lastName?: string;

  @ApiPropertyOptional({
    enum: UserRole,
    description: 'User role in the system (optional)',
    example: UserRole.Admin,
    enumName: 'UserRole',
  })
  role?: UserRole;

  @ApiPropertyOptional({
    description: 'Authentication provider subject identifier (optional)',
    example: 'auth0|123456789',
    minLength: 1,
  })
  sub?: string;

  @ApiPropertyOptional({
    description: 'Unique username for the user (optional)',
    example: 'johndoe',
    minLength: 1,
  })
  userName?: string;
}

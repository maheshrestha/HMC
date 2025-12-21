import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { User } from '@prisma/client';
import { JwtAuthGuard } from '@modules/auth/jwt-auth.guard';
import { GetCurrentUser } from '@modules/auth/get-current-user.decorator';
import { CurrentUser } from '../auth/dto/current-user.dto';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards() // Override class-level guard to make this endpoint public
  @ApiOperation({
    summary: 'Create a new user',
    description:
      'Creates a new user in the system with the provided information. The user will be assigned a unique ID and the creation will trigger an outbox event.',
  })
  @ApiBody({ type: CreateUserDto, description: 'User creation data' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User created successfully.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
        userName: { type: 'string', example: 'johndoe' },
        email: { type: 'string', example: 'john.doe@example.com' },
        firstName: { type: 'string', example: 'John' },
        lastName: { type: 'string', example: 'Doe' },
        role: {
          type: 'string',
          enum: ['HMCAdmin', 'Admin', 'FohManager', 'Foh', 'BohManager', 'Boh'],
          example: 'Admin',
        },
        sub: { type: 'string', example: 'auth0|123456789' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid input data or validation failed.' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error.' })
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all users',
    description:
      'Retrieves a list of all users in the system. Only non-soft-deleted users are returned.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of users retrieved successfully.',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
          userName: { type: 'string', example: 'johndoe' },
          email: { type: 'string', example: 'john.doe@example.com' },
          firstName: { type: 'string', example: 'John' },
          lastName: { type: 'string', example: 'Doe' },
          role: {
            type: 'string',
            enum: ['HMCAdmin', 'Admin', 'FohManager', 'Foh', 'BohManager', 'Boh'],
          },
          sub: { type: 'string', example: 'auth0|123456789' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error.' })
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get('me')
  @ApiOperation({
    summary: 'Get current authenticated user',
    description: 'Retrieves the profile of the currently authenticated user.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Current user information retrieved successfully.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
        userName: { type: 'string', example: 'johndoe' },
        email: { type: 'string', example: 'john.doe@example.com' },
        firstName: { type: 'string', example: 'John' },
        lastName: { type: 'string', example: 'Doe' },
        role: {
          type: 'string',
          enum: ['HMCAdmin', 'Admin', 'FohManager', 'Foh', 'BohManager', 'Boh'],
          example: 'Admin',
        },
        sub: { type: 'string', example: 'auth0|123456789' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error.' })
  async getCurrentUser(@GetCurrentUser() user: CurrentUser): Promise<User> {
    return this.usersService.findOne(user.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a user by ID',
    description:
      'Retrieves a specific user by their unique identifier. Returns null if user is not found or has been soft-deleted.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the user',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User details retrieved successfully.',
    schema: {
      type: 'object',
      nullable: true,
      properties: {
        id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
        userName: { type: 'string', example: 'johndoe' },
        email: { type: 'string', example: 'john.doe@example.com' },
        firstName: { type: 'string', example: 'John' },
        lastName: { type: 'string', example: 'Doe' },
        role: {
          type: 'string',
          enum: ['HMCAdmin', 'Admin', 'FohManager', 'Foh', 'BohManager', 'Boh'],
        },
        sub: { type: 'string', example: 'auth0|123456789' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'User not found.' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error.' })
  async findOne(@Param('id') id: string): Promise<User | null> {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a user',
    description:
      'Updates an existing user with the provided information. Only the specified fields will be updated.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the user to update',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
  })
  @ApiBody({ type: UpdateUserDto, description: 'User update data (partial)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User updated successfully.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
        userName: { type: 'string', example: 'johndoe' },
        email: { type: 'string', example: 'john.doe@example.com' },
        firstName: { type: 'string', example: 'John' },
        lastName: { type: 'string', example: 'Doe' },
        role: {
          type: 'string',
          enum: ['HMCAdmin', 'Admin', 'FohManager', 'Foh', 'BohManager', 'Boh'],
        },
        sub: { type: 'string', example: 'auth0|123456789' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'User not found.' })
  @ApiBadRequestResponse({ description: 'Invalid input data or validation failed.' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error.' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a user',
    description:
      'Soft deletes a user by setting the deletedAt timestamp. The user data is preserved but marked as deleted.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the user to delete',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: 'string',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User deleted successfully.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
        userName: { type: 'string', example: 'johndoe' },
        email: { type: 'string', example: 'john.doe@example.com' },
        firstName: { type: 'string', example: 'John' },
        lastName: { type: 'string', example: 'Doe' },
        role: {
          type: 'string',
          enum: ['HMCAdmin', 'Admin', 'FohManager', 'Foh', 'BohManager', 'Boh'],
        },
        sub: { type: 'string', example: 'auth0|123456789' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        deletedAt: { type: 'string', format: 'date-time', nullable: true },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'User not found.' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error.' })
  async remove(@Param('id') id: string): Promise<User> {
    return this.usersService.remove(id);
  }
}

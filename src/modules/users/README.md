# User Module Documentation

## Overview

The User Module provides comprehensive user management functionality for the POS(Point Of Sale) API. It includes CRUD operations, role-based access control, and event-driven architecture with outbox pattern implementation.

## Features

- **User CRUD Operations**: Create, read, update, and soft delete users
- **Role-Based Access**: Support for multiple user roles (HMC Admin, Admin, FOH Manager, FOH, BOH Manager, BOH)
- **Input Validation**: Comprehensive validation using class-validator
- **Event-Driven Architecture**: Outbox pattern for reliable event publishing
- **Soft Delete**: Users are soft-deleted to preserve data integrity
- **API Documentation**: Full Swagger/OpenAPI documentation

## API Endpoints

### Base URL
```
/api/users
```

### Endpoints

#### 1. Create User
```http
POST /api/users
```

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "Admin",
  "sub": "123e4567-e89b-12d3-a456-426614174000",
  "userName": "johndoe"
}
```

**Response (201):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "userName": "johndoe",
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "Admin",
  "sub": "123e4567-e89b-12d3-a456-4266141740009",
  "createdAt": "2025-12-20T10:00:00.000Z",
  "updatedAt": "2025-12-20T10:00:00.000Z"
}
```

#### 2. Get All Users
```http
GET /api/users
```

**Response (200):**
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "userName": "johndoe",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "Admin",
    "sub": "auth0|123456789",
    "createdAt": "2025-12-20T10:00:00.000Z",
    "updatedAt": "2025-12-20T10:00:00.000Z"
  }
]
```

#### 3. Get User by ID
```http
GET /api/users/{id}
```

**Parameters:**
- `id` (string): User UUID

**Response (200):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "userName": "johndoe",
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "Admin",
  "sub": "auth0|123456789",
  "createdAt": "2025-12-20T10:00:00.000Z",
  "updatedAt": "2025-12-20T10:00:00.000Z"
}
```

#### 4. Update User
```http
PATCH /api/users/{id}
```

**Parameters:**
- `id` (string): User UUID

**Request Body (partial update):**
```json
{
  "firstName": "Jane",
  "email": "jane.doe@example.com"
}
```

**Response (200):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "userName": "johndoe",
  "email": "jane.doe@example.com",
  "firstName": "Jane",
  "lastName": "Doe",
  "role": "Admin",
  "sub": "auth0|123456789",
  "createdAt": "2025-12-20T10:00:00.000Z",
  "updatedAt": "2025-12-20T10:05:00.000Z"
}
```

#### 5. Delete User (Soft Delete)
```http
DELETE /api/users/{id}
```

**Parameters:**
- `id` (string): User UUID

**Response (200):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "userName": "johndoe",
  "email": "jane.doe@example.com",
  "firstName": "Jane",
  "lastName": "Doe",
  "role": "Admin",
  "sub": "auth0|123456789",
  "createdAt": "2025-12-20T10:00:00.000Z",
  "updatedAt": "2025-12-20T10:05:00.000Z",
  "deletedAt": "2025-12-20T10:10:00.000Z"
}
```

## User Roles

The system supports the following user roles:

- **HMCAdmin**: System administrator with full access
- **Admin**: Store administrator
- **FohManager**: Front of House Manager
- **Foh**: Front of House Staff
- **BohManager**: Back of House Manager
- **Boh**: Back of House Staff

## Data Validation

### CreateUserDto Validation Rules:
- `email`: Must be a valid email format, required
- `firstName`: String, required, non-empty
- `lastName`: String, required, non-empty
- `role`: Must be a valid UserRole enum value, required
- `sub`: String, required, non-empty (authentication subject)
- `userName`: String, required, non-empty

### UpdateUserDto Validation Rules:
- All fields are optional (partial update)
- Same validation rules apply when fields are provided

## Event-Driven Architecture

### Outbox Events

The user module publishes events through the outbox pattern for reliable event processing:

#### User Created Event (V1)
- **Type**: `USER_CREATED`
- **Version**: `1`
- **Payload Structure**:
```json
{
  "id": "event-uuid",
  "userId": "user-uuid",
  "storeId": "store-uuid",
  "role": "user-role-enum-value"
}
```

### Event Handlers

- **UserCreatedHandler**: Processes user creation events with idempotency
  - Logs user creation details
  - Ensures events are processed only once using UserProcessedEvent tracking
- **ProcessedEventHandler**: Handles processed event notifications

### Idempotency Mechanism

Events are processed with idempotency guarantees using the `UserProcessedEvent` table:
- Each event ID is tracked to prevent duplicate processing
- Events that have already been processed are skipped
- This ensures reliable event handling even with retries or duplicate deliveries

## Database Schema

### User Model
```sql
CREATE TABLE "user" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userName" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255),
  "firstName" VARCHAR(255) NOT NULL,
  "lastName" VARCHAR(255) NOT NULL,
  "role" UserRole NOT NULL,
  "sub" VARCHAR(255) UNIQUE NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
  "deletedAt" TIMESTAMPTZ
);
```

### UserProcessedEvent Model
```sql
CREATE TABLE "userProcessedEvent" (
  "id" UUID PRIMARY KEY,
  "processedAt" TIMESTAMPTZ DEFAULT NOW()
);
```

### Outbox Event Model
```sql
CREATE TABLE "outboxEvent" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "type" OutboxType NOT NULL,
  "payload" JSONB NOT NULL,
  "version" INTEGER NOT NULL,
  "status" OutboxStatus DEFAULT 'PENDING',
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);
```

## Error Handling

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `404`: Not Found
- `500`: Internal Server Error

### Common Error Responses
```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "firstName should not be empty"
  ],
  "error": "Bad Request"
}
```

## Testing

The module includes comprehensive test coverage:

- **Unit Tests**: Service, repository, and controller logic
- **Integration Tests**: End-to-end API testing
- **Event Testing**: Outbox pattern and event handlers

Run tests with:
```bash
yarn test          # Unit tests
yarn test:e2e      # End-to-end tests
```

## Architecture

### Layered Architecture
1. **Controller Layer**: HTTP request/response handling
2. **Service Layer**: Business logic orchestration
3. **Repository Layer**: Data access and persistence
4. **Infrastructure Layer**: Database, events, and shared utilities

### CQRS Pattern
- Commands: User creation, updates, deletion
- Events: User created, processed events
- Queries: User retrieval operations

### Soft Delete Implementation
- Users are marked as deleted with `deletedAt` timestamp
- Deleted users are filtered out from queries
- Data preservation for audit and recovery purposes

## Development

### Prerequisites
- Node.js 18+
- PostgreSQL 13+
- Yarn package manager

### Setup
```bash
# Install dependencies
yarn install

# Set up database
yarn prisma migrate dev

# Generate Prisma client
yarn prisma generate

# Start development server
yarn start:dev
```

### API Documentation
Access Swagger documentation at: `http://localhost:8081/api`

## Security Considerations

- Input validation on all endpoints
- Soft delete to prevent data loss
- Event-driven architecture for audit trails
- Role-based access control structure in place
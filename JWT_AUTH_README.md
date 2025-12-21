# JWT Authentication with AWS API Gateway

This application uses JWT (JSON Web Token) authentication integrated with AWS API Gateway for securing API endpoints.

## Overview

The authentication system consists of:
- **JWT Strategy**: Validates JWT tokens from AWS API Gateway
- **JWT Guard**: Protects routes requiring authentication
- **Current User Decorator**: Provides access to authenticated user information

## Configuration

### Environment Variables

Add the following to your `.env` file:

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### AWS API Gateway Setup

1. **Create an API Gateway** with JWT Authorizer
2. **Configure JWT Authorizer** with:
   - Issuer URL: Your identity provider (e.g., AWS Cognito, Auth0)
   - Audience: Your API identifier
   - Token Source: `Authorization` header

3. **Map JWT Claims** to match the expected payload structure:
   ```json
   {
     "sub": "user-id",
     "email": "user@example.com",
     "userName": "username",
     "role": "Admin"
   }
   ```

## API Endpoints

### Public Endpoints
- `POST /users` - User registration (no authentication required)

### Protected Endpoints
All other endpoints require JWT authentication:
- `GET /users` - List all users
- `GET /users/me` - Get current authenticated user
- `GET /users/:id` - Get specific user
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

## Usage

### Making Authenticated Requests

Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Example Request

```bash
curl -X GET "http://localhost:8082/users/me" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Swagger Documentation

Access the API documentation at `http://localhost:8082/api` and use the "Authorize" button to set your JWT token for testing protected endpoints.

## Security Considerations

1. **JWT Secret**: Use a strong, unique secret in production
2. **Token Expiration**: Configure appropriate token expiration times
3. **HTTPS Only**: Always use HTTPS in production
4. **Token Validation**: AWS API Gateway validates tokens before they reach your application

## Development

For local development without AWS API Gateway, you can:
1. Generate JWT tokens using the `AuthService.generateToken()` method
2. Use the tokens in the Authorization header for testing

Example token generation (for development only):

```typescript
const authService = app.get(AuthService);
const token = await authService.generateToken({
  sub: 'user-id',
  email: 'user@example.com',
  userName: 'username',
  role: 'Admin'
});
```
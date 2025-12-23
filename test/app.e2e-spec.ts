import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { UserRole } from 'prisma/generated/client';
import { PrismaService } from '../src/infra/database/prisma/prisma.service';
import { randomUUID } from 'crypto';
import { GlobalExceptionFilter } from '@src/common/filters/global-exception.filter';
import { UsersService } from '@src/modules/users/users.service';
import { faker } from '@faker-js/faker';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let userService: UsersService;
  let randomUUID1 = randomUUID();
  let randomUUID2 = randomUUID();

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new GlobalExceptionFilter());
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    // Get PrismaService instance for cleanup
    prismaService = app.get(PrismaService);

    // Get UsersService instance for user operations
    userService = app.get(UsersService);

    // Clean up database before each test
    await prismaService.user.deleteMany();
    await prismaService.outboxEvent.deleteMany();
  });

  it('/ (GET)', () => request(app.getHttpServer()).get('/').expect(200).expect('Hello World!'));

  describe('Users Module (e2e)', () => {
    let createdUserId: string;

    describe('POST /users', () => {
      it('should create a new user successfully', () => {
        const createUserDto = {
          email: 'john.doe@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: UserRole.Admin,
          sub: randomUUID1,
          userName: 'johndoe',
        };

        return request(app.getHttpServer())
          .post('/users')
          .send(createUserDto)
          .expect(201)
          .expect(res => {
            expect(res.body).toHaveProperty('id');
            expect(res.body.email).toBe(createUserDto.email);
            expect(res.body.firstName).toBe(createUserDto.firstName);
            expect(res.body.lastName).toBe(createUserDto.lastName);
            expect(res.body.role).toBe(createUserDto.role);
            expect(res.body.sub).toBe(createUserDto.sub);
            expect(res.body.userName).toBe(createUserDto.userName);
            expect(res.body).toHaveProperty('createdAt');
            expect(res.body).toHaveProperty('updatedAt');

            // Store for later tests
            createdUserId = res.body.id;
          });
      });

      it('should fail to create user with duplicate sub', async () => {
        await prismaService.user.create({
          data: {
            email: 'john.doe@example.com',
            firstName: 'John',
            lastName: 'Doe',
            role: UserRole.Admin,
            sub: randomUUID1,
            userName: 'johndoe',
          },
        });
        const createUserDto = {
          email: 'jane.smith@example.com',
          firstName: 'Jane',
          lastName: 'Smith',
          role: UserRole.Foh,
          sub: randomUUID1, // Same sub as first user
          userName: 'janesmith',
        };

        return request(app.getHttpServer())
          .post('/users')
          .send(createUserDto)
          .expect(409)
          .expect(res => {
            expect(res.body.message).toContain('sub already exists');
          });
      });

      it('should fail to create user with duplicate userName', () => {
        const createUserDto = {
          email: 'jane.smith@example.com',
          firstName: 'Jane',
          lastName: 'Smith',
          role: UserRole.Foh,
          sub: randomUUID2,
          userName: 'johndoe', // Same userName as first user
        };

        return request(app.getHttpServer())
          .post('/users')
          .send(createUserDto)
          .expect(409)
          .expect(res => {
            expect(res.body.message).toContain('userName already exists');
          });
      });

      it('should fail validation with invalid email', () => {
        const createUserDto = {
          email: 'invalid-email',
          firstName: 'John',
          lastName: 'Doe',
          role: UserRole.Admin,
          sub: 'auth0|1234567890',
          userName: 'johndoe2',
        };

        return request(app.getHttpServer()).post('/users').send(createUserDto).expect(400);
      });

      it('should fail validation with missing required fields', () => {
        const createUserDto = {
          email: 'test@example.com',
          // Missing other required fields
        };

        return request(app.getHttpServer()).post('/users').send(createUserDto).expect(400);
      });

      it('should fail validation with invalid role', () => {
        const createUserDto = {
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'InvalidRole',
          sub: randomUUID(),
          userName: 'johndoe2',
        };

        return request(app.getHttpServer()).post('/users').send(createUserDto).expect(400);
      });
    });

    describe('GET /users', () => {
      it('should return all users', async () => {
        // Ensure at least one user exists
        const createUserDto = {
          email: faker.internet.email(),
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          role: UserRole.Admin,
          sub: faker.string.uuid(),
          userName: faker.internet.username(),
        };
        await userService.create(createUserDto);

        request(app.getHttpServer())
          .get('/users')
          .expect(200)
          .expect(res => {
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);

            // Check that our created user is in the list
            const createdUser = res.body.find(user => user.id === createdUser.id);
            expect(createdUser).toBeDefined();
            expect(createdUser.email).toBe(createdUser.email);
            expect(createdUser.firstName).toBe(createdUser.firstName);
            expect(createdUser.lastName).toBe(createdUser.lastName);
            expect(createdUser.role).toBe(UserRole.Admin);
            expect(createdUser.sub).toBe(createdUser.sub);
            expect(createdUser.userName).toBe(createdUser.userName);
          });
      });
    });

    describe('GET /users/:id', () => {
      it('should return a user by ID', () =>
        request(app.getHttpServer())
          .get(`/users/${createdUserId}`)
          .expect(200)
          .expect(res => {
            expect(res.body.id).toBe(createdUserId);
            expect(res.body.email).toBe('john.doe@example.com');
            expect(res.body.firstName).toBe('John');
            expect(res.body.lastName).toBe('Doe');
            expect(res.body.role).toBe(UserRole.Admin);
            expect(res.body.sub).toBe(randomUUID1);
            expect(res.body.userName).toBe('johndoe');
            expect(res.body).toHaveProperty('createdAt');
            expect(res.body).toHaveProperty('updatedAt');
            expect(res.body).not.toHaveProperty('deletedAt');
          }));

      it('should return null for non-existent user ID', () =>
        request(app.getHttpServer())
          .get('/users/00000000-0000-0000-0000-000000000000')
          .expect(200)
          .expect(res => {
            expect(res.body).toBeNull();
          }));

      it('should return 400 for invalid UUID format', () =>
        request(app.getHttpServer()).get('/users/invalid-uuid').expect(400));
    });

    describe('PATCH /users/:id', () => {
      it('should update a user successfully', () => {
        const updateUserDto = {
          firstName: 'Johnny',
          lastName: 'Doe Jr.',
        };

        return request(app.getHttpServer())
          .patch(`/users/${createdUserId}`)
          .send(updateUserDto)
          .expect(200)
          .expect(res => {
            expect(res.body.id).toBe(createdUserId);
            expect(res.body.email).toBe('john.doe@example.com'); // Unchanged
            expect(res.body.firstName).toBe('Johnny'); // Updated
            expect(res.body.lastName).toBe('Doe Jr.'); // Updated
            expect(res.body.role).toBe(UserRole.Admin); // Unchanged
            expect(res.body.sub).toBe(randomUUID1); // Unchanged
            expect(res.body.userName).toBe('johndoe'); // Unchanged
            expect(res.body).toHaveProperty('updatedAt');
          });
      });

      it('should fail to update with duplicate email', () => {
        // First create another user
        const createUserDto = {
          email: 'jane.smith@example.com',
          firstName: 'Jane',
          lastName: 'Smith',
          role: UserRole.Foh,
          sub: randomUUID2,
          userName: 'janesmith',
        };

        return request(app.getHttpServer())
          .post('/users')
          .send(createUserDto)
          .expect(201)
          .then(() => {
            // Now try to update the first user with the same email
            const updateUserDto = {
              email: 'jane.smith@example.com', // Duplicate email
            };

            return request(app.getHttpServer())
              .patch(`/users/${createdUserId}`)
              .send(updateUserDto)
              .expect(400)
              .expect(res => {
                expect(res.body.message).toContain('User with this email already exists');
              });
          });
      });

      it('should return 404 for non-existent user ID', () => {
        const updateUserDto = {
          firstName: 'Updated Name',
        };

        return request(app.getHttpServer())
          .patch('/users/00000000-0000-0000-0000-000000000000')
          .send(updateUserDto)
          .expect(404);
      });

      it('should handle empty update payload', () =>
        request(app.getHttpServer())
          .patch(`/users/${createdUserId}`)
          .send({})
          .expect(200)
          .expect(res => {
            expect(res.body.id).toBe(createdUserId);
            // User should remain unchanged
            expect(res.body.firstName).toBe('Johnny');
            expect(res.body.lastName).toBe('Doe Jr.');
          }));
    });

    describe('DELETE /users/:id', () => {
      it('should soft delete a user', () =>
        request(app.getHttpServer())
          .delete(`/users/${createdUserId}`)
          .expect(200)
          .expect(res => {
            expect(res.body.id).toBe(createdUserId);
            expect(res.body).toHaveProperty('deletedAt');
            expect(res.body.deletedAt).not.toBeNull();
          }));

      it('should not include soft deleted users in GET /users', () =>
        request(app.getHttpServer())
          .get('/users')
          .expect(200)
          .expect(res => {
            expect(Array.isArray(res.body)).toBe(true);
            // The deleted user should not be in the list
            const deletedUser = res.body.find(user => user.id === createdUserId);
            expect(deletedUser).toBeUndefined();
          }));

      it('should return null when getting a soft deleted user by ID', () =>
        request(app.getHttpServer())
          .get(`/users/${createdUserId}`)
          .expect(200)
          .expect(res => {
            expect(res.body).toBeNull();
          }));

      it('should return 404 when trying to update a soft deleted user', () => {
        const updateUserDto = {
          firstName: 'Should not work',
        };

        return request(app.getHttpServer())
          .patch(`/users/${createdUserId}`)
          .send(updateUserDto)
          .expect(404);
      });

      it('should return 404 when trying to delete a non-existent user', () =>
        request(app.getHttpServer())
          .delete('/users/00000000-0000-0000-0000-000000000000')
          .expect(404));
    });
  });

  afterAll(async () => {
    await app.close();
  });
});

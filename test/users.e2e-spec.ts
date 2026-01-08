import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { UserRole } from 'prisma/generated/client';
import { PrismaService } from '../src/infra/database/prisma/prisma.service';
import { GlobalExceptionFilter } from '@src/common/filters/global-exception.filter';
import { UsersService } from '@src/modules/users/users.service';
import { faker } from '@faker-js/faker';
// TODO: createdUserId should be scoped inside describe or it blocks
describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let userService: UsersService;

  beforeAll(async () => {
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
  });

  beforeEach(async () => {
    // Clean up database before each test
    // TODO: confirm it runs every it block or describe block
    await prismaService.user.deleteMany();
    await prismaService.outboxEvent.deleteMany();
  });

  describe('Users Module (e2e)', () => {
    let createdUserId: string;

    describe('POST /users', () => {
      it('should create a new user successfully', async () => {
        const createUserDto = {
          email: faker.internet.email(),
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          role: UserRole.Admin,
          sub: faker.string.uuid(),
          userName: faker.internet.username(),
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
        const seededUser = await userService.create({
          email: faker.internet.email(),
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          role: UserRole.Admin,
          sub: faker.string.uuid(),
          userName: faker.internet.username(),
        });

        const createUserDto = {
          email: faker.internet.email(),
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          role: UserRole.Admin,
          sub: seededUser.sub, // Same sub as previously created seeded user
          userName: faker.internet.username(),
        };

        return request(app.getHttpServer())
          .post('/users')
          .send(createUserDto)
          .expect(409)
          .expect(res => {
            expect(res.body.message).toContain('sub already exists');
          });
      });

      it('should fail to create user with duplicate userName', () =>
        userService
          .create({
            email: faker.internet.email(),
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            role: UserRole.Admin,
            sub: faker.string.uuid(),
            userName: faker.internet.username(),
          })
          .then(createdUser =>
            request(app.getHttpServer())
              .post('/users')
              .send({
                email: faker.internet.email(),
                firstName: faker.person.firstName(),
                lastName: faker.person.lastName(),
                role: UserRole.Admin,
                sub: faker.string.uuid(),
                userName: createdUser.userName, // Duplicate userName
              })
              .expect(409)
              .expect(res => {
                expect(res.body.message).toContain('userName already exists');
              }),
          ));

      it('should fail validation with invalid email', () => {
        const createUserDto = {
          email: 'invalid-email',
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          role: UserRole.Admin,
          sub: faker.string.uuid(),
          userName: faker.internet.username(),
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
          email: faker.internet.email(),
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          role: 'InvalidRole',
          sub: faker.string.uuid(),
          userName: faker.internet.username(),
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
        const newUser = await userService.create(createUserDto);

        return request(app.getHttpServer())
          .get('/users')
          .expect(200)
          .expect(res => {
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);

            // Check that our created user is in the list
            const foundUser = res.body.find(user => user.id === newUser.id);
            expect(foundUser).toBeDefined();
            expect(foundUser.email).toBe(newUser.email);
            expect(foundUser.firstName).toBe(newUser.firstName);
            expect(foundUser.lastName).toBe(newUser.lastName);
            expect(foundUser.role).toBe(UserRole.Admin);
            expect(foundUser.sub).toBe(newUser.sub);
            expect(foundUser.userName).toBe(newUser.userName);
          });
      });
    });

    describe('GET /users/:id', () => {
      it('should return a user by ID', async () => {
        const createdUser = await userService.create({
          email: faker.internet.email(),
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          role: UserRole.Admin,
          sub: faker.string.uuid(),
          userName: faker.internet.username(),
        });

        return request(app.getHttpServer())
          .get(`/users/${createdUser.id}`)
          .expect(200)
          .expect(res => {
            expect(res.body.id).toBe(createdUser.id);
            expect(res.body.email).toBe(createdUser.email);
            expect(res.body.firstName).toBe(createdUser.firstName);
            expect(res.body.lastName).toBe(createdUser.lastName);
            expect(res.body.role).toBe(UserRole.Admin);
            expect(res.body.sub).toBe(createdUser.sub);
            expect(res.body.userName).toBe(createdUser.userName);
            expect(res.body).toHaveProperty('createdAt');
            expect(res.body).toHaveProperty('updatedAt');
          });
      });

      it('should return 404 for non-existent user ID', () =>
        request(app.getHttpServer())
          .get('/users/00000000-0000-0000-0000-000000000000')
          .expect(404));

      it('should return 400 for invalid UUID format', () =>
        request(app.getHttpServer()).get('/users/invalid-uuid').expect(400));
    });

    describe('PATCH /users/:id', () => {
      it('should update a user successfully', async () => {
        const createdUser = await userService.create({
          email: faker.internet.email(),
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          role: UserRole.Admin,
          sub: faker.string.uuid(),
          userName: faker.internet.username(),
        });

        const updateUserDto = {
          firstName: 'Johnny',
          lastName: 'Doe Jr.',
        };

        return request(app.getHttpServer())
          .patch(`/users/${createdUser.id}`)
          .send(updateUserDto)
          .expect(200)
          .expect(res => {
            expect(res.body.id).toBe(createdUser.id);
            expect(res.body.email).toBe(createdUser.email); // Unchanged
            expect(res.body.firstName).toBe('Johnny'); // Updated
            expect(res.body.lastName).toBe('Doe Jr.'); // Updated
            expect(res.body.role).toBe(UserRole.Admin); // Unchanged
            expect(res.body.sub).toBe(createdUser.sub); // Unchanged
            expect(res.body.userName).toBe(createdUser.userName); // Unchanged
            expect(res.body).toHaveProperty('updatedAt');
          });
      });

      it('should fail to update with duplicate sub', async () => {
        // First create another user
        const createdUser1 = await userService.create({
          email: faker.internet.email(),
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          role: UserRole.Admin,
          sub: faker.string.uuid(),
          userName: faker.internet.username(),
        });

        const createdUser2 = await userService.create({
          email: faker.internet.email(),
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          role: UserRole.Admin,
          sub: faker.string.uuid(),
          userName: faker.internet.username(),
        });

        // Now try to update the first user with the same sub
        const updateUserDto = {
          sub: createdUser2.sub, // Duplicate sub
        };

        return request(app.getHttpServer())
          .patch(`/users/${createdUser1.id}`)
          .send(updateUserDto)
          .expect(409)
          .expect(res => {
            expect(res.body.message).toContain('sub already exists');
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

      it('should handle empty update payload', async () => {
        const createdUser = await userService.create({
          email: faker.internet.email(),
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          role: UserRole.Admin,
          sub: faker.string.uuid(),
          userName: faker.internet.username(),
        });

        return request(app.getHttpServer())
          .patch(`/users/${createdUser.id}`)
          .send({})
          .expect(200)
          .expect(res => {
            expect(res.body.id).toBe(createdUser.id);
            // User should remain unchanged
            expect(res.body.firstName).toBe(createdUser.firstName);
            expect(res.body.lastName).toBe(createdUser.lastName);
          });
      });
    });

    describe('DELETE /users/:id', () => {
      it('should soft delete a user', async () => {
        const createdUser = await userService.create({
          email: faker.internet.email(),
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          role: UserRole.Admin,
          sub: faker.string.uuid(),
          userName: faker.internet.username(),
        });

        return request(app.getHttpServer())
          .delete(`/users/${createdUser.id}`)
          .expect(200)
          .expect(res => {
            expect(res.body.id).toBe(createdUser.id);
            expect(res.body).toHaveProperty('deletedAt');
            expect(res.body.deletedAt).not.toBeNull();
          });
      });

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

      it('should return null when getting a soft deleted user by ID', async () => {
        // create and then soft delete a user
        const createdUser = await userService.create({
          email: faker.internet.email(),
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          role: UserRole.Admin,
          sub: faker.string.uuid(),
          userName: faker.internet.username(),
        });

        await userService.remove(createdUser.id);

        await request(app.getHttpServer())
          .get(`/users/${createdUser.id}`)
          .expect(404)
          .expect(res => {
            expect(res.body.message).toBe('Record not found');
          });
      });

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
          .expect(404)
          .expect(res => {
            expect(res.body.message).toBe('Record not found');
          }));
    });
  });

  afterAll(async () => {
    const prismaService = app.get(PrismaService);
    await prismaService.$disconnect(); // Ensure DB connection is closed
    await app.close(); // Shut down NestJS app
  });
});

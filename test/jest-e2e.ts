require('dotenv').config({ path: '.env.test' });

module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '..',
  testEnvironment: 'node',
  testRegex: '.e2e-spec.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  moduleDirectories: ['node_modules', '<rootDir>'],
  moduleNameMapper: {
    '^@src/(.*)$': '<rootDir>/src/$1',
    '^@modules/(.*)$': '<rootDir>/src/modules/$1',
    '^@common/(.*)$': '<rootDir>/src/common/$1',
    '^@database/(.*)$': '<rootDir>/src/infra/database/$1',
    '^@test/(.*)$': '<rootDir>/test/$1',
    '^prisma/(.*)$': '<rootDir>/prisma/$1',
  },
  transformIgnorePatterns: ['/node_modules/(?!(@faker-js/faker)/)'],
};

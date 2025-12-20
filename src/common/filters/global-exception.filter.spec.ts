import { GlobalExceptionFilter } from './global-exception.filter';
import { DomainError } from '../errors/domain.error';
import { ApplicationError } from '../errors/application.error';
import { ArgumentsHost } from '@nestjs/common';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let mockResponse: jest.Mocked<{ status: jest.Mock; json: jest.Mock }>;
  let mockArgumentsHost: ArgumentsHost;

  beforeEach(async () => {
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockHttpArgumentsHost = {
      getResponse: jest.fn().mockReturnValue(mockResponse),
      getRequest: jest.fn().mockReturnValue({ url: '/test', method: 'GET' }),
    };

    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue(mockHttpArgumentsHost),
    } as unknown as ArgumentsHost;

    filter = new GlobalExceptionFilter();
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  describe('DomainError handling', () => {
    it('should handle DomainError with 400 status', () => {
      const error = new DomainError('USER_NOT_FOUND', 'User not found');

      filter.catch(error, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        code: 'USER_NOT_FOUND',
        message: 'User not found',
      });
    });

    it('should handle different DomainError codes', () => {
      const error = new DomainError('USER_ALREADY_EXISTS', 'User already exists');

      filter.catch(error, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        code: 'USER_ALREADY_EXISTS',
        message: 'User already exists',
      });
    });
  });

  describe('ApplicationError handling', () => {
    it('should handle ApplicationError with 422 status', () => {
      const error = new ApplicationError('Application validation failed');

      filter.catch(error, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(422);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Application validation failed',
      });
    });
  });

  describe('Unknown error handling', () => {
    it('should handle generic Error with 500 status', () => {
      const error = new Error('Something went wrong');
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      filter.catch(error, mockArgumentsHost);

      expect(consoleSpy).toHaveBeenCalledWith(error);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Internal server error',
      });

      consoleSpy.mockRestore();
    });

    it('should handle string errors', () => {
      const error = 'String error';
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      filter.catch(error, mockArgumentsHost);

      expect(consoleSpy).toHaveBeenCalledWith(error);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Internal server error',
      });

      consoleSpy.mockRestore();
    });

    it('should handle null/undefined errors', () => {
      const error = null;
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      filter.catch(error, mockArgumentsHost);

      expect(consoleSpy).toHaveBeenCalledWith(error);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Internal server error',
      });

      consoleSpy.mockRestore();
    });
  });
});

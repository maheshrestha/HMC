import { ArgumentsHost, BadRequestException, Catch } from '@nestjs/common';
import { DomainError } from '../errors/domain.error';
import { ApplicationError } from '../errors/application.error';

@Catch()
export class GlobalExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const res = host.switchToHttp().getResponse();

    if (exception instanceof BadRequestException) {
      const response = exception.getResponse();
      const message =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        typeof response === 'string' ? response : (response as any).message || 'Validation failed';

      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message,
      });
    }

    if (exception instanceof DomainError) {
      return res.status(exception.status).json({
        code: exception.code,
        message: exception.message,
      });
    }

    if (exception instanceof ApplicationError) {
      return res.status(422).json({
        message: exception.message,
      });
    }

    console.error(exception);

    return res.status(500).json({
      message: 'Internal server error',
    });
  }
}

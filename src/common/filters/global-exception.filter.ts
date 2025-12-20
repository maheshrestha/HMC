import { ArgumentsHost, Catch } from '@nestjs/common';
import { DomainError } from '../errors/domain.error';
import { ApplicationError } from '../errors/application.error';

@Catch()
export class GlobalExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const res = host.switchToHttp().getResponse();

    if (exception instanceof DomainError) {
      return res.status(400).json({
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

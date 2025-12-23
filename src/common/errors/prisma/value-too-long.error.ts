import { HttpStatus } from '@nestjs/common';
import { ApplicationError } from '@common/errors/application.error';

export class ValueTooLongError extends ApplicationError {
  readonly status = HttpStatus.UNPROCESSABLE_ENTITY;
  readonly code = 'VALUE_TOO_LONG';

  constructor(field: string) {
    super(`${field} value too long`);
  }
}

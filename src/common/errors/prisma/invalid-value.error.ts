import { HttpStatus } from '@nestjs/common';
import { ApplicationError } from '../application.error';

export class InvalidValueError extends ApplicationError {
  readonly status = HttpStatus.UNPROCESSABLE_ENTITY;
  readonly code = 'INVALID_VALUE';

  constructor(field: string) {
    super(`${field} has invalid value`);
  }
}

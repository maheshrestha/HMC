import { HttpStatus } from '@nestjs/common';
import { ApplicationError } from '../application.error';

export class JsonParsingError extends ApplicationError {
  readonly status = HttpStatus.UNPROCESSABLE_ENTITY;
  readonly code = 'JSON_PARSING_FAILED';

  constructor(field: string) {
    super(`Failed to parse JSON for ${field}`);
  }
}

import { HttpStatus } from '@nestjs/common';
import { DomainError } from '@src/common/errors/domain.error';

export class RecordNotFoundError extends DomainError {
  readonly status = HttpStatus.NOT_FOUND;
  readonly code = 'RECORD_NOT_FOUND';

  constructor(message?: string) {
    super(message ?? 'Record not found');
  }
}

import { HttpStatus } from '@nestjs/common';
import { DomainError } from '@src/common/errors/domain.error';

export class ForeignKeyViolationError extends DomainError {
  readonly status = HttpStatus.CONFLICT;
  readonly code = 'FOREIGN_KEY_VIOLATION';

  constructor(message?: string) {
    super(message ?? 'Foreign key constraint failed');
  }
}

import { HttpStatus } from '@nestjs/common';
import { DomainError } from '@src/common/errors/domain.error';

export class UniqueFieldError extends DomainError {
  readonly status = HttpStatus.CONFLICT;
  constructor(
    public readonly field: string,
    message?: string,
  ) {
    super(message ?? `${field} already exists`);
  }

  get code(): string {
    return `${this.field.toUpperCase()}_ALREADY_EXISTS`;
  }
}

export abstract class DomainError extends Error {
  abstract readonly code: string;
  abstract readonly status: number;

  protected constructor(message: string) {
    super(message);
  }
}

export abstract class ApplicationError extends Error {
  readonly status: number;

  protected constructor(message: string, status = 422) {
    super(message);
    this.status = status;
  }
}

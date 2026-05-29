export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly field?: string
  ) {
    super(message);
  }
}

export function badRequest(message: string, field?: string): HttpError {
  return new HttpError(400, message, field);
}

export function notFound(message: string): HttpError {
  return new HttpError(404, message);
}

export function conflict(message: string, field?: string): HttpError {
  return new HttpError(409, message, field);
}

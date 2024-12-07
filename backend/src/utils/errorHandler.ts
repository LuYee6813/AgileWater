export interface ErrorResponseBody {
  error: string;
  message: string;
}

export const InternalServerError: ErrorResponseBody = {
  error: 'Internal server error',
  message: ''
};

export const ForbiddenError: ErrorResponseBody = {
  error: 'Forbidden',
  message: ''
};

export const UnauthorizedError: ErrorResponseBody = {
  error: 'Unauthorized',
  message: ''
};

export const NotFoundError: ErrorResponseBody = {
  error: 'Not found',
  message: ''
};

export const BadRequestError: ErrorResponseBody = {
  error: 'Bad request',
  message: ''
};

export const ConflictError: ErrorResponseBody = {
  error: 'Conflict',
  message: ''
};

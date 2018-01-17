import ev from 'express-validation';

export default async function handle(error, request, response, next) {
  try {
    if (error instanceof ev.ValidationError) {
      if (process.env.NODE_ENV === 'production') {
        error = response.messages.BAD_REQUEST;
      }
      return response.build.badRequest(error);
    }
    return response.build.internal(error);
  } catch (error) {
    return next(error);
  }
}


export default (request, response, next) => {
  try {
    if (!request.headers.token) {
      return response.build.unauthorized(response.messages.NO_TOKEN_SUPPLIED)
    }
    request.device = {
      token: request.headers.token,
    }
    return next()
  } catch (error) {
    return next(error)
  }
}

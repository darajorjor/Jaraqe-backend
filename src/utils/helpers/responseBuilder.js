class ResponseBuilder {
  constructor(response) {
    this.response = response
  }
  success(data, message) {
    const res = {
      data,
      message: global.translate(message) || message,
    }
    this.response.status(200).send(res)
  }

  badRequest(error) {
    const res = {
      message: global.translate(error) || error,
    }
    this.response.status(400).send(res)
  }

  unauthorized(error) {
    const res = {
      message: global.translate(error) || error,
    }
    this.response.status(401).send(res)
  }

  forbidden(error) {
    const res = {
      message: global.translate(error) || error,
    }
    this.response.status(403).send(res)
  }

  notFound(error) {
    const res = {
      message: global.translate(error) || error,
    }
    this.response.status(404).send(res)
  }

  unprocessableEntity(error) {
    const res = {
      message: global.translate(error) || error,
    }
    this.response.status(422).send(res)
  }

  paymentRequired(error) {
    const res = {
      message: global.translate(error) || error,
    }
    this.response.status(402).send(res)
  }

  internal(error) {
    console.error(error)
    const res = {
      message: process.env.NODE_ENV === 'production' ? global.translate('unknown_internal_error') : global.translate(error.message) || error.message,
    }
    this.response.status(500).send(res)
  }
}

export default ResponseBuilder

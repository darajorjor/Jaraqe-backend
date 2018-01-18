import Qs from 'qs'
import config from 'src/config/app.config'

module.exports = {
  loginInstagram(response, fullUrl) {
    return response.redirect(`https://api.instagram.com/oauth/authorize/?${Qs.stringify({
      client_id: config.instagramClientId,
      redirect_uri: fullUrl,
      response_type: 'code',
    })}`)
  }
}
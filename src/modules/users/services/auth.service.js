import Qs from 'qs'
import config from 'src/config/app.config'
import google from 'googleapis'

export default {

  loginInstagram(response, fullUrl) {
    return response.redirect(`https://api.instagram.com/oauth/authorize/?${Qs.stringify({
      client_id: config.instagramClientId,
      redirect_uri: fullUrl,
      response_type: 'code',
    })}`)
  },

  loginGoogle(fullUrl) {
    const OAuth2 = google.auth.OAuth2

    const client = new OAuth2(
      config.google.clientId,
      config.google.clientSecret,
      fullUrl,
    )
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ]

    return client.generateAuthUrl({
      // 'online' (default) or 'offline' (gets refresh_token)
      access_type: 'offline',

      // If you only need one scope you can pass it as a string
      scope: scopes,

      // Optional property that passes state parameters to redirect URI
      // state: 'foo'
    });
  },

  requestGoogleAccessToken(code, fullUrl) {
    const OAuth2 = google.auth.OAuth2
    const plus = google.plus('v1')

    const client = new OAuth2(
      config.google.clientId,
      config.google.clientSecret,
      fullUrl,
    )

    return new Promise((resolve, reject) => {
      client.getToken(code, function (err, tokens) {
        if (err) return reject(err)
        // Now tokens contains an access_token and an optional refresh_token. Save them.
        client.setCredentials(tokens);

        return plus.people.get({
          userId: 'me',
          auth: client,
        }, function (err, response) {
          if (err) return reject(err)

          resolve(response)
        });
      })
    })
  },
}
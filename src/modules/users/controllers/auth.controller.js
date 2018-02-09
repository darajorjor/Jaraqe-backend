import Qs from 'qs'
import config from 'src/config/app.config'
import requestify from 'requestify'
import UserService from '../services/user.service'
import AuthService from '../services/auth.service'
import messages from 'src/constants/defaults/messages.default'
import { transformSelfProfile } from '../transformers/user.transformer'
import Handlebars from 'handlebars'
import { returnToApp } from 'src/utils/templates'

module.exports = {
  async loginInstagramController(req, res, next) {
    try {
      const { code, error, error_reason, error_description } = req.query

      if (error) {
        return res.build.forbidden({
          error,
          error_reason,
          error_description,
        })
      }

      const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl
      const params = {
        client_id: config.instagramClientId,
        client_secret: config.instagramClientSecret,
        redirect_uri: fullUrl.split('?')[0],
        response_type: 'code',
      }

      if (code) {
        params.grant_type = 'authorization_code'
        params.code = code
        delete params.response_type
        console.log('requesting access token from instagram...')
        const data = await requestify.request(`https://api.instagram.com/oauth/access_token`, {
          method: 'POST',
          body: params,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          dataType: 'form-url-encoded',
        })

        data.body = JSON.parse(data.body)
        const { user, access_token: accessToken } = data.body

        const savedUser = await UserService.registerInstagramUser(user, accessToken)

        return res.redirect(`jaraqe://login?user=${JSON.stringify({
            user: transformSelfProfile(savedUser),
            session: savedUser.session,
          }
        )}`)
        /*return res.send(Handlebars.compile(returnToApp.toString())({
          data: JSON.stringify({
              user: transformSelfProfile(savedUser),
              session: savedUser.session,
            }
          )
        }))*/
      }

      console.log('redirecting to instagram...')
      return res.redirect(`https://api.instagram.com/oauth/authorize/?${Qs.stringify(params)}`)
    } catch (error) {
      switch (error.message) {
        default:
          return next(error)
      }
    }
  },

  async loginGoogleController(req, res, next) {
    try {
      const { code } = req.query
      const fullUrl = (req.protocol + '://' + req.get('host') + req.originalUrl).split('?')[0]


      if (code) {
        const response = await AuthService.requestGoogleAccessToken(code, fullUrl)

        if (response.status < 400) { // ok
          const savedUser = await UserService.registerGoogleUser(response.data)

          debugger
          return res.redirect(`jaraqe://login?user=${JSON.stringify({
              user: transformSelfProfile(savedUser),
              session: savedUser.session,
            }
          )}`)
/*
          return res.send(Handlebars.compile(returnToApp.toString())({
            data: JSON.stringify({
                user: transformSelfProfile(savedUser),
                session: savedUser.session,
              }
            )
          }))
*/
        } else {
          return res.status(response.status).send(response.statusText)
        }
      }

      const url = AuthService.loginGoogle(fullUrl)
      return res.redirect(url)
    } catch (error) {
      switch (error.message) {
        default:
          return next(error);
      }
    }
  },
}
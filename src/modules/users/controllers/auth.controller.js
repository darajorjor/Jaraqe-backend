import Qs from 'qs'
import config from 'src/config/app.config'
import requestify from 'requestify'
import UserService from '../services/user.service'
import messages from 'src/constants/defaults/messages.default'
import userTransform from '../transformers/user.transformer'

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
        return res.build.success({
          user: userTransform(savedUser),
          session: savedUser.session,
        }, messages.USER_REGISTERED)
      }

      return res.redirect(`https://api.instagram.com/oauth/authorize/?${Qs.stringify(params)}`)
    } catch (error) {
      switch (error.message) {
        default:
          return next(error)
      }
    }
  },
}
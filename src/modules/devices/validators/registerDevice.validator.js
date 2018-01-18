import Joi from 'src/utils/helpers/joi.validator'
import DeviceTypes from 'src/constants/enums/deviceTypes.enum'

export default {
  body: {
    uniqueId: Joi.string().required(),
    type: Joi.required().valid([
      DeviceTypes.ANDROID,
      DeviceTypes.IOS,
      DeviceTypes.WEB_APP,
    ]),
    appVersion: Joi.string().required(),
    deviceInfo: Joi.object().required(),
  },
}

import Joi from 'joi'
import persian from 'persian'

const customJoi = Joi.extend((joi) => {
  return ({
    base: joi.string(),
    name: 'string',
    pre(value, state, options) {
      if (options.convert && this._flags.arabicToPersian) {
        return persian.toPersian(value, { english: false })
      }
      return value
    },
    rules: [
      {
        name: 'arabicToPersian',
        setup(params) {
          this._flags.arabicToPersian = true
        },
      },
    ],
  })
})

export default customJoi

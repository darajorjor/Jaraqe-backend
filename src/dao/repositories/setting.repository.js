import { Setting } from '../models'

export default {
  async get(name) {
    const setting = await Setting.findOne({ name })

    if (!setting) return null

    return setting.data
  },
}

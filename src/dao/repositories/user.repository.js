import { User } from '../models'
import messages from 'src/constants/defaults/messages.default'
import status from 'src/constants/enums/status.enum'
import uuid from 'uuid/v4'

export default {
  async findBySession(session) {
    return User.findOne({
      session,
      status: status.USER.ACTIVE,
    });
  },

  async findByInstagramId(id) {
    const dbUser = await User.findOne({
      'oauth.instagram.id': id,
      status: { $ne: status.USER.INACTIVE },
    })
    if (!dbUser) {
      return null
    }

    return dbUser
  },

  async registerUser(data) {
    data.session = uuid()
    const newUser = new User(data)
    return newUser.save()
  },

  methods: {
    update(data) {
      this.avatar = data.avatar
      this.oauth = data.oauth
      return this.save()
    }
  }
}

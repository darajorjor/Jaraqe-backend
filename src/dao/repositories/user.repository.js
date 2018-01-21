import { User } from '../models'
import status from 'src/constants/enums/status.enum'
import uuid from 'uuid/v4'

export default {
  findOne(data) {
    return User.findOne(data)
  },

  async findBySession(session) {
    return User.findOne({
      session,
      status: status.USER.ACTIVE,
    }).exec();
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

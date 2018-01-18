import { User } from 'models'
import messages from 'src/constants/defaults/messages.default'
import status from 'src/constants/enums/status.enum'
import uuid from 'uuid/v4'

export default {
  async findByInstagramId(id) {
    const dbUser = await User.findOne({
      where: {
        additional_data: {
          instagram: {
            id,
          }
        }
      }, status: { $ne: status.USER.INACTIVE }
    })
    if (!dbUser) {
      return null
    }

    return {
      id: dbUser.id,
      status: dbUser.status,
    }
  },

  async findBySession(session) {
    const dbUser = await User.findOne({ where: { session, status: { $ne: status.USER.INACTIVE } } })
    if (!dbUser) {
      throw new Error(messages.USER_NOT_FOUND)
    }

    return {
      id: dbUser.id,
      status: dbUser.status,
    }
  },

  async registerUser(data) {
    data.session = uuid()
    const user = User.build(data);
    return user.save()
  },
}

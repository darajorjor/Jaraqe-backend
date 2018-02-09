import { User } from '../models'
import status from 'src/constants/enums/status.enum'
import uuid from 'uuid/v4'
import mongoose from 'mongoose'

export default {
  findById(data) {
    return User.findById(data)
  },
  findOne(data) {
    return User.findOne(data)
  },
  findOneAndUpdate(id, data) {
    return User.findOneAndUpdate(id, { $set: data })
  },
  async matchGame(id) {
    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: mongoose.Types.ObjectId(id) }
        }
      },
      {
        $sample: { size: 1 }
      }
    ])

    return users[0]
  },
  search(query) {
    return User.find({
      $or: [
        { username: new RegExp(`^${query}`) },
      ]
    })
      .limit(5)
      .exec()
  },

  async list(id) {
    const user = await User.findById(id)
      .populate('friends')

    return user.friends
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

  async findByGoogleId(id) {
    const dbUser = await User.findOne({
      'oauth.google.id': id,
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
}

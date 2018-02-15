import { User } from '../models'
import status from 'src/constants/enums/status.enum'
import uuid from 'uuid/v4'
import mongoose from 'mongoose'
import redis from 'src/dao/connections/redis'
import config from 'src/config/app.config'

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
    const key = `user:session:${session}`;
    let user = JSON.parse(await redis.get(key));
    if (user) {
      redis.expire(key, config.timeIntervals.sessionEx);
    } else {
      const dbUser = await User.findOne({
        session,
        status: status.USER.ACTIVE,
      }).exec()

      if (!dbUser) return null

      user = {
        id: dbUser._id.toString(),
        status: dbUser.status,
      }
      redis.setex(key, config.timeIntervals.sessionEx, JSON.stringify(user));
    }

    return user
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

    const key = `user:session:${newUser.session}`;
    redis.setex(key, config.timeIntervals.sessionEx, JSON.stringify(newUser));

    return newUser.save()
  },

  async getRedisSessions() {
    return redis.keys('user:session:*');
  },

  async setLastOnlineBySession({ session, lastOnline }) {
    return User.update({
      session,
    }, {
      lastOnline,
    });
  },
}

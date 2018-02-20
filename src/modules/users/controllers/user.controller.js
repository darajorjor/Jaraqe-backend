import userService from '../services/user.service'
import messages from 'src/constants/defaults/messages.default'
import { transformUserProfile, transformSelfProfile } from '../transformers/user.transformer'

export default {
  async getSelfProfile(req, res, next) {
    try {
      const { id } = req.user

      const user = await userService.getSelfUser(id)

      return res.build.success(transformSelfProfile(user))
    } catch (error) {
      switch (error.message) {
        case messages.USER_NOT_FOUND:
          return res.build.notFound(messages.USER_NOT_FOUND)
        default:
          return next(error);
      }
    }
  },
  async getUser(req, res, next) {
    try {
      const { userId } = req.params
      const { id } = req.user

      const user = await userService.getUser(userId, id)

      return res.build.success(transformUserProfile(user))
    } catch (error) {
      switch (error.message) {
        case messages.USER_NOT_FOUND:
          return res.build.notFound(messages.USER_NOT_FOUND)
        default:
          return next(error);
      }
    }
  },
  async updateUser(req, res, next) {
    try {
      const { id } = req.user
      const {
        gender,
        referrer,
      } = req.body

      const user = await userService.update(id, {
        gender,
        referrer,
      })

      return res.build.success(transformUserProfile(user))
    } catch (error) {
      switch (error.message) {
        case messages.USER_NOT_FOUND:
          return res.build.notFound(messages.USER_NOT_FOUND)
        case messages.NO_SUCH_USER:
          return res.build.notFound(messages.NO_SUCH_USER)
        default:
          return next(error);
      }
    }
  },
  async changeUserFriendship(req, res, next) {
    try {
      const { userId } = req.params
      const { action } = req.body
      const { id } = req.user

      let user
      if (action === 'add') {
        user = await userService.addFriend(id, userId)
      } else if (action === 'remove') {
        user = await userService.removeFriend(id, userId)
      }

      res.build.success(transformSelfProfile(user))
    } catch (error) {
      switch (error.message) {
        case messages.FRIEND_REQUEST_ALREADY_SENT:
          return res.build.forbidden(messages.FRIEND_REQUEST_ALREADY_SENT)
        default:
          return next(error);
      }
    }
  },
  async respondToFriendRequest(req, res, next) {
    try {
      const { friendRequestId } = req.params
      const { accept } = req.body
      const { id } = req.user

      const user = await userService.respondToFriendRequest(id, friendRequestId, accept)

      return res.build.success(transformSelfProfile(user))
    } catch (error) {
      switch (error.message) {
        case messages.FRIEND_REQUEST_NOT_FOUND:
          return res.build.notFound(messages.FRIEND_REQUEST_NOT_FOUND)
        default:
          return next(error);
      }
    }
  },
  async searchUsers(req, res, next) {
    try {
      const { id } = req.user
      const { query } = req.query

      const results = await userService.searchUsers(query.toLowerCase(), id)

      return res.build.success(results.map(r => transformUserProfile(r)))
    } catch (error) {
      switch (error.message) {
        default:
          return next(error);
      }
    }
  },
}
import UserRepo from 'repositories/user.repository'
import GameRepo from 'repositories/game.repository'
import config from 'src/config/app.config'
import messages from 'src/constants/defaults/messages.default'
import redis from 'connections/redis'
import sendPush from 'src/utils/push'
import notificationTypes from 'src/constants/enums/notificationTypes.enum'
import notificationPriorities from 'src/constants/enums/notificationPriorities.enum'
import notificationDestinations from 'src/constants/enums/notificationDestinations.enum'
import transformUser from 'src/modules/users/transformers/user.transformer'

export default {
  async itsMe({ session, socketId }) {
    const user = await UserRepo.findBySession(session)

    if (!user) {
      throw new Error(messages.USER_NOT_FOUND)
    }

    redis.setex(`sockets:${socketId}`, config.socket.socketExpiration, JSON.stringify({
      userId: user.id || user._id,
      session
    }))

    return (user.id || user._id)
  },

  async chat({ userId, gameId, text }) {
    const game = await GameRepo.findById(gameId)

    game.players.forEach(async ({ userId: playerId }) => {
      if (playerId.toString() === userId) return null
      const user = await UserRepo.findById(userId)

      sendPush({
        userId: playerId.toString(),
        title: user.fullName || user.username,
        message: text,
        type: notificationTypes.CHAT,
        priority: notificationPriorities.MEDIUM,
        destination: notificationDestinations.CHAT,
      })
    })

    const msg = await game.chat({ userId, text })

    msg.sender = transformUser(msg.sender)

    redis.publish(`chats:${gameId}`, JSON.stringify(msg))

    return msg
  },

  async seeMessages({ gameId, userId }) {
    const game = await GameRepo.findById(gameId)

    return game.seeMessages(userId)
  },
}
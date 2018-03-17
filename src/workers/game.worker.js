import Game from 'models/game.model'
import UserRepo from 'repositories/user.repository'
import statuses from 'src/constants/enums/status.enum'
import moment from 'moment-jalaali'
import sendPush from 'src/utils/push'
import notificationPriorities from 'src/constants/enums/notificationPriorities.enum'
import notificationDestinations from 'src/constants/enums/notificationDestinations.enum'
import notificationTypes from 'src/constants/enums/notificationTypes.enum'
import gameService from 'src/modules/games/services/game.service'

export default {
  async run() {
    const games = await Game.find({ status: statuses.GAME.ACTIVE })

    games.map(async (game) => {
      if (game.history.length > 0) {
        const lastTurn = game.history[game.history.length - 1]
        const hoursDiff = Math.abs(moment().diff(moment(lastTurn.time), 'hours'))
        const nextPlayerUserId = game.players.find(p => !!p.shouldPlayNext).userId.toString()
        const someOtherPlayerId = game.players.find(p => !p.shouldPlayNext).userId.toString()

        const otherPlayer = await UserRepo.findById(someOtherPlayerId)
        const nextPlayer = await UserRepo.findById(nextPlayerUserId)

        if (hoursDiff >= 24) {
          return gameService.finish({ winnerId: someOtherPlayerId, gameId: game._id })
        } else if (hoursDiff >= 23) {
          await sendPush({
            userId: nextPlayerUserId,
            title: 'تا یه ساعت دیگه جرقه نزنی باختی!',
            message: `به ${otherPlayer.fullName || otherPlayer.userName} نشون بده با کی طرفه!`,
            type: notificationTypes.GAME,
            priority: notificationPriorities.HIGH,
            destination: notificationDestinations.GAME,
          })
          await game.logAlert({
            user: nextPlayerUserId,
            atHour: 23,
            turn: lastTurn._id,
          })
        } else if (hoursDiff >= 12) {
          await sendPush({
            userId: nextPlayerUserId,
            title: 'نوبت توئه ها!',
            message: `${otherPlayer.fullName || otherPlayer.userName}و منتظر نزار`,
            type: notificationTypes.GAME,
            priority: notificationPriorities.MEDIUM,
            destination: notificationDestinations.GAME,
          })
          await game.logAlert({
            user: nextPlayerUserId,
            atHour: 12,
            turn: lastTurn._id,
          })
        }
      }
    })
  },
}

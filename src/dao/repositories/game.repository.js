import { Game } from '../models'

export default {
  findOne(data) {
    return Game.findOne(data)
  },

  async createGame({ players, board, letters }) {
    const randomFirstPlay = players[Math.floor(Math.random() * players.length)].userId

    const game = new Game({
      players: players.map(({ userId, rack }) => ({
        userId,
        score: 0,
        shouldPlayNext: userId === randomFirstPlay,
        rack,
      })),
      letters,
      board
    })

    await Game.populate(game, { path: 'players.userId' })
    await Game.populate(game, { path: 'board' })

    return game.save()
  },

  async list({ userId, lastKey }) {
    const where = { _id: { $ne: userId } }
    if (lastKey) {
      const lastGame = await Game.findById(lastKey)
      where.$or = [
        { createdAt: { $lt: lastGame.createdAt } },
      ]
    }

    return Game.find(where)
      .limit(10)
      .populate('players.userId')
      .populate('board')
      .exec()
  },

  async play() {

  }
}


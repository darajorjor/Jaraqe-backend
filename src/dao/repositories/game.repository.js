import { Game } from '../models'

export default {
  createGame({ players, board }) {
    const randomFirstPlay = players[Math.floor(Math.random() * players.length)]

    const game = new Game({
      players: players.map(userId => ({
        userId,
        score: 0,
        shouldPlayNext: userId === randomFirstPlay,
      })),
      board
    })

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

    return Game.find(where).limit(10).exec()
  },

  methods: {
    //
  }
}

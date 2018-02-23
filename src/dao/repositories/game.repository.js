import { Game } from '../models'
import mongoose from 'mongoose'
import statuses from 'src/constants/enums/status.enum'

export default {
  findById(id) {
    return Game.findById(id)
  },
  findOne(data) {
    return Game.findOne(data)
  },

  async createGame({ players, board, letters }) {
    // const randomFirstPlay = players[Math.floor(Math.random() * players.length)].userId

    const game = new Game({
      players: players.map(({ userId, rack, shouldPlayNext }, index) => ({
        userId,
        score: 0,
        shouldPlayNext,
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
    const where = {
      'players.userId': mongoose.Types.ObjectId(userId),
      status: { $ne: statuses.GAME.FINISHED }
    }

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

  async get(gameId) {
    return Game.findById(gameId)
      .populate('players.userId')
      .populate('board')
      .exec()
  },

  async listChats(gameId) {
    const game = await Game.findById(gameId)
      .populate('messages.sender')
      .exec()

    if (!game) return null

    return game.messages.map(i => i.toObject()).sort((a, b) => new Date(b.time) - new Date(a.time))
  },

  async play() {

  }
}


import UserRepo from 'repositories/user.repository'
import GameRepo from 'repositories/game.repository'
import BoardRepo from 'repositories/board.repository'

export default {
  match(userId) {
    return UserRepo.findOne({ _id: { $ne: userId } })
  },

  async startGame({ player1, player2 }) {
    const selectedBoard = await BoardRepo.selectBoard()
    return await GameRepo.createGame({
      players: [
        player1,
        player2,
      ],
      board: selectedBoard.id,
    })
  },

  async listGames({ userId, lastKey }) {
    return GameRepo.list({ userId, lastKey })
  },
}
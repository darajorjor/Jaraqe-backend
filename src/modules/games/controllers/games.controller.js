// import DeviceRepository from 'repositories/device.repository'
// import transformDevice from '../transformers/device.transformer'
import gameService from '../services/game.service'

export default {
  async smartMatch(req, res, next) {
    try {
      const { user: { id } } = req

      //match with someone
      const matchedUser = await gameService.match(id)

      if (!matchedUser) {
        return res.build.notFound(res.messages.NO_ONE_MATCHED)
      }
      //create a game
      const game = await gameService.startGame({
        player1: id,
        player2: matchedUser._id
      })

      return res.build.success({ game }, res.messages.GAME_CREATED_SUCCESSFULLY)
    } catch (error) {
      switch (error.message) {
        default:
          return next(error);
      }
    }
  },

  async listGames(req, res, next) {
    try {
      const { lastKey } = req.query
      const { user: { id } } = req

      const result = await gameService.listGames({ userId: id, lastKey })

      return res.build.success(result)
    } catch (error) {
      switch (error.message) {
        default:
          return next(error);
      }
    }
  },

  getGame() {
  },
}

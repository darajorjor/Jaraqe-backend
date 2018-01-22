// import DeviceRepository from 'repositories/device.repository'
import transformGame from '../transformers/game.transformer'
import gameService from '../services/game.service'
import messages from 'src/constants/defaults/messages.default'

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
        player: id,
        player2: matchedUser._id
      })

      return res.build.success({ game: transformGame(game) }, res.messages.GAME_CREATED_SUCCESSFULLY)
    } catch (error) {
      switch (error.message) {
        default:
          return next(error);
      }
    }
  },
  async playWithUser(req, res, next) {
    try {
      const { user: { id } } = req
      const { userId } = req.params

      //create a game
      const game = await gameService.startGame({
        player: id,
        player2: userId
      })

      return res.build.success({ game: transformGame(game) }, res.messages.GAME_CREATED_SUCCESSFULLY)
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
      return res.build.success(result.map(game => transformGame(game)))
    } catch (error) {
      switch (error.message) {
        default:
          return next(error);
      }
    }
  },

  async playGame(req, res, next) {
    try {
      const { gameId } = req.params
      const { letters: rawLetters } = req.body
      const { user: { id } } = req

      //validate letters and letters on board
      //check bonuses
      const { letters, game, words } = await gameService.validateLetters({ userId: id, gameId, letters: rawLetters })

      if (words.length === 0) {
        return res.build.notFound(messages.WORD_NOT_IN_DICTIONARY)
      }
      //check if they form a word
      await Promise.all(words.map(async (word) => {
        await gameService.checkWord(word.word)
      }))

      //use it
      const newGame = await gameService.play({ userId: id, game, words, letters })

      return res.build.success({ game: transformGame(newGame.toObject()) })
    } catch (error) {
      switch (error.message) {
        case messages.LETTER_NOT_VALID:
          res.build.forbidden(messages.LETTER_NOT_VALID)
          break
        case messages.NOT_YOUR_GAME:
          res.build.forbidden(messages.NOT_YOUR_GAME)
          break
        case messages.WORD_NOT_IN_DICTIONARY:
          res.build.notFound(messages.WORD_NOT_IN_DICTIONARY)
          break
        default:
          return next(error);
      }
    }
  },

  getGame() {
  },
}

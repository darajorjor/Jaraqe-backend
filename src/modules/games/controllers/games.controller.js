// import DeviceRepository from 'repositories/device.repository'
import GameRepo from 'repositories/game.repository'
import transformGame, { singleGameTransformer } from '../transformers/game.transformer'
import transformUser from 'src/modules/users/transformers/user.transformer'
import gameService from '../services/game.service'
import messages from 'src/constants/defaults/messages.default'
import statuses from 'src/constants/enums/status.enum'

export default {
  async gameIdParam(req, res, next, id) {
    // do validation on name here
    // blah blah validation
    // log something so we know its working
    console.log('doing name validations on ' + id);
    let game = await GameRepo.findById(id)
    if (game.status === statuses.GAME.INACTIVE) {
      return res.build.forbidden(messages.GAME_INACTIVE)
    }

    if (!game) {
      return res.build.notFound(messages.GAME_NOT_FOUND)
    }

    // once validation is done save the new item in the req
    req.game = game;
    // go to the next thing
    next();
  },

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

      return res.build.success({ game: singleGameTransformer(game) }, res.messages.GAME_CREATED_SUCCESSFULLY)
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

      return res.build.success({ game: singleGameTransformer(game) }, res.messages.GAME_CREATED_SUCCESSFULLY)
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

  async getGame(req, res, next) {
    try {
      const { user: { id } } = req
      const { gameIdAlt } = req.params

      const game = await gameService.getGame({ userId: id, gameId: gameIdAlt })

      return res.build.success(singleGameTransformer(game))
    } catch (error) {
      switch (error.message) {
        default:
          return next(error);
      }
    }
  },

  async listGameChats(req, res, next) {
    try {
      const { gameIdAlt } = req.params

      const messages = await gameService.getGameChats(gameIdAlt)

      return res.build.success({ messages: messages.map(({ sender, ...rest }) => ({ ...rest, sender: transformUser(sender) })) })
    } catch (error) {
      switch (error.message) {
        default:
          return next(error);
      }
    }
  },

  async playGame(req, res, next) {
    try {
      const { letters: rawLetters } = req.body
      const { user: { id }, game } = req

      if (game.status === statuses.GAME.FINISHED) {
        return res.build.forbidden(messages.GAME_FINISHED)
      }

      //validate letters and letters on board
      //check bonuses
      debugger
      const { letters, game: playedGame, words } = await gameService.validateLetters({ userId: id, game, letters: rawLetters })

      if (words.length === 0) {
        return res.build.notFound(messages.WORD_NOT_IN_DICTIONARY)
      }
      //check if they form a word
      await Promise.all(words.map(async (word) => {
        word.word = await gameService.checkWord(word.word)
      }))

      //use it
      const newGame = await gameService.play({ userId: id, game: playedGame, words: words.map(w => {
        w.id = w.word.id
        w.word = w.word.word
        return w
      }), letters })

      return res.build.success({ game: singleGameTransformer(newGame) })
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

  async surrenderGame(req, res, next) {
    try {
      const { user: { id }, game } = req

      if (game.status === statuses.GAME.FINISHED) {
        return res.build.forbidden(messages.GAME_FINISHED)
      }

      const surrenderedGame = await gameService.surrender({ userId: id, game })

      res.build.success({ game: singleGameTransformer(surrenderedGame )})
    } catch (error) {
      switch (error.message) {
        default:
          return next(error);
      }
    }
  },

  async swap(req, res, next) {
    try {
      const { letters, isPlus } = req.body
      const { user: { id }, game } = req

      if (game.status === statuses.GAME.FINISHED) {
        return res.build.forbidden(messages.GAME_FINISHED)
      }

      const rack = await gameService.swapLetters({ game, userId: id, letters, isPlus })

      return res.build.success({ rack })
    } catch (error) {
      switch (error.message) {
        case messages.NOT_YOUR_TURN:
          return res.build.forbidden(messages.NOT_YOUR_TURN)
        case messages.SWAPPLUS_NOT_AVAILABLE:
          return res.build.forbidden(messages.SWAPPLUS_NOT_AVAILABLE)
        default:
          return next(error);
      }
    }
  },
}

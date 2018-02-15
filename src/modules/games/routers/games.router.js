import { Router } from 'express'
import validate from 'express-validation'
import rules from '../validators'
import userMiddleware from 'src/middlewares/userSession.middleware'
import deviceMiddleware from 'src/middlewares/deviceToken.middleware'
import { gamesController } from '../controllers'

const router = Router()

router.post('/smart-match',
  // deviceMiddleware,
  userMiddleware,
  // validate(rules.registerDevice),
  gamesController.smartMatch,
)

router.post('/play-with-user/:userId',
  // deviceMiddleware,
  userMiddleware,
  // validate(rules.registerDevice),
  gamesController.playWithUser,
)

router.post('/:gameId/play',
  // deviceMiddleware,
  userMiddleware,
  // validate(rules.registerDevice),
  gamesController.playGame,
)

router.post('/:gameId/swap',
  // deviceMiddleware,
  userMiddleware,
  // validate(rules.registerDevice),
  gamesController.swap,
)

router.post('/:gameId/surrender',
  // deviceMiddleware,
  userMiddleware,
  // validate(rules.registerDevice),
  gamesController.surrenderGame,
)

router.get('/:gameId',
  // deviceMiddleware,
  userMiddleware,
  // validate(rules.registerDevice),
  gamesController.getGame,
)

router.get('/',
  // deviceMiddleware,
  userMiddleware,
  // validate(rules.registerDevice),
  gamesController.listGames,
)

module.exports = router

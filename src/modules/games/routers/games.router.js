import { Router } from 'express'
import validate from 'express-validation'
import rules from '../validators'
import userMiddleware from 'src/middlewares/userSession.middleware'
import deviceMiddleware from 'src/middlewares/deviceToken.middleware'
import { gamesController } from '../controllers'

const router = Router()

router.get('/',
  // deviceMiddleware,
  userMiddleware,
  // validate(rules.registerDevice),
  gamesController.listGames,
)

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

module.exports = router

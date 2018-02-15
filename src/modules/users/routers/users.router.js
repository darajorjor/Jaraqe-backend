import { Router } from 'express'
import userCtrl from '../controllers/user.controller'
import userMiddleware from 'src/middlewares/userSession.middleware'

const router = Router()

router.get('/self',
  userMiddleware,
  //validation,
  userCtrl.getSelfProfile
)

router.put('/self',
  userMiddleware,
  //validation,
  userCtrl.updateUser
)

router.get('/search',
  userMiddleware,
  //validation,
  userCtrl.searchUsers
)

router.post('/friend-requests/:friendRequestId',
  userMiddleware,
  //validation,
  userCtrl.respondToFriendRequest
)

router.post('/:userId/friendship',
  userMiddleware,
  //validation,
  userCtrl.changeUserFriendship
)

router.get('/:userId',
  userMiddleware,
  //validation,
  userCtrl.getUser
)

module.exports = router

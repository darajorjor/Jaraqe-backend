import { Router } from 'express'
// import validate from 'express-validation'
// import rules from '../validators'
import { storeController } from '../controllers'
import userMiddleware from 'src/middlewares/userSession.middleware'

const router = Router()

router.get('/',
  // validate(rules.registerDevice),
  userMiddleware,
  storeController.getStoreInfo,
)

router.post('/purchase',
  // validate(rules.registerDevice),
  userMiddleware,
  storeController.purchaseItem,
)

router.get('/purchase-coin',
  // validate(rules.registerDevice),
  userMiddleware,
  storeController.purchaseCoin,
)

module.exports = router

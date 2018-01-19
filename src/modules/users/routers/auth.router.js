import { Router } from 'express'
// import deviceToken from 'src/middlewares/deviceToken.middleware'
// import rules from '../validators'
// import validate from 'express-validation'
import { loginInstagramController } from '../controllers/auth.controller'

const router = Router()

router.get('/login-instagram',
  // deviceToken,
  // validate(rules.auth.login),
  loginInstagramController,
)

module.exports = router

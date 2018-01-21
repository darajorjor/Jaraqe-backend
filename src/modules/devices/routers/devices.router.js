import { Router } from 'express'
import validate from 'express-validation'
import rules from '../validators'
import { devicesController } from '../controllers'

const router = Router()

router.post('/',
  validate(rules.registerDevice),
  devicesController.registerDevice,
)

module.exports = router

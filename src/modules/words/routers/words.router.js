import { Router } from 'express'
// import validate from 'express-validation'
import { wordsController } from '../controllers'

const router = Router()

router.get('/',
  wordsController.getWordsInfo,
)

module.exports = router

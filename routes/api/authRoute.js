import express from 'express'
import authController from '../../controllers/authController.js'
import {phoneLimiter, codeLimiter} from '../../middlewares/rateLimit.js'

const router = express.Router() 

router.post('/sendCode', phoneLimiter, authController.handelSmsCode),
router.post('/smsAuth', codeLimiter, authController.handelSmsAuth) 

export default router
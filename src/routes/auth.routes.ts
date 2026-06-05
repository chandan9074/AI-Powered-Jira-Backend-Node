import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middlewares/validateSchema';
import { loginSchema, registerSchema, requestOtpSchema } from '../schemas/auth.schema';
import { issueCsrfToken, verifyCsrf } from '../middlewares/csrf';
import { otpLimiter } from '../middlewares/rateLimiter';

const router = Router();

router.get('/csrf-token', issueCsrfToken);

// router.post('/request-otp', otpLimiter, verifyCsrf, validate(requestOtpSchema), AuthController.requestOtp);

router.post('/request-otp', otpLimiter, validate(requestOtpSchema), AuthController.requestOtp);

router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', verifyCsrf, validate(loginSchema), AuthController.login);

export default router;
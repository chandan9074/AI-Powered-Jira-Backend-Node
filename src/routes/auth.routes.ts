import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middlewares/validateSchema';
import { loginSchema, registerSchema, requestOtpSchema } from '../schemas/auth.schema';
import { issueCsrfToken, verifyCsrf } from '../middlewares/csrf';
import { otpLimiter } from '../middlewares/rateLimiter';
import { ROUTES } from '../constants/routes';

const router = Router();

router.get(ROUTES.AUTH.CSRF_TOKEN, issueCsrfToken);

// router.post('/request-otp', otpLimiter, verifyCsrf, validate(requestOtpSchema), AuthController.requestOtp);

router.post(ROUTES.AUTH.REQUEST_OTP, otpLimiter, validate(requestOtpSchema), AuthController.requestOtp);

router.post(ROUTES.AUTH.REGISTER, validate(registerSchema), AuthController.register);
router.post(ROUTES.AUTH.LOGIN, verifyCsrf, validate(loginSchema), AuthController.login);

export default router;
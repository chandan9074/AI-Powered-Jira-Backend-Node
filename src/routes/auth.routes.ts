import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middlewares/validateSchema';
import { loginSchema, registerSchema } from '../schemas/auth.schema';
import { issueCsrfToken, verifyCsrf } from '../middlewares/csrf';

const router = Router();

router.get('/csrf-token', issueCsrfToken);

router.post('/register', verifyCsrf, validate(registerSchema), AuthController.register);
router.post('/login', verifyCsrf, validate(loginSchema), AuthController.login);

export default router;
import express from 'express';
import passport from 'passport';
import { 
    validateSignup,
    validateLogin,
    validateRecoverEmail,
    validatePasswordRecovery
} from '../../middleware/expressValidators.js';
import { checkUserRole } from '../../middleware/appMiddlewares.js';
import authController from '../../controllers/clientControllers/authController.js';

const router = express.Router();

router.post('/login', ...validateLogin, passport.authenticate('local'), checkUserRole, authController.login);

router.post('/signup', ...validateSignup, authController.signup);

router.post('/logout', authController.logout);

router.post('/request_email_pwd_recovery', ...validateRecoverEmail, authController.requestPasswordRecovery);

router.patch('/reset_password', ...validatePasswordRecovery, authController.resetPassword);

export default router;

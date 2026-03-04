import express from 'express';
import passport from 'passport';
import { validateSignup, validateLogin } from '../../middleware/expressValidators.js';
import { checkAdminRole } from '../../middleware/appMiddlewares.js';
import authController from '../../controllers/adminControllers/authController.js';

const router = express.Router();

router.post('/login', ...validateLogin, passport.authenticate('local'), checkAdminRole, authController.login);

router.post('/signup', ...validateSignup, authController.signup);

router.post('/logout', authController.logout);

export default router;
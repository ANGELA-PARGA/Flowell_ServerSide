import express from 'express';
import dotenv from 'dotenv';
dotenv.config({ path: 'variables.env' });
import { checkAuthenticated, checkAdminRole } from '../../middleware/appMiddlewares.js'
import { validateId } from '../../middleware/expressValidators.js';
import userController from '../../controllers/adminControllers/userController.js';

const router = express.Router();

router.get('/', checkAuthenticated, checkAdminRole, userController.getAllUsers);

router.get('/:id/user_info', checkAuthenticated, checkAdminRole, ...validateId, userController.getUserInfo);

router.get('/:id/orders_history', checkAuthenticated, checkAdminRole, ...validateId, userController.getUserOrdersHistory);

export default router;
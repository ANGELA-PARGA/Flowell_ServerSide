import express from 'express';
import { 
    updateUserValidators, 
    validatePasswordUpdate, 
    resourceValidator, 
    validateIdAndResource
} from '../../middleware/expressValidators.js';
import { checkAuthenticated } from '../../middleware/appMiddlewares.js';
import userController from '../../controllers/clientControllers/userController.js';

const router = express.Router();

router.get('/', checkAuthenticated, userController.getUserProfile);

router.post('/:resourceType', checkAuthenticated, resourceValidator, updateUserValidators, userController.addUserInfo);

router.patch('/:resourceType/:resourceId', checkAuthenticated, ...validateIdAndResource, updateUserValidators, userController.updateUserInfo);

router.patch('/mine', checkAuthenticated, ...validatePasswordUpdate, userController.updatePassword);

router.delete('/:resourceType/:resourceId', checkAuthenticated, ...validateIdAndResource, userController.deleteUserInfo);

export default router;
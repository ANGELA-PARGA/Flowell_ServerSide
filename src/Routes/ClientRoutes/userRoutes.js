import express from 'express';
import dotenv from 'dotenv';
dotenv.config({ path: 'variables.env' });
import { 
    updateUserValidators, 
    updatePasswordValidators, 
    resourceValidator, 
    handleValidationErrors
} from '../../Utilities/expressValidators.js'
import { checkAuthenticated } from '../../middleware/appMiddlewares.js'
import { userService } from '../../config/container.js'

const router = express.Router();
router.get('/', checkAuthenticated, async (req, res, next) => {
    try {
        const user_id = req.user.id;
        const response = await userService.getUserInfo(user_id);
        res.status(200).json({
            status: 'success',
            message: 'User profile retrieved successfully',
            code: 200,
            user: response 
        });
    } catch(err) {
        next(err);
    }
});

router.post('/:resourceType', checkAuthenticated, resourceValidator, updateUserValidators,
            handleValidationErrors, async (req, res, next) => {
    try {
        const resource = req.params.resourceType
        const data = req.body
        const user_id = req.user.id;
        const response = await userService.addUserInfo({user_id, resource:resource, ...data});
        res.status(200).json({
            status: 'success',
            message: 'New user information was added successfully',
            code: 200,
            user_info: response 
        });
    } catch(err) {
        next(err);
    }        
});

router.patch('/:resourceType/:resourceId', checkAuthenticated, resourceValidator, updateUserValidators, 
            handleValidationErrors, async (req, res, next) => {
    try {
        const resource = req.params.resourceType
        const resource_id = parseInt(req.params.resourceId, 10);
        const data = req.body
        const response = await userService.updateUserInfo({id:resource_id, resource, ...data});
        res.status(200).json({
            status: 'success',
            message: 'The user information was updated successfully',
            code: 200,
            user_info: response 
        });
    } catch(err) {
        next(err);
    }        
});

router.patch('/mine', checkAuthenticated, updatePasswordValidators, handleValidationErrors, 
            async (req, res, next) => {
    try {
        const password = req.body.password
        const user_id = req.user.id;
        const response = await userService.updateUserPassword({id:user_id, password});
        res.status(200).json({
            status: 'success',
            message: 'The user password was updated successfully',
            code: 200,
            user_info: response 
        });
    } catch(err) {
        next(err);
    }        
});

router.delete('/:resourceType/:resourceId', checkAuthenticated, resourceValidator, 
                handleValidationErrors, async (req, res, next) => {
    try {
        const resource = req.params.resourceType
        const resource_id = parseInt(req.params.resourceId, 10);
        const user_id = req.user.id;
        const response = await userService.deleteUserInfo({param1:resource_id, param2:user_id, resource:resource});
        res.status(200).json({
            status: 'success',
            message: 'the user information was succesfully deleted',
            code: 200,
            response: response.message 
        });
    } catch(err) {
        next(err);
    }        
});

export default router;
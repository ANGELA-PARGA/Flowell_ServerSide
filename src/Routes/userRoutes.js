const express = require('express');
const router = express.Router();
const { updateUserValidators, resourceValidator ,checkAuthenticated,
        handleValidationErrors} = require('../Utilities/expressValidators')

const UserService = require('../ServicesLogic/UserService')

router.get('/', checkAuthenticated, async (req, res, next) => {
    try {
        console.log('calling api route for user info', req.user, req.session)
        const user_id = req.user.id;
        const response = await UserService.getUserInfo(user_id);
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
        console.log('calling api route for add new user info', req.user, req.session, req.body, req.params.resourceType)
        const resource = req.params.resourceType
        const data = req.body
        const user_id = req.user.id;
        const response = await UserService.addUserInfo({user_id, resource:resource, ...data});
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
        console.log('calling api route for patch new user info', req.user, req.session, req.body, req.params.resourceType)
        const resource = req.params.resourceType
        const resource_id = parseInt(req.params.resourceId, 10);
        const data = req.body
        const response = await UserService.updateUserInfo({id:resource_id, resource, ...data});
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

router.patch('/mine', checkAuthenticated, updateUserValidators, handleValidationErrors, 
            async (req, res, next) => {
    try {
        console.log('calling api route for patch password', req.user, req.session, req.body, req.params.resourceType)
        const data = req.body
        const user_id = req.user.id;
        const response = await UserService.updateUserPassword({id:user_id, ...data});
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
        console.log('calling api route for delete new user info', req.user, req.session, req.params.resourceType)
        const resource = req.params.resourceType
        const resource_id = parseInt(req.params.resourceId, 10);
        const user_id = req.user.id;
        const response = await UserService.deleteUserInfo({param1:resource_id, param2:user_id, resource:resource});
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

module.exports = router;
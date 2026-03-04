import { userService } from '../../config/container.js';

class UserController {
    /**
     * Get user profile information
     */
    async getUserProfile(req, res, next) {
        try {
            const user_id = req.user.id;
            const response = await userService.getUserInfo(user_id);
            console.log('Fetched user profile for user_id:', response);
            res.status(200).json({
                status: 'success',
                code: 200,
                user: response 
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * Add new user information (address, contact, etc.)
     */
    async addUserInfo(req, res, next) {
        try {
            const resource = req.params.resourceType;
            const data = req.body;
            const user_id = req.user.id;
            console.log('Adding user info:', { user_id, resource, ...data });
            const response = await userService.addUserInfo({ user_id, resource: resource, ...data });
            console.log('Added user info response:', response);
            res.status(200).json({
                status: 'success',
                code: 200,
                user_info: response 
            });
        } catch (err) {
            next(err);
        }        
    }

    /**
     * Update existing user information
     */
    async updateUserInfo(req, res, next) {
        try {
            const resource = req.params.resourceType;
            const resource_id = parseInt(req.params.resourceId, 10);
            const data = req.body;
            console.log('Updating user info:', { id: resource_id, resource, ...data });
            const response = await userService.updateUserInfo({ id: resource_id, resource, ...data });
            console.log('Updated user info response:', response);
            res.status(200).json({
                status: 'success',
                code: 200,
                user_info: response 
            });
        } catch (err) {
            next(err);
        }        
    }

    /**
     * Update user password
     */
    async updatePassword(req, res, next) {
        try {
            const password = req.body.password;
            const user_id = req.user.id;
            const response = await userService.updateUserPassword({ id: user_id, password });
            res.status(200).json({
                status: 'success',
                code: 200,
                user_info: response 
            });
        } catch (err) {
            next(err);
        }        
    }

    /**
     * Delete user information (address, contact, etc.)
     */
    async deleteUserInfo(req, res, next) {
        try {
            const resource = req.params.resourceType;
            const resource_id = parseInt(req.params.resourceId, 10);
            const user_id = req.user.id;
            const response = await userService.deleteUserInfo({ param1: resource_id, param2: user_id, resource: resource });
            console.log('Deleted user info response:', response);
            res.status(200).json({
                status: 'success',
                code: 200,
                response: response.message 
            });
        } catch (err) {
            next(err);
        }        
    }
}

export default new UserController();
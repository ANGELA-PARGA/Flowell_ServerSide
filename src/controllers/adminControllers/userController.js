import { userService } from '../../config/container.js';

class UserAdminController {
    /**
     * Get all users with pagination and search
     */
    async getAllUsers(req, res, next) {
        try {
            const limit = 10;
            const page = parseInt(req.query.page) || 1;
            const offset = (page - 1) * limit;
            const search = req.query.term;

            const response = await userService.loadAllUsers(limit, offset, search);
            const totalUsers = await userService.returnTotalNumber(search);

            res.status(200).json({
                status: 'success',
                message: 'Users retrieved successfully',
                code: 200,
                users: response,
                pagination: {
                    limit,
                    page,
                    totalPages: Math.ceil(totalUsers / limit),
                    totalUsers: totalUsers
                }
            });
        } catch(err) {
            next(err);
        }
    }

    /**
     * Get specific user information by ID
     */
    async getUserInfo(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const response = await userService.getUserInfo(id);
            
            res.status(200).json({
                status: 'success',
                message: 'User information retrieved successfully',
                code: 200,
                user: response 
            });
        } catch(err) {
            next(err);
        }
    }

    /**
     * Get user's orders history
     */
    async getUserOrdersHistory(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            const response = await userService.getUserOrdersHistory(id);
            
            res.status(200).json({
                status: 'success',
                message: 'Orders history information retrieved successfully',
                code: 200,
                orders: response 
            });
        } catch(err) {
            next(err);
        }
    }
}

export default new UserAdminController();
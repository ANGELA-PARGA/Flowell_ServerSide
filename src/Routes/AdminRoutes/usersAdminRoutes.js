require('dotenv').config({ path: 'variables.env' });
const express = require('express');
const router = express.Router();
const { checkAuthenticated, checkAdminRole } = require('../../middleware/appMiddlewares')
const {selectTotalUsersQuery} = require('../../DBQueries/userQueries');
const { idParamsValidator, handleValidationErrors } = require('../../Utilities/expressValidators');
const UserAdminService = require('../../ServicesLogic/ServicesAdminLogic/userAdminService');

router.get('/', checkAuthenticated, checkAdminRole, async (req, res, next) => {
    try {
        const limit = 10;
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * limit;
        const search = req.query.term;

        const response = await UserAdminService.loadAllUsers(limit, offset, search);
        const totalUsers = await selectTotalUsersQuery(search);

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
});


router.get('/:id/user_info', checkAuthenticated, checkAdminRole, idParamsValidator, handleValidationErrors, 
    async (req, res, next) => {
        try {
            const id = parseInt(req.params.id, 10);
            const response = await UserAdminService.getUserInfo(id);
            res.status(200).json({
                status: 'success',
                message: 'User information retrieved successfully',
                code: 200,
                user: response 
            });
        } catch(err) {
            next(err);
        }
});

router.get('/:id/orders_history', checkAuthenticated, checkAdminRole, idParamsValidator, handleValidationErrors, 
    async (req, res, next) => {
        try {
            const id = parseInt(req.params.id, 10);
            const response = await UserAdminService.getUserOrdersHistory(id);
            res.status(200).json({
                status: 'success',
                message: 'Orders history information retrieved successfully',
                code: 200,
                orders: response 
            });
        } catch(err) {
            next(err);
        }
});


module.exports = router;
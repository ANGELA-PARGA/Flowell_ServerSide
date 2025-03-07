const createError = require('http-errors');
const {selectAllUserInfoQuery, selectAllUsersQuery} = require('../../DBQueries/userQueries')
const {selectAllOrderInfoQuery} = require('../../DBQueries/orderQueries')
const {standardSelectQuery} = require('../../DBQueries/generalQueries')


module.exports = class UserAdminModel {
    /**
     * Load all users on the DB: 
     * @returns {Array}
     * @throws {Error}
     */
    static async loadAllUsers(limit, offset, search){
        try {
            const usersFound = await selectAllUsersQuery(limit, offset, search)
            return usersFound
        } catch (error) {
            const dbError = createError(
                error.status || (error.code ? 400 : 500), // If error.code exists, it's likely a DB error
                error.code 
                    ? 'DatabaseError: Issue while loading all users on DB' 
                    : 'ServerError: Unexpected error while loading all users on DB'
            );

            dbError.name = error.code ? 'DatabaseError' : 'ServerError';
            dbError.message = error.message || 'An unexpected error occurred while loading all users on DB';
            dbError.details = error.details || (error.code ? 'Possible constraint violation' : 'No additional details');
            dbError.stack = process.env.NODE_ENV === 'development' ? error.stack : 'userAdminModel / loadAllUsers';
            dbError.timestamp = new Date().toISOString();

            throw dbError;
        }
    }
    
    
    /**
     * Find an user using the email account: 
     * @param {string} email
     * @returns {Object}
     * @throws {Error}
     */
    static async findUserByEmail(email){
        try {
            const foundUser = await standardSelectQuery(email, 'users', 'email')  
            return foundUser
        } catch (error) {
            const dbError = createError(
                error.status || (error.code ? 400 : 500), // If error.code exists, it's likely a DB error
                error.code 
                    ? 'DatabaseError: Issue while finding user by email' 
                    : 'ServerError: Unexpected error while finding user by email'
            );
    
            dbError.name = error.code ? 'DatabaseError' : 'ServerError';
            dbError.message = error.message || 'An unexpected error occurred while finding user by email';
            dbError.details = error.details || (error.code ? 'Possible constraint violation' : 'No additional details');
            dbError.stack = process.env.NODE_ENV === 'development' ? error.stack : 'userAdminModel / findUserByEmail';
            dbError.timestamp = new Date().toISOString();
    
            throw dbError;
        }
    }

    /**
     * Find an user using the user id: 
     * @param {number} user_id
     * @returns {Object}
     * @throws {Error}
     */
    static async findAllUserInfoById(user_id){
        try {
            console.log('findAllUserInfoById MODEL CALL', user_id)  
            const userCompleteInfo = await selectAllUserInfoQuery(user_id);
            return userCompleteInfo;    
        } catch (error) {
             // If it's a custom error (like a 404), rethrow it
            if (error.status === 404) {
                throw error;
            }

            // Handle unexpected database errors
            const dbError = createError(
                error.status || (error.code ? 400 : 500), // If error.code exists, it's likely a DB error
                error.code 
                    ? 'DatabaseError: Issue while finding all user information' 
                    : 'ServerError: Unexpected error while finding all user information'
            );
    
            dbError.name = error.code ? 'DatabaseError' : 'ServerError';
            dbError.message = error.message || 'An unexpected error occurred while finding all user information';
            dbError.details = error.details || (error.code ? 'Possible constraint violation' : 'No additional details');
            dbError.stack = process.env.NODE_ENV === 'development' ? error.stack : 'userAdminModel / findAllUserInfoById';
            dbError.timestamp = new Date().toISOString();
    
            throw dbError; 
        }
    }

    /**
     * Find user's orders using the user id: 
     * @param {number} user_id
     * @returns {Object}
     * @throws {Error}
     */
    static async findAllUserOrdersById(user_id){
        try {
            console.log('findAllUserOrdersById MODEL CALL', user_id)  
            const userOrdersInfo = await selectAllOrderInfoQuery(user_id, 'user_id');
            return userOrdersInfo;    
        } catch (error) {
             // If it's a custom error (like a 404), rethrow it
            if (error.status === 404) {
                throw error;
            }

            // Handle unexpected database errors
            const dbError = createError(
                error.status || (error.code ? 400 : 500), // If error.code exists, it's likely a DB error
                error.code 
                    ? 'DatabaseError: Issue while finding all users orders information' 
                    : 'ServerError: Unexpected error while finding all users orders information'
            );
    
            dbError.name = error.code ? 'DatabaseError' : 'ServerError';
            dbError.message = error.message || 'An unexpected error occurred while finding all users orders information';
            dbError.details = error.details || (error.code ? 'Possible constraint violation' : 'No additional details');
            dbError.stack = process.env.NODE_ENV === 'development' ? error.stack : 'userAdminModel / findAllUserOrdersById';
            dbError.timestamp = new Date().toISOString();
    
            throw dbError; 
        }
    }
}
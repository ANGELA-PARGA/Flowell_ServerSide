const createError = require('http-errors');
const moment = require('moment');
const { hashPassword, verifyResource } = require('../../Utilities/utilities');
const {selectAllUserInfoQuery} = require('../../DBQueries/userQueries')
const {insertQuery, updateQuery, standardSelectQuery, deleteDoubleConditionQuery} = require('../../DBQueries/generalQueries')


module.exports = class UserModel {
    constructor(data){
        this.created_at = moment.utc().toISOString();
        this.updated_at = moment.utc().toISOString();
        this.first_name = data.first_name;
        this.last_name = data.last_name;
        this.email = data.email;
        this.role = data.role;
    }
    
    /**
     * Create an user using DATA OBJECT: 
     * @param {string} first_name
     * @param {string} last_name
     * @param {string} email
     * @param {string} password
     * @returns {Object}
     * @throws {Error}
     */
    async createUser(data){
        try {
            const newUser = new UserModel(data);
            const passwordHashed = await hashPassword(data.password);    
            newUser.password = passwordHashed;

            const userCreated = await insertQuery(newUser, 'users');
            return userCreated

        } catch(error) {
            const dbError = createError(
                error.status || (error.code ? 400 : 500), // If error.code exists, it's likely a DB error
                error.code 
                    ? 'DatabaseError: Issue while creating the user' 
                    : 'ServerError: Unexpected error while creating the user'
            );
    
            dbError.name = error.code ? 'DatabaseError' : 'ServerError';
            dbError.message = error.message || 'An unexpected error occurred while creating a user';
            dbError.details = error.details || (error.code ? 'Possible constraint violation' : 'No additional details');
            dbError.stack = process.env.NODE_ENV === 'development' ? error.stack : 'userModel / createUser';
            dbError.timestamp = new Date().toISOString();
    
            throw dbError;
        }
    }

    /**
     * Update the user's password using an object that have the user ID and the new password: 
     * @param {number} id
     * @param {string} password
     * @returns {Object}
     * @throws {Error}
     */
    static async updateUserPassword(data){
        try {
            const { id, password } = data;
            if(password && password.length > 0){
                const passwordHashed = await hashPassword(password);
                const updatedUser = await updateQuery({id, password:passwordHashed}, 'id', 'users')
                return updatedUser;  
            }
        } catch (error) {
            const dbError = createError(
                error.status || (error.code ? 400 : 500), // If error.code exists, it's likely a DB error
                error.code 
                    ? 'DatabaseError: Issue while updating the user password' 
                    : 'ServerError: Unexpected error while updating the user password'
            );
    
            dbError.name = error.code ? 'DatabaseError' : 'ServerError';
            dbError.message = error.message || 'An unexpected error occurred while updating a user password';
            dbError.details = error.details || (error.code ? 'Possible constraint violation' : 'No additional details');
            dbError.stack = process.env.NODE_ENV === 'development' ? error.stack : 'userModel / updateUserPassword';
            dbError.timestamp = new Date().toISOString();
    
            throw dbError;
        }
    }

    /**
     * Update the user's personal information using an object (data) with the needed 
     * information plus an ID of the resource, the type of resource (basic user info, 
     * address info, contact info, payment info) to update: 
     * @param {Object} data 
     * @returns {Object}
     * @throws {Error}
     */
    static async updateUserInfo(data){
        try {
            const { id, resource, ...params } = data
            const tableName = verifyResource(resource);        
            const updatedUserInfo = await updateQuery({id, ...params}, 'id', tableName)
            return updatedUserInfo;
        } catch (error) {
            console.log('ERROR', error)
            const dbError = createError(
                error.status || (error.code ? 400 : 500), // If error.code exists, it's likely a DB error
                error.code 
                    ? 'DatabaseError: Issue while updating the user information' 
                    : 'ServerError: Unexpected error while updating the user information'
            );
    
            dbError.name = error.code ? 'DatabaseError' : 'ServerError';
            dbError.message = error.message || 'An unexpected error occurred while updating a user information';
            dbError.details = error.details || (error.code ? 'Possible constraint violation' : 'No additional details');
            dbError.stack = process.env.NODE_ENV === 'development' ? error.stack : 'userModel / updateUserInfo';
            dbError.timestamp = new Date().toISOString();
    
            throw dbError;          
        }
    }

    /**
     * Add new user's information using data object with the data to be added and the resource to determine
     * which table to be used: 
     * @param {Object} data 
     * @returns {Object}
     * @throws {Error}
     */
    static async addNewUserInfo(data){
        try {
            const { user_id, resource, ...params } = data
            params.created_at = moment.utc().toISOString();
            params.updated_at = moment.utc().toISOString();
            const tableName = verifyResource(resource);            
            const newUserInfo = await insertQuery({user_id, ...params}, tableName)
            return newUserInfo;            
        } catch (error) {
            const dbError = createError(
                error.status || (error.code ? 400 : 500), // If error.code exists, it's likely a DB error
                error.code 
                    ? 'DatabaseError: Issue while adding new user information' 
                    : 'ServerError: Unexpected error while adding new user information'
            );
    
            dbError.name = error.code ? 'DatabaseError' : 'ServerError';
            dbError.message = error.message || 'An unexpected error occurred while adding new user information';
            dbError.details = error.details || (error.code ? 'Possible constraint violation' : 'No additional details');
            dbError.stack = process.env.NODE_ENV === 'development' ? error.stack : 'userModel / addNewUserInfo';
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
            dbError.stack = process.env.NODE_ENV === 'development' ? error.stack : 'userModel / findUserByEmail';
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
            dbError.stack = process.env.NODE_ENV === 'development' ? error.stack : 'userModel / findAllUserInfoById';
            dbError.timestamp = new Date().toISOString();
    
            throw dbError; 
        }
    }

    /**
     * Delete user information using the following parameters: 
     * @param {number} param1 id
     * @param {number} param2 user_id
     * @returns {boolean}
     * @throws {Error}
     */
    static async deleteUserInfo(data){
        try {
            const { param1, param2, resource } = data
            const tableName = verifyResource(resource)

            const deletedResource = await deleteDoubleConditionQuery({param1, param2}, tableName, 'id', 'user_id');
            if(!deletedResource){
                return false
            }
            return true;
        } catch (error) {
            const dbError = createError(
                error.status || (error.code ? 400 : 500), // If error.code exists, it's likely a DB error
                error.code 
                    ? 'DatabaseError: Issue while deleting user information' 
                    : 'ServerError: Unexpected error while deleting user information'
            );
    
            dbError.name = error.code ? 'DatabaseError' : 'ServerError';
            dbError.message = error.message || 'An unexpected error occurred while deleting user information';
            dbError.details = error.details || (error.code ? 'Possible constraint violation' : 'No additional details');
            dbError.stack = process.env.NODE_ENV === 'development' ? error.stack : 'userModel / deleteUserInfo';
            dbError.timestamp = new Date().toISOString();
    
            throw dbError;            
        }
    }
}
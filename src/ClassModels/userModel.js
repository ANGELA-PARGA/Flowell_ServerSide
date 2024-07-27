const createError = require('http-errors');
const moment = require('moment');
const { hashPassword, verifyResource } = require('../Utilities/utilities');
const {selectAllUserInfoQuery} = require('../DBQueries/userQueries')
const {insertQuery, updateQuery, standardSelectQuery, deleteDoubleConditionQuery} = require('../DBQueries/generalQueries')

module.exports = class UserModel {
    constructor(data){
        this.created = moment.utc().toISOString();
        this.modified = moment.utc().toISOString();
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
            throw createError(500, 'error on server while creating the user', error.stack, error);
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
            throw createError(500, 'error on server while updating the user password', error.stack, error);            
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
            throw createError(500, `error updating the user information`, error.stack, error);            
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
            params.created = moment.utc().toISOString();
            params.modified = moment.utc().toISOString();
            const tableName = verifyResource(resource);            
            const newUserInfo = await insertQuery({user_id, ...params}, tableName)
            return newUserInfo;            
        } catch (error) {
            throw createError(500, `error on server while adding the new user information`, error.stack, error);            
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
            throw createError(500, 'error on server while finding user by email', error.stack, error); 
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
            console.log('getting all user info', user_id)  
            const userCompleteInfo = await selectAllUserInfoQuery(user_id);
            return userCompleteInfo;    
        } catch (error) {
            throw createError(500, 'error finding user by ID', error.stack, error); 
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
            const tableName = verifyResource(resource);

            const deletedResource = await deleteDoubleConditionQuery({param1, param2}, tableName, 'id', 'user_id');
            if(!deletedResource){
                return false
            }
            return true;
        } catch (error) {
            throw createError(500, `error on server while deleting the user information`, error.stack, error);            
        }
    }
}
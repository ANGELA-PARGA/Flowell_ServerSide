const createError = require('http-errors');
const UserModel = require('../../models/client/userModel');
const { hashPassword, verifyResource, triggerRevalidationDashboard } = require('../Utilities/utilities');


module.exports = class UserService{
    constructor(userRepository, orderRepository) {
        this.userRepository = userRepository
        this.orderRepository = orderRepository
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
    async createUser(userData) {
        try {
            const newUser = new UserModel(userData);
            const passwordHashed = await hashPassword(userData.password);    
            newUser.password = passwordHashed;

            const userCreated = await this.userRepository.insert(newUser);
            return userCreated

        } catch (error) {
            throw error
        }
    }

    /**
     * CLIENT AND ADMIN METHOD: Find an user using the user id: 
     * @param {number} user_id
     * @returns {Object}
     * @throws {Error}
     */
    async getUserInfo(user_id){
        try {        
            const userCompleteInfo = await this.userRepository.selectById(user_id);
            if(!Object.keys(userCompleteInfo)?.length) {
                return 'User information was not found'
            }
            return userCompleteInfo; 
        } catch (error) {
            throw error            
        }
    }

    /**
     * CLIENT AND ADMIN METHOD: Find an user using the email account: 
     * @param {string} email
     * @returns {Object}
     * @throws {Error}
     */
    async findUserByEmail(email){
        try {
            const foundUser = await this.userRepository.select(email, 'email');  
            return foundUser
        } catch (error) {
            throw error
        }
    }

    /**
     * CLIENT METHOD: Update the user's personal information using an object (data) with the needed 
     * information plus an ID of the resource, the type of resource (basic user info, 
     * address info, contact info) to update: 
     * @param {Object} data 
     * @returns {Object}
     * @throws {Error}
     */    
    async updateUserInfo(userData){
        try {
            const { id, resource, ...params } = userData
            const tableName = verifyResource(resource);        
            const updatedUser = await this.userRepository.update({id, ...params}, undefined, tableName)
            
            // Trigger revalidation for the changed user
            if(!updatedUser?.user_id) { 
                updatedUser.user_id = userData.id;
            }
            const path = `/admin_panel/customers/${updatedUser.user_id}`;
            const tag = `customers`;
            await triggerRevalidationDashboard(path, tag);  

            return updatedUser;
        } catch (error) {
            throw error             
        }
    }

    /**
     * CLIENT METHOD: Update the user's password using an object that have the user ID and the new password: 
     * @param {number} id
     * @param {string} password
     * @returns {Object}
     * @throws {Error}
     */
    async updateUserPassword(userData){
        try {
            const { id, password } = userData;
            if(!password || password.length == 0){
                return createError(400, 'password is required to update the user password');
            }
            const passwordHashed = await hashPassword(password);
            const updatedUser = await this.userRepository.update({id, password:passwordHashed})
            return updatedUser;
        } catch (error) {
            throw error 
        }
    }

    /**
     * CLIENT METHOD: Add new user's information using data object with the data to be added and the resource to determine
     * which table to be used: 
     * @param {Object} userData 
     * @returns {Object}
     * @throws {Error}
     */
    async addUserInfo(userData){
        try {
            const { user_id, resource, ...params } = userData
            params.created_at = new Date().toISOString();
            params.updated_at = new Date().toISOString();
            const tableName = verifyResource(resource);            
            const newUserInfo = await this.userRepository.insert({user_id, ...params}, tableName)         
            
            // Trigger revalidation for the changed user
            const path = `/admin_panel/customers/${userData.user_id}`;
            const tag = `customers`;
            await triggerRevalidationDashboard(path, tag);

            return newUserInfo;             
        } catch (error) {
            throw error 
        }
    }

    /**
     * CLIENT METHOD: Delete user information using the following parameters: 
     * @param {number} param1 id
     * @param {number} param2 user_id
     * @param {string} resource the type of resource to be deleted (address, contact)
     * @returns {boolean}
     * @throws {Error}
     */
    async deleteUserInfo(data){
        try {          
            const { param1, param2, resource } = data
            const tableName = verifyResource(resource)

            const deletedResource = await this.userRepository.deleteInfo({param1, param2}, tableName);
            if(!deletedResource){
                return createError(400, 'the user information was not found')
            }
            // Trigger revalidation for the changed user
            const path = `/admin_panel/customers/${data.param2}`;
            const tag = `customers`;
            await triggerRevalidationDashboard(path, tag); 

            return {message: 'the user information was succesfully deleted', status:204};
        } catch (error) {
            throw error 
        }
    }

    /**
     * ADMIN METHOD: Load all users on the DB: 
     * @param {number} limit
     * @param {number} offset
     * @param {string} search
     * @returns {Array}
     * @throws {Error}
     */
    async loadAllUsers(limit, offset, search){
        try {       
            const usersFound = await this.userRepository.selectAll(limit, offset, search)
            return usersFound
        } catch (error) {
            throw error            
        }
    }

    /**
     * ADMIN METHOD: Find user's orders using the user id and the order repository: 
     * @param {number} user_id
     * @returns {Object}
     * @throws {Error}
     */
    async getUserOrdersHistory(user_id){
        try {       
            const userOrdersInfo = await this.orderRepository.findByUserId(user_id);
            return userOrdersInfo;
        } catch (error) {
            throw error            
        }
    }
}
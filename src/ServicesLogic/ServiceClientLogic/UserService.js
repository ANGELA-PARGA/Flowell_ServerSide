const createError = require('http-errors');
const UserModel = require('../../ClassModels/ClassClientModels/userModel');
const {triggerRevalidationDashboard} = require('../../Utilities/utilities');
const { use } = require('passport');

module.exports = class UserService{

    // this method expects the user_id
    static async getUserInfo(id){
        try {       
            const userFound = await UserModel.findAllUserInfoById(id)          
            if(!Object.keys(userFound)?.length) {
                return 'User information was not found'
            }
            return userFound;
        } catch (error) {
            throw error            
        }
    }

    // this method expects an object with {resource_id, ...data, resource}
    static async updateUserInfo(userData){
        try {
            const updatedUser = await UserModel.updateUserInfo(userData);
            if(!Object.keys(updatedUser)?.length) {
                throw createError(400, 'unable to update the user or user not found');
            }
            // Trigger revalidation for the changed user
            const path = `/admin_panel/customers/${updatedUser.user_id}`;
            const tag = `customers`;
            await triggerRevalidationDashboard(path, tag);   
            return updatedUser;
        } catch (error) {
            throw error             
        }
    }

    // this method expect the an object with {user_id, password}
    static async updateUserPassword(userData){
        try {
            const updatedUser = await UserModel.updateUserPassword(userData);
            if(!Object.keys(updatedUser)?.length) {
                throw createError(400, 'unable to update the user password or user not found');
            }
            return updatedUser;
        } catch (error) {
            throw error 
        }
    }

    // this method expects an object with {user_id, ...data, resource}
    static async addUserInfo(userData){
        try {
            const newUserInfo = await UserModel.addNewUserInfo(userData);
            if(!Object.keys(newUserInfo)?.length) {
                throw createError(400, 'unable to add new user information');
            }
            // Trigger revalidation for the changed user
            const path = `/admin_panel/customers/${userData.user_id}`;
            const tag = `customers`;
            await triggerRevalidationDashboard(path, tag);
            return newUserInfo;
        } catch (error) {
            throw error 
        }
    }

    // this method expects the data object { resource_id, user_id, resource }
    static async deleteUserInfo(data){
        console.log('data', data)
        try {          
            const infoToDelete = await UserModel.deleteUserInfo(data) 
            if(!infoToDelete) {
                throw createError(400, 'unable to delete the user information, or user information not found');
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
}
const createError = require('http-errors');
const UserModel = require('../ClassModels/userModel');

module.exports = class UserService{

    // this method expects the user_id
    static async getUserInfo(id){
        try {    
            console.log('getting all user info', id)     
            const userFound = await UserModel.findAllUserInfoById(id)          
            /*if(!Object.keys(userFound)?.length) {
                throw createError(404, 'User Not Found');
            }*/
            return userFound;
        } catch (error) {
            throw createError(500, 'Error on server while searching the user', error.stack, error);            
        }
    }

    // this method expects an object with {resource_id, ...data, resource}
    static async updateUserInfo(userData){
        try {
            const updatedUser = await UserModel.updateUserInfo(userData);
            if(!Object.keys(updatedUser)?.length) {
                throw createError(400, 'unable to update the user or user not found');
            }
            return updatedUser;
        } catch (error) {
            throw createError(500, 'Error on server while updating the user', error.stack, error);            
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
            throw createError(500, 'Error on server while updating the user password', error.stack, error);            
        }
    }

    // this method expects an object with {user_id, ...data, resource}
    static async addUserInfo(userData){
        try {
            const newUserInfo = await UserModel.addNewUserInfo(userData);
            if(!Object.keys(newUserInfo)?.length) {
                throw createError(400, 'unable to add new user information');
            }
            return newUserInfo;
        } catch (error) {
            throw createError(500, 'Error on server while adding new user information', error.stack, error);            
        }
    }

    // this method expects the data object { resource_id, user_id, resource }
    static async deleteUserInfo(data){
        try {          
            const infoToDelete = await UserModel.deleteUserInfo(data)  
            if(!infoToDelete) {
                throw createError(400, 'unable to delete the user information, or user information not found');
            }      
            return {message: 'the user information was succesfully deleted', status:204};
        } catch (error) {
            throw createError(500, 'Error on server while deleting the user info', error.stack, error);            
        }
    }
}
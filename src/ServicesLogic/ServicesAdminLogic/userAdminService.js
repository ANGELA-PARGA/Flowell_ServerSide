const UserAdminModel = require('../../ClassModels/ClassAdminModels/userAdminModel');

module.exports = class UserAdminService{

    static async loadAllUsers(limit, offset, search){
        try {       
            const usersFound = await UserAdminModel.loadAllUsers(limit, offset, search)       
            return usersFound;
        } catch (error) {
            throw error            
        }
    }

    // this method expects the user_id
    static async getUserInfo(id){
        try {       
            const userFound = await UserAdminModel.findAllUserInfoById(id)          
            return userFound;
        } catch (error) {
            throw error            
        }
    }

    // this method expects the user_id
    static async getUserInfoByEmail(email){
        try {       
            const userFound = await UserAdminModel.findUserByEmail(email)       
            return userFound;
        } catch (error) {
            throw error            
        }
    }

    // this method expects the user_id
    static async getUserOrdersHistory(id){
        try {       
            const ordersHistory = await UserAdminModel.findAllUserOrdersById(id)          
            return ordersHistory;
        } catch (error) {
            throw error            
        }
    }
    
}
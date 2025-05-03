const createError = require('http-errors');
const UserService = require('./UserService');
const { comparePasswords, triggerRevalidationDashboard } = require('../Utilities/utilities');


module.exports = class Authentication { 

    async register(userData){   
        try {
            const { email } = userData;
            const userFound = await UserService.findUserByEmail(email);

            if(userFound?.length){
                throw createError(409, 'Email already in use, please log in');
            }

            const user = await UserService.createUser(userData);

            if(!Object.keys(user)?.length){
                throw createError(400, 'The user could not be created');
            }
            // Trigger revalidation for the new user
            const path = `/admin_panel/customers`;
            await triggerRevalidationDashboard(path);

            return user;           
        } catch (error) {
            throw error;            
        }
    }

    static async login(email, password){
        try {
            const userFound = await UserService.findUserByEmail(email);

            if(!userFound?.length){
                throw createError(404, 'Incorrect username or password. Try again');
            }

            const comparingPasswords = await comparePasswords(password, userFound[0].password);

            if(!comparingPasswords){
                throw createError(403, 'Incorrect username or password. Try again')            
            }

            return userFound[0];
        } catch (error) {
            throw error;
        }
    }
}
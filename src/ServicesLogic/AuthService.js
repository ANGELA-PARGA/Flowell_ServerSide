const createError = require('http-errors');
const UserModel = require('../ClassModels/userModel');
const { comparePasswords } = require('../Utilities/utilities');

module.exports = class Authentication {
    
    async register(userData){
        try {
            const { email } = userData;
            const userFound = await UserModel.findUserByEmail(email);

            if(userFound?.length){
                throw createError(409, 'Email already in use, please log in');
            }

            const newUserInstance = new UserModel(userData);
            const newUser = await newUserInstance.createUser(userData);              
            if(!Object.keys(newUser)?.length){
                throw createError(400, 'The user could not be created');
            }
            return newUser;           
        } catch (error) {
            throw createError(500, 'Error on server while registering the new user', error.stack, error );            
        }
    }

    async login(email, password){
        try {
            const userFound = await UserModel.findUserByEmail(email);

            if(!userFound?.length){
                throw createError(404, 'The user does not exist, please sign up');
            }

            const comparingPasswords = await comparePasswords(password, userFound[0].password);       
            if(!comparingPasswords){
                throw createError(403, 'Incorrect username or password. Try again')            
            }
            return userFound[0];
        } catch (error) {
            throw createError(500, 'Error on server while authenticating the user', error.stack, error);            
        }
    }
}
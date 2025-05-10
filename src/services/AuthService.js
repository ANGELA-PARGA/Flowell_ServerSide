import createError from 'http-errors';
import { comparePasswords, triggerRevalidationDashboard } from '../Utilities/utilities.js'

export default class AuthService { 
    /**
     * This class is responsible for managing authentication logic, including user registration and login.
     * It uses the UserService to interact with the user data.
     * @param {UserService} userService - The service for managing authentication logic.
     */
    constructor(userService) {
        this.userService = userService
    }

    /**
     * Register a new user using the data object with the following properties:
     * @param {string} first_name
     * @param {string} last_name
     * @param {string} email
     * @param {string} password
     * @returns {Object|null}
     * @throws {Error}
     */
    async register(userData){   
        try {
            const { email } = userData;
            const userFound = await this.userService.findUserByEmail(email);

            if(userFound?.length){
                throw createError(409, 'Email already in use, please log in');
            }

            const user = await this.userService.createUser(userData);

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

    /**
     * Login a user using the email and password:
     * @param {string} email
     * @param {string} password
     * @returns {Object|null}
     * @throws {Error}
     */
    async login(email, password){
        try {
            const userFound = await this.userService.findUserByEmail(email);

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
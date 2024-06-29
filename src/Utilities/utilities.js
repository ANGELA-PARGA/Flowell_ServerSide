const bcrypt = require('bcrypt');

/**
 * Compares an unencrypted password with a password encrypted using bcrypt.
 * @param {string} password The unencrypted password.
 * @param {string} hashedPassword The hashed password.
 * @returns {boolean} Returns true if the passwords match, false otherwise.
 * @throws {Error} An error is thrown if the password comparison cannot be completed.
 */
async function comparePasswords(password, hashedPassword){
    try {
        const isMatch = await bcrypt.compare(password, hashedPassword);
        return isMatch;
    } catch (error) {
        throw new Error('The comparisson of the passwords cannot be completed' + error.message)        
    }
    
}

/**
 * Hash a password using bcrypt.
 * @param {string} password The password to hash.
 * @returns {string} The hashed password.
 * @throws {Error} An error is thrown if the password hashing cannot be completed.
 */
async function hashPassword(password){
    try {
        const saltRounds= 10;
        const salt= await bcrypt.genSalt(saltRounds);
        const passwordHashed = await bcrypt.hash(password, salt);
        return passwordHashed;
    } catch (error) {
        throw new Error('The hashing of the password cannot be completed' + error.message)        
    }
    
}


/**
 * Returns a table name in a string depending on the resource name.
 * @param {string} resource 
 * @returns {string} 
 * @throws {Error} 
 */
function verifyResource(resource){       
    try {
        if(resource === 'personal_inf'){
            return 'users'
        }
        if(resource === 'address_inf'){
            return 'users_addresses'
        }
        if(resource === 'payment_inf'){
            return 'users_credit_cards'
        }
        if(resource === 'contact_inf'){
            return 'users_phones'
        }        
    } catch (error) {
        throw new Error('The table associated with the resource could not be found' + error.message)        
    }    
}

const luhnCheck = (cardNumber) => {
    let arr = (cardNumber + '').split('').reverse().map(x => parseInt(x));
    let lastDigit = arr.splice(0, 1)[0];
    let sum = arr.reduce(
      (acc, val, i) => (i % 2 !== 0) ? acc + val : acc + ((val * 2) % 9) || 9,
        0
    );
    sum += lastDigit;
    return sum % 10 === 0;
};

module.exports = {
    comparePasswords: comparePasswords,
    hashPassword: hashPassword,
    verifyResource: verifyResource, 
    luhnCheck: luhnCheck   
}
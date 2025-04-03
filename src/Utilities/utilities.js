const crypto = require('crypto')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer');


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

const sendEmail = async (email, subject, message) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: subject,
            html: message
        };
        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {
        throw new Error('The email could not be sent' + error)        
    }
}

async function triggerRevalidationEccomerce(path, tag) {
    // This is because the dashboard is not deployed yet, so we need to skip the webhook call in development mode
    // and in production mode to not crash the deployed e commerce
    // After the deployment just delete the || condition.
    if (process.env.NODE_ENV !== 'production' || process.env.NODE_ENV === 'production') {
        console.log('Skipping webhook call in development mode.');
        return; // Exit gracefully
    }    
    const webhookUrl = process.env.ECOMMERCE_WEBHOOK_URL; 
    const secret = process.env.WEBHOOK_SECRET;
    if (!webhookUrl || !secret) {
        throw new Error('Webhook URL or secret not defined in environment variables');
    }

    if (!path || !tag) {
        throw new Error('Path and tag are required for revalidation');
    }
    // Create the request body
    // The body should include the path and tag for revalidation. Tag is optional, path is required.
    const pathTag = tag ? { path, tag } : { path };
    const body = JSON.stringify(pathTag);


    // Create HMAC signature using SHA-256
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(body);
    const signature = hmac.digest('hex');

    // Send the webhook request with the signature header
    const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-webhook-signature': signature,
        },
        body,
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(`Failed to revalidate: ${data.message}`);
    }
}

async function triggerRevalidationDashboard(path, tag) {
    // This is because the dashboard is not deployed yet, so we need to skip the webhook call in development mode
    // and in production mode to not crash the deployed e commerce
    // To test / developer mode, comment this condition.
    if (process.env.NODE_ENV !== 'production' || process.env.NODE_ENV === 'production') {
        console.log('Skipping webhook call while the dahsboard is deployed.');
        return; // Exit gracefully
    } 
    const webhookUrl = process.env.DASHBOARD_WEBHOOK_URL; 
    const secret = process.env.WEBHOOK_SECRET;
    if (!webhookUrl || !secret) {
        throw new Error('Webhook URL or secret not defined in environment variables');
    }

    if (!path || !tag) {
        throw new Error('Path and tag are required for revalidation');
    }
    // Create the request body
    // The body should include the path and tag for revalidation. Tag is optional, path is required.
    const pathTag = tag ? { path, tag } : { path };
    const body = JSON.stringify(pathTag);


    // Create HMAC signature using SHA-256
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(body);
    const signature = hmac.digest('hex');

    // Send the webhook request with the signature header
    const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-webhook-signature': signature,
        },
        body,
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(`Failed to revalidate: ${data.message}`);
    }
}




module.exports = {
    comparePasswords: comparePasswords,
    hashPassword: hashPassword,
    verifyResource: verifyResource, 
    luhnCheck: luhnCheck,
    sendEmail: sendEmail,
    triggerRevalidationEccomerce: triggerRevalidationEccomerce, 
    triggerRevalidationDashboard: triggerRevalidationDashboard
}
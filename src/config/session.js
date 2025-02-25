const session = require('express-session');
require('dotenv').config({ path: 'variables.env' });

/*setting mongoDB to store sessions */
const MongoDBStore = require('connect-mongodb-session')(session);

const store = new MongoDBStore({
    uri: process.env.MONGODB, 
    collection: 'sessions' ,
    autoRemoveInterval: 10
    
});

store.on('error', function(error) {
    console.error('Error storing the sessions:', error);
});

/*setting the session-express middleware
On PRODUCTION, set secure to true and httpOnly attribute to true. Also update the domain*/

const sessionConfig = {
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        secure: false,
        domain: '.localhost',
        sameSite: 'lax'
    }
}

module.exports = sessionConfig;

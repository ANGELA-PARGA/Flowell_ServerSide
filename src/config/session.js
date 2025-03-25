const session = require('express-session');
require('dotenv').config({ path: 'variables.env' });

/* Setting MongoDB to store sessions */
const MongoDBStore = require('connect-mongodb-session')(session);

const store = new MongoDBStore({
    uri: process.env.MONGODB,
    collection: 'sessions',
    autoRemoveInterval: 10, // Removes expired sessions every 10 minutes
});

store.on('error', function (error) {
    console.error('🚨 Error storing the sessions:', error);
});

/* Determine environment */
const isProduction = process.env.NODE_ENV === 'production';

/* Setting the session-express middleware */
const sessionConfig = {
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store,
    cookie: {
        name: 'connect.sid',
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        secure: isProduction, // Use secure cookies in production (requires HTTPS)
        httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
        sameSite: isProduction ? 'strict' : 'lax', // Use 'strict' in production for cross requests
        domain: isProduction ? process.env.NEXT_PUBLIC_HOST : 'localhost', // Use your production domain
    },
};

module.exports = sessionConfig;

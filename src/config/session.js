const session = require('express-session');
require('dotenv').config({ path: 'variables.env' });

/* Setting MongoDB to store sessions */
const MongoDBStore = require('connect-mongodb-session')(session);
const mongoose = require('mongoose'); // Ensure we use connection pooling

// Use a single connection for efficiency
mongoose.connect(process.env.MONGODB, {
    maxPoolSize: 10, // Limit the number of concurrent connections
}).then(() => console.log("✅ Connected to MongoDB"))
.catch(err => console.error("🚨 MongoDB Connection Error:", err));

// MongoDB Session Store Configuration
const store = new MongoDBStore({
    uri: process.env.MONGODB,
    collection: 'sessions',
    autoRemove: 'interval',
    autoRemoveInterval: 60, // Clean up expired sessions every 30 minutes (was 10)
    touchAfter: 3600, // Update session in DB only every 30 minutes (1800 sec)
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
        domain: isProduction ? process.env.DOMAIN : 'localhost', // Use your production domain
    },
};

module.exports = sessionConfig;

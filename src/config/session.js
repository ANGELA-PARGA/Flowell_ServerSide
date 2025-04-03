const session = require('express-session');
require('dotenv').config({ path: 'variables.env' });

/* Setting MongoDB to store sessions */
const MongoDBStore = require('connect-mongodb-session')(session);
const mongoose = require('mongoose'); // Ensure connection pooling

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
    autoRemoveInterval: 720, 
    touchAfter: 3600, 
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

/*const {RedisStore} = require("connect-redis") 
const { createClient } = require('redis');
require('dotenv').config({ path: 'variables.env' });


const redisClient = createClient({
    url: process.env.REDIS_PUBLIC_URL, // Redis connection URL
});

redisClient.on('error', (err) => console.error('🚨 Redis Client Error:', err));
redisClient.on('connect', () => console.log('✅ Connected to Redis'));


(async () => {
    try {
        await redisClient.connect();
    } catch (err) {
        console.error('🚨 Failed to connect to Redis:', err);
    }
})();


const isProduction = process.env.NODE_ENV === 'production';


const sessionConfig = {
    store: new RedisStore({ client: redisClient, prefix: "flowell:" }), // Use RedisStore with the Redis client
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        name: 'connect.sid',
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        secure: isProduction, // Use secure cookies in production (requires HTTPS)
        httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
        sameSite: isProduction ? 'strict' : 'lax', // Use 'strict' in production for cross requests
        domain: isProduction ? process.env.DOMAIN : 'localhost', // Use your production domain
    },
};

module.exports = sessionConfig; */

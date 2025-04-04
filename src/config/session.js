const {RedisStore} = require("connect-redis") 
const { createClient } = require('redis');
require('dotenv').config({ path: 'variables.env' });

const isProduction = process.env.NODE_ENV === 'production'; 

const redisClient = createClient({
    url: isProduction ? process.env.REDIS_URL : process.env.REDIS_PUBLIC_URL 
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

module.exports = sessionConfig; 
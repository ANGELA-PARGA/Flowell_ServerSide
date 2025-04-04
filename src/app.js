"use strict";

require('dotenv').config({ path: 'variables.env' });
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bodyParser =  require('body-parser');
const sessionConfig = require('./config/session');
const passport = require('./config/passport');


const app = express();
// Security middleware
app.use(helmet());

app.use(morgan('dev'));
/*setting cors configuration */
const allowedOrigins = [
    process.env.NEXT_PUBLIC_HOST || "http://localhost:3000",
    process.env.NEXT_PUBLIC_DASHBOARD_HOST || "http://localhost:3001"
]

const corsOptions = {
    origin: allowedOrigins,
    credentials: true,
};
app.use(cors(corsOptions));

// Rate limiting
const apiLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 50, // Limit each IP to 50 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
});
app.use('/', apiLimiter);

const stripeWebhook = require('./config/stripe');
app.use(stripeWebhook);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/*setting session configuration */
app.set("trust proxy", 1);
app.use(session(sessionConfig));

/*setting passport local strategy*/
app.use(passport.initialize());
app.use(passport.session());


/*setting root path, login and sign up paths*/
app.get('/', (req, res) =>{
    res.send('This is the main page of Flowell')
});


/*setting client role routes */
const authRoutes = require('./Routes/ClientRoutes/authRoutes');
app.use('/auth', authRoutes);

const userRoutes = require('./Routes/ClientRoutes/userRoutes');
app.use('/profile', userRoutes);

const productRoutes = require('./Routes/ClientRoutes/productRoutes');
app.use('/products', productRoutes);

const orderRoutes = require('./Routes/ClientRoutes/orderRoutes');
app.use('/orders', orderRoutes);

const cartRoutes = require('./Routes/ClientRoutes/cartRoutes');
app.use('/cart', cartRoutes);


/*setting admin role routes */
const authAdminRoutes = require('./Routes/AdminRoutes/authAdminRoutes');
app.use('/admin/auth', authAdminRoutes);

const productAdminRoutes = require('./Routes/AdminRoutes/productsAdminRoutes');
app.use('/admin/products', productAdminRoutes);

const orderAdminRoutes = require('./Routes/AdminRoutes/ordersAdminRoutes');
app.use('/admin/orders', orderAdminRoutes);

const userAdminRoutes = require('./Routes/AdminRoutes/usersAdminRoutes');
app.use('/admin/users', userAdminRoutes);

const {errorHandler} = require('./middleware/appMiddlewares');
/*setting error handler middleware */
app.use(errorHandler);


// Export the notification function
module.exports = app;
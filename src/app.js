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
const corsOptions = {
    origin: process.env.NEXT_PUBLIC_HOST || "http://localhost:3000",
    credentials: true,
};
app.use(cors(corsOptions));

// Rate limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Limit each IP to 50 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
});
app.use('/api', apiLimiter);

const stripeWebhook = require('./config/stripe');
app.use(stripeWebhook);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/*setting session configuration */
app.use(session(sessionConfig));

/*setting passport local strategy*/
app.use(passport.initialize());
app.use(passport.session());


/*setting root path, login and sign up paths*/
app.get('/api', (req, res) =>{
    res.send('This is the main page of Flowell')
});


/*setting client role routes */
const authRoutes = require('./Routes/ClientRoutes/authRoutes');
app.use('/api/auth', authRoutes);

const userRoutes = require('./Routes/ClientRoutes/userRoutes');
app.use('/api/profile', userRoutes);

const productRoutes = require('./Routes/ClientRoutes/productRoutes');
app.use('/api/products', productRoutes);

const orderRoutes = require('./Routes/ClientRoutes/orderRoutes');
app.use('/api/orders', orderRoutes);

const cartRoutes = require('./Routes/ClientRoutes/cartRoutes');
app.use('/api/cart', cartRoutes);


/*setting admin role routes */
const authAdminRoutes = require('./Routes/AdminRoutes/authAdminRoutes');
app.use('/api/admin/auth', authAdminRoutes);

const productAdminRoutes = require('./Routes/AdminRoutes/productsAdminRoutes');
app.use('/api/admin/products', productAdminRoutes);

const orderAdminRoutes = require('./Routes/AdminRoutes/ordersAdminRoutes');
app.use('/api/admin/orders', orderAdminRoutes);

const userAdminRoutes = require('./Routes/AdminRoutes/usersAdminRoutes');
app.use('/api/admin/users', userAdminRoutes);

const {errorHandler} = require('./middleware/appMiddlewares');
/*setting error handler middleware */
app.use(errorHandler);


module.exports = app;
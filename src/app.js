"use strict";

import dotenv from 'dotenv';
dotenv.config({ path: 'variables.env' });

import express from 'express';
import session from 'express-session';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bodyParser from  'body-parser';
import sessionConfig from './config/session.js';
import passport from './config/passport.js';
import stripeWebhook from './config/stripe.js';

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


// configuring stripe webhook
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
import authRoutes from './Routes/ClientRoutes/authRoutes.js';
app.use('/auth', authRoutes);

import userRoutes from './Routes/ClientRoutes/userRoutes.js';
app.use('/profile', userRoutes);

import productRoutes from './Routes/ClientRoutes/productRoutes.js';
app.use('/products', productRoutes);

import orderRoutes from './Routes/ClientRoutes/orderRoutes.js';
app.use('/orders', orderRoutes);

import cartRoutes from './Routes/ClientRoutes/cartRoutes.js';
app.use('/cart', cartRoutes);


/*setting admin role routes */
import authAdminRoutes from './Routes/AdminRoutes/authAdminRoutes.js';
app.use('/admin/auth', authAdminRoutes);

import productAdminRoutes from './Routes/AdminRoutes/productsAdminRoutes.js';
app.use('/admin/products', productAdminRoutes);

import orderAdminRoutes from './Routes/AdminRoutes/ordersAdminRoutes.js';
app.use('/admin/orders', orderAdminRoutes);

import userAdminRoutes from './Routes/AdminRoutes/usersAdminRoutes.js';
app.use('/admin/users', userAdminRoutes);

import { errorHandler } from './middleware/appMiddlewares.js';
/*setting error handler middleware */
app.use(errorHandler);


// Export the notification function
export default app;
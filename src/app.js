"use strict";

require('dotenv').config({ path: 'variables.env' });
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser =  require('body-parser');
const sessionConfig = require('./config/session');
const passport = require('./config/passport');


const app = express();

app.use(morgan('dev'));
/*setting cors configuration */
const corsOptions = {
    origin: "http://localhost:3000",
    credentials: true,
};
app.use(cors(corsOptions));

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

const {errorHandler} = require('./middleware/appMiddlewares');
/*setting error handler middleware */
app.use(errorHandler);


module.exports = app;
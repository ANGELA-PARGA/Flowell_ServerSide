"use strict";

require('dotenv').config({ path: 'variables.env' });
const express = require('express');
const session = require('express-session');
const app = express();
const PORT = process.env.PORT || 8000;
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.WEBHOOK_ENDPOINT_SECRET;
const CartService = require('./src/ServicesLogic/CartService')


/*setting morgan */
const morgan = require('morgan');
app.use(morgan('dev'));

/*setting cors configuration */
const cors = require('cors');
const corsOptions = {
    origin: "http://localhost:3000",
    credentials: true,
};
app.use(cors(corsOptions));

/*setting the body parser package*/
const bodyParser =  require('body-parser');


app.post('/api/webhook', bodyParser.raw({type: 'application/json'}), async (req, res) => {
    
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error(`Webhook signature verification failed.`, err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the checkout.session.completed or async_payment_succeeded event
    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
        const session = event.data.object; 
        console.log('there is a session', session)       
        await CartService.checkoutCart(session.id);
        
    }
    if (event.type === 'checkout.session.expired' || event.type === 'checkout.session.async_payment_failed') {
        const session = event.data.object; 
        console.log('the checkout expired or the payment failed', session)         
    }

    res.status(200).end();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/*setting mongoDB to store sessions */
const MongoDBStore = require('connect-mongodb-session')(session);

const store = new MongoDBStore({
    uri: process.env.MONGODB, 
    collection: 'sessions' 
});

store.on('error', function(error) {
    console.error('Error storing the sessions:', error);
});

/*app.set('trust proxy', 1)*/
/*setting the session-express middleware
On PRODUCTION, set secure to true and httpOnly attribute to true. Also update the domain*/
app.use(
    session({
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
    })
);

/*setting passport local strategy*/
const passport = require('passport');
const LocalStrategy = require('passport-local');
const Authentication = require('./src/ServicesLogic/AuthService')

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy({
    usernameField: 'email'
}, async (email, password, done) => {
        try {
            const AuthenticationInstance = new Authentication();
            const authUser = await AuthenticationInstance.login(email, password);
            if(!Object.keys(authUser)?.length) return done(null, false);
            return done(null, authUser);
        } catch (error) {
            return done(error);
        }      
    }
));

passport.serializeUser((user, done) => {
    console.log('calling serialize user')
    done(null, user);
});

passport.deserializeUser(async (user, done) => {
    try {
        console.log('calling deserialize user')
        return done(null, user);        
    } catch (error) {
        return done(error);        
    }
});


/*setting root path, login and sign up paths*/
app.get('/api', (req, res) =>{
    res.send('This is the main page of Flowell')
});

const { signupValidators, loginValidators, handleValidationErrors, checkUserRole, checkAdminRole, errorHandler} = require('./src/Utilities/expressValidators')


app.post('/api/auth/login', loginValidators, handleValidationErrors, passport.authenticate('local'), checkUserRole, async (req, res, next) => {
    try {
        let loadCart = await CartService.getCartInfo(req.user.id)
        let cartId;

        if(!Object.keys(loadCart)?.length){
            console.log('there is NOT CART...creating one')
            const CartServiceInstance = new CartService();
            loadCart = await CartServiceInstance.createNewCart({user_id: req.user.id})
        }
        cartId = loadCart.id;
        const { id, first_name, last_name, email, role } = req.user;
        
        res.status(200).json({
            status: 'success',
            message: 'User successfully authenticated',
            code: 200,
            user: {
                id,
                first_name,
                last_name,
                email,
                role, 
                cart_id:cartId                   
            },
            sessionID: req.sessionID
        });

    } catch (err) {
        next(err);        
    }
});


app.post('/api/auth/signup', signupValidators, handleValidationErrors, async (req, res, next) => {
    try {
        const data = req.body;
        console.log('calling route for signup user', data)
        const AuthServiceInstance = new Authentication();
        const newUser = await AuthServiceInstance.register({...data, role:'client'});
        let loadCart = await CartService.getCartInfo(newUser.id);
        let cartId;

        if (!Object.keys(loadCart)?.length) {
            console.log('there is NOT CART...creating one')
            const CartServiceInstance = new CartService();
            loadCart = await CartServiceInstance.createNewCart({ user_id: newUser.id });
        }

        cartId = loadCart.id

        req.login(newUser, (err) => {
            if (err) {
                return next(err);
            }
            const { id, first_name, last_name, email, role } = req.user;
            res.status(200).json({
                status: 'success',
                message: 'User registered successfully',
                code: 200,
                user: {
                    id,
                    first_name,
                    last_name,
                    email,
                    role,
                    cart_id: cartId
                },
                sessionID: req.sessionID
            });
        });
    } catch(err) {
        next(err);
    }
});

app.post('/api/admin/auth/login', loginValidators, handleValidationErrors, passport.authenticate('local'), checkAdminRole, async (req, res, next) => {
    try {
        console.log('calling route for login admin')
        const { id, first_name, last_name, email, role } = req.user;
        
        res.status(200).json({
            status: 'success',
            message: 'Admin user successfully authenticated',
            code: 200,
            user: {
                id,
                first_name,
                last_name,
                email,
                role                    
            },
            sessionID: req.sessionID
        });

    } catch (err) {
        next(err);        
    }
});

app.post('/api/admin/auth/signup', signupValidators, handleValidationErrors, async (req, res, next) => {
    try {
        const data = req.body;
        console.log('calling route for signup ADMIN', data)
        const AuthServiceInstance = new Authentication();
        const newUser = await AuthServiceInstance.register({...data, role:'admin'});

        req.login(newUser, (err) => {
            if (err) {
                return next(err);
            }
            const { id, first_name, last_name, email, role } = req.user;
            res.status(200).json({
                status: 'success',
                message: 'Admin User registered successfully',
                code: 200,
                user: {
                    id,
                    first_name,
                    last_name,
                    email,
                    role
                },
                sessionID: req.sessionID
            });
        });
    } catch(err) {
        next(err);
    }
});


app.post('/api/auth/logout',  async (req, res, next) => {
    try { 
        console.log('calling logout in server')       
        req.logout((err) => {
            if (err) {
                return next(err);
        }})
        res.clearCookie('connect.sid');
        res.status(200).json({ message: 'Logged out successfully' });
                
    } catch(err) {
        next(err);
    }
});

/*app.post('/auth/refresh-session', (req, res) => {
    if (req.isAuthenticated()) {
        // Refresh session expiration
        req.session.touch();
        return res.status(200).json({ message: 'Session refreshed' });
    }
    res.status(401).json({ message: 'Unauthorized' });
});*/


/*setting user role routes */

const userRoutes = require('./src/Routes/userRoutes');
app.use('/api/profile', userRoutes);

const productRoutes = require('./src/Routes/productRoutes');
app.use('/api/products', productRoutes);

const orderRoutes = require('./src/Routes/orderRoutes');
app.use('/api/orders', orderRoutes);

const cartRoutes = require('./src/Routes/cartRoutes');
app.use('/api/cart', cartRoutes);


/*setting admin role routes */

app.use(errorHandler);


app.listen(PORT, () => {
    console.log(`Flowell app listening on port ${PORT}`)
});

module.exports = app;




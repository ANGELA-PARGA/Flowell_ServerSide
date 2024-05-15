"use strict";

require('dotenv').config({ path: 'variables.env' });
const express = require('express');
const session = require('express-session');
const app = express();
const PORT = process.env.PORT || 8000;

/*setting morgan */
const morgan = require('morgan');
app.use(morgan('dev'));

/*setting the body parser package*/
const bodyParser =  require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/*setting cors configuration */
const cors = require('cors');
const corsOptions = {
    origin: "http://localhost:3000",
    credentials: true,
};
app.use(cors(corsOptions));

/*setting mongoDB to store sessions */
const MongoDBStore = require('connect-mongodb-session')(session);

const store = new MongoDBStore({
    uri: 'mongodb://localhost:27017/flowell', 
    collection: 'sessions' 
});

store.on('error', function(error) {
    console.error('Error storing the sessions:', error);
});

/*app.set('trust proxy', 1)*/
/*setting the session-express middleware*/
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
    console.log('calling serialize user', user)
    done(null, user);
});

passport.deserializeUser(async (user, done) => {
    try {
        console.log('calling deserialize user', user)
        return done(null, user);        
    } catch (error) {
        return done(error);        
    }
});


/*setting root path, login and sign up paths*/
app.get('/api', (req, res) =>{
    res.send('This is the main page of Flowell')
});

const { signupValidators, loginValidators, handleValidationErrors, errorHandler } = require('./src/Utilities/expressValidators')
const CartService = require('./src/ServicesLogic/CartService')

app.post('/api/auth/login', loginValidators, handleValidationErrors, passport.authenticate('local'), async (req, res, next) => {
    try {
        const loadCart = await CartService.getCartInfo(req.user.id)
        if(!Object.keys(loadCart)?.length){
            const CartServiceInstance = new CartService();
            CartServiceInstance.createNewCart({user_id: req.user.id})
        }
        const { id, first_name, last_name, email } = req.user;
        const user = req.user
        
        req.login(user, (err) => {
            if (err) {
                return next(err);
            }
    
            res.status(200).json({
                status: 'success',
                message: 'User successfully authenticated',
                code: 200,
                user: {
                    id,
                    first_name,
                    last_name,
                    email,                    
                },
                sessionID: req.sessionID
            });
        });
    } catch (err) {
        next(err);        
    }
});


app.post('/api/auth/signup', signupValidators, handleValidationErrors, async (req, res, next) => {
    try {
        const data = req.body;
        const AuthServiceInstance = new Authentication();
        const newUser = await AuthServiceInstance.register(data);
        const cart = await CartService.getCartInfo(newUser.id);

        if (!Object.keys(cart)?.length) {
            const CartServiceInstance = new CartService();
            CartServiceInstance.createNewCart({ user_id: newUser.id });
        }

        req.login(newUser, (err) => {
            if (err) {
                return next(err);
            }
            const { id, first_name, last_name, email } = req.user;
            res.status(200).json({
                status: 'success',
                message: 'User registered successfully',
                code: 200,
                user: {
                    id,
                    first_name,
                    last_name,
                    email
                },
                sessionID: req.sessionID
            });
        });
    } catch(err) {
        next(err);
    }
});

app.post('/api/auth/logout',  async (req, res, next) => {
    console.log('calling logout in server', req.session)
    console.log('with:', req.headers)
    try {      
        console.log('enter try block with req object:', req.headers)  
        req.logout((err) => {
            if (err) {
                console.log('log out server error:', err)
                return next(err);
        }})
        console.log('THE USER deleted and the session', req.user, req.session, req.sessionID)
        res.clearCookie('connect.sid');
        console.log('the session after deleted cookie', req.session)
        res.status(200).json({ message: 'Logged out successfully' });
                
    } catch(err) {
        next(err);
    }
});

/*setting additional routes */
const userRoutes = require('./src/Routes/userRoutes');
app.use('/api/profile', userRoutes);

const productRoutes = require('./src/Routes/productRoutes');
app.use('/api/products', productRoutes);

const orderRoutes = require('./src/Routes/orderRoutes');
app.use('/api/orders', orderRoutes);

const cartRoutes = require('./src/Routes/cartRoutes');
app.use('/api/cart', cartRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Flowell app listening on port ${PORT}`)
});

module.exports = app;




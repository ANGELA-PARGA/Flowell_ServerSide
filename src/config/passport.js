const passport = require('passport');
const LocalStrategy = require('passport-local');
const Authentication = require('../services/client/AuthService')


passport.use(new LocalStrategy({
    usernameField: 'email'
}, async (email, password, done) => {
        try {
            const authUser = await Authentication.login(email, password);
            if(!Object.keys(authUser)?.length) return done(null, false);
            return done(null, authUser);
        } catch (error) {
            return done(error);
        }      
    }
));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser(async (user, done) => {
    try {
        return done(null, user);        
    } catch (error) {
        return done(error);        
    }
});

module.exports = passport;
const passport = require('passport');
const LocalStrategy = require('passport-local');
const Authentication = require('../ServicesLogic/ServiceClientLogic/AuthService')


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

module.exports = passport;
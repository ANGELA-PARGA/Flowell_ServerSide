import passport from 'passport';
import LocalStrategy from 'passport-local';
import { authenticationService } from './container.js';


passport.use(new LocalStrategy({
    usernameField: 'email'
}, async (email, password, done) => {
        try {
            console.log('🚨 passport local strategy')
            const authUser = await authenticationService.login(email, password);
            if(!Object.keys(authUser)?.length) return done(null, false);
            return done(null, authUser);
        } catch (error) {
            console.log('🚨 passport local error:', error)
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

export default passport;
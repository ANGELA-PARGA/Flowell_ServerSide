import { authenticationService } from '../../config/container.js';

class AuthAdminController {
    /**
     * Handle admin login after passport authentication
     */
    async login(req, res, next) {
        try {
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
    }

    /**
     * Handle admin user registration
     */
    async signup(req, res, next) {
        try {
            const data = req.body;
            const newUser = await authenticationService.register({ ...data, role: 'admin' });

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
        } catch (err) {
            next(err);
        }
    }

    /**
     * Handle admin logout
     */
    async logout(req, res, next) {
        try {
            if (!req.session) {
                console.log("🚨 No session found");
                return res.status(400).json({ message: "No active session." });
            }

            req.logout((err) => {
                if (err) {
                    console.error("❌ Error in req.logout:", err);
                    return next(err);
                }
                
                // Destroy the session in Redis
                req.session.destroy((destroyErr) => {
                    if (destroyErr) {
                        console.error("❌ Error destroying session:", destroyErr);
                        return next(destroyErr);
                    }
                    
                    console.log("✅ Session destroyed successfully");
                    res.clearCookie('connect.sid', {
                        path: '/',
                        domain: process.env.NODE_ENV === 'production' ? process.env.DOMAIN : 'localhost',
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
                    });
                    
                    res.status(200).json({ message: 'Logged out successfully' });
                });
            });

        } catch (err) {
            console.error("❌ Unexpected error in logout:", err);
            next(err);
        }
    }
}

export default new AuthAdminController();
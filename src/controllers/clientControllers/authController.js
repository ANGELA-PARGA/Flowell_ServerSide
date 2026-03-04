import jwt from 'jsonwebtoken';
import { sendEmail } from '../../Utilities/utilities.js';
import { cartService, userService, authenticationService } from '../../config/container.js';

class AuthController {
    /**
     * Handle client login after passport authentication
     */
    async login(req, res, next) {
        try {
            let loadCart = await cartService.getCartInfo(req.user.id);
            let cartId;

            if (!Object.keys(loadCart)?.length) {
                loadCart = await cartService.createNewCart({ user_id: req.user.id });
            }
            cartId = loadCart.id;
            const { id, first_name, last_name, email, role } = req.user;
            
            res.status(200).json({
                status: 'success',
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

        } catch (err) {
            next(err);        
        }
    }

    /**
     * Handle client user registration
     */
    async signup(req, res, next) {
        try {
            const data = req.body;
            const newUser = await authenticationService.register({ ...data, role: 'client' });
            let loadCart = await cartService.getCartInfo(newUser.id);
            let cartId;

            if (!Object.keys(loadCart)?.length) {
                loadCart = await cartService.createNewCart({ user_id: newUser.id });
            }

            cartId = loadCart.id;

            req.login(newUser, (err) => {
                if (err) {
                    return next(err);
                }
                const { id, first_name, last_name, email, role } = req.user;
                res.status(200).json({
                    status: 'success',
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
        } catch (err) {
            next(err);
        }
    }

    /**
     * Handle user logout
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
                    // Clear the cookie from the browser
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

    /**
     * Handle password recovery email request
     */
    async requestPasswordRecovery(req, res, next) {
        try {
            const email = req.body.email;
            const SECRET = process.env.JWT_SECRET;
            const userFound = await userService.findUserByEmail(email);
            
            if (!userFound?.length) {
                return res.status(200).json({ message: "If the email exists, a reset link has been sent." });
            }

            // Generate JWT token with expiration (10 minutes)
            const token = jwt.sign({ userId: userFound[0].id }, SECRET, { expiresIn: "600000" });
            // Create reset link
            const resetUrl = `${process.env.NEXT_PUBLIC_HOST}/recover_process_pd?status=${token}`;

            // Send reset email
            await sendEmail(email, "Password Reset", `Click here to reset your password: ${resetUrl}`);

            res.status(200).json({ message: "If the email exists, a reset link has been sent." });

        } catch (err) {
            next(err);
        }        
    }

    /**
     * Handle password reset with token
     */
    async resetPassword(req, res, next) {
        try {
            const { status, password } = req.body;
            const SECRET = process.env.JWT_SECRET;
            
            // Verify token and extract userId
            const decoded = jwt.verify(status, SECRET);
            const userId = decoded.userId;

            await userService.updateUserPassword({ id: userId, password });

            res.status(200).json({ message: "Password reset successful. You can now log in." });

        } catch (err) {
            next(err);
        }        
    }
}

export default new AuthController();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userService = require('./userService');
const { validatePassword, validateEmail } = require('../utils/validators');

class LoginService {
    async handleLogin({ email, password }) {
        // Validate input
        if (!email || !password) {
            return { success: false, status: 400, message: 'Please provide both email and password' };
        }
        if (!validateEmail(email)) {
            return { success: false, status: 400, message: 'Invalid email format.' };
        }
        if (!validatePassword(password)) {
            return { success: false, status: 400, message: 'Password must be at least six characters long.' };
        }

        // Check if user exists and validate password
        const user = await userService.getUserByEmail(email);
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return { success: false, status: 401, message: 'Invalid email or password' };
        }

        // Generate JWT token
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
        });

        // Set cookie options
        const cookieOptions = {
            expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
            httpOnly: true,
        };

        // Check if the user has a profile
        const profile = await userService.getUserProfile(user.id);

        return {
            success: true,
            token,
            cookieOptions,
            hasProfile: profile.length > 0,
        };
    }
}

module.exports = new LoginService();

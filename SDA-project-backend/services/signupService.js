const bcrypt = require('bcryptjs');
const userService = require('./userService');
const { validatePassword, validateEmail } = require('../utils/validators');

class SignupService {
    async handleSignup({ username, email, password, confirm_password }) {
        // Validate inputs
        if (!username || !email || !password || !confirm_password) {
            return { success: false, message: 'All fields are required.' };
        }

        if (!validatePassword(password)) {
            return { success: false, message: 'Password must be at least six characters long.' };
        }

        if (!validateEmail(email)) {
            return { success: false, message: 'Invalid email format.' };
        }

        if (password !== confirm_password) {
            return { success: false, message: 'Passwords do not match.' };
        }

        // Check for existing user
        const existingUsers = await userService.checkUserExists(email, username);
        if (existingUsers.length > 0) {
            const existingUser = existingUsers[0];
            if (existingUser.email === email) {
                return { success: false, message: 'Email is already registered.' };
            }
            if (existingUser.name === username) {
                return { success: false, message: 'Username is already taken.' };
            }
        }

        // Create user
        const hashedPassword = await bcrypt.hash(password, 8);
        await userService.createUser(username, email, hashedPassword);

        return { success: true, message: 'Signup successful!' };
    }
}

module.exports = new SignupService();

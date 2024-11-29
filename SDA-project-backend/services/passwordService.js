const bcrypt = require('bcryptjs');
const userService = require('./userService');
const { validatePassword, validateEmail } = require('../utils/validators');

class PasswordService {
    async handleForgetPassword({ name, email, password }) {
        // Validate input
        if (!name || !email || !password) {
            return { success: false, status: 400, message: 'Username, email, and password are required.' };
        }
        if (!validateEmail(email)) {
            return { success: false, status: 400, message: 'Please enter a valid email address.' };
        }
        if (!validatePassword(password)) {
            return { success: false, status: 400, message: 'Password must be at least 6 characters long.' };
        }

        // Check if user exists
        const user = await userService.getUserByNameAndEmail(name, email);
        if (user.length === 0) {
            return { success: false, status: 404, message: 'No user found with that username and email combination.' };
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 8);

        // Update password in database
        await userService.updatePasswordByName(name, hashedPassword);

        return { success: true };
    }
}

module.exports = new PasswordService();

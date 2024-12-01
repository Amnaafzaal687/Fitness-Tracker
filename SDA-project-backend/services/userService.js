const { queryDatabase } = require('../db');
const bcrypt = require('bcryptjs');

class UserService {
    // Check if user exists by email or username 
    async checkUserExists(email, username) {
        const query = 'SELECT * FROM users WHERE email = ? OR name = ?';
        return await queryDatabase(query, [email, username]);
    }

    // Create a new user 
    async createUser(username, email, hashedPassword) {
        const query = 'INSERT INTO users SET ?';
        return await queryDatabase(query, { name: username, email: email, password: hashedPassword });
    }

    // Fetch user by email for login
    async getUserByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = ?';
        const results = await queryDatabase(query, [email]);
        return results.length > 0 ? results[0] : null; // Return user or null if not found
    }

    // Fetch user profile by user ID
    async getUserProfile(userId) {
        const query = 'SELECT * FROM profiles WHERE user_id = ?';
        return await queryDatabase(query, [userId]);
    }

    async getUserByNameAndEmail(name, email) {
        const query = 'SELECT * FROM users WHERE name = ? AND email = ?';
        return await queryDatabase(query, [name, email]);
    }
    //update password
    async updatePasswordByName(name, hashedPassword) {
        const query = 'UPDATE users SET password = ? WHERE name = ?';
        return await queryDatabase(query, [hashedPassword, name]);
    }
}

module.exports = new UserService();

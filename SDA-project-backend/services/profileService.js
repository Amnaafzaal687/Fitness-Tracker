const { queryDatabase } = require('../db'); // Import queryDatabase directly

class ProfileService {
    // Check if a profile exists for a user
    async checkProfileExists(userId) {
        const query = 'SELECT * FROM profiles WHERE user_id = ?';
        return await queryDatabase(query, [userId]);
    }

    // Create a new profile for a user
    async createProfile(userId, profileData) {
        const query = 'INSERT INTO profiles SET ?';
        return await queryDatabase(query, { user_id: userId, ...profileData });
    }

    // Update an existing profile for a user
    async updateProfile(userId, { gender, age, height, weight }) {
        if (!gender || !age || !height || !weight) {
            throw new Error('All fields are required.');
        }

        const query = `
            UPDATE profiles 
            SET gender = ?, age = ?, height = ?, weight = ?
            WHERE user_id = ?
        `;
        const params = [gender, age, height, weight, userId];

        try {
            // Use queryDatabase to execute the update query
            const results = await queryDatabase(query, params);
            return results;
        } catch (error) {
            throw new Error('Database update error: ' + error.message);
        }
    }
}

module.exports = new ProfileService();

const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { queryDatabase } = require('../db');
const db = require('../db');

class ProfileService {
    async checkProfileExists(userId) {
        const query = 'SELECT * FROM profiles WHERE user_id = ?';
        return await queryDatabase(query, [userId]);
    }

    async createProfile(userId, profileData) {
        const query = 'INSERT INTO profiles SET ?';
        return await queryDatabase(query, { user_id: userId, ...profileData });
    }

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
            const results = await db.queryDatabase(query, params);
            return results;
        } catch (error) {
            throw new Error('Database update error: ' + error.message);
        }
    }
}

module.exports = new ProfileService();

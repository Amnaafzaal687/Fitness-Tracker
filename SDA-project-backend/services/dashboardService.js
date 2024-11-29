const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { queryDatabase } = require('../db');

class DashboardService {
    async getUserProfile(userId) {
        const query = `
            SELECT users.name, users.email, profiles.gender, profiles.age, profiles.height, profiles.weight
            FROM profiles
            JOIN users ON profiles.user_id = users.id
            WHERE profiles.user_id = ?;
        `;
        return await queryDatabase(query, [userId]);
    }

    async getAchievedGoals(userId) {
        const query = `
            SELECT fitness_goals.activity, fitness_goals.steps_goals, fitness_goals.calories_goals, fitness_goals.water_goals, id
            FROM fitness_goals
            WHERE fitness_goals.user_id = ? AND fitness_goals.achieved = '1';
        `;
        return await queryDatabase(query, [userId]);
    }
}

module.exports = new DashboardService();

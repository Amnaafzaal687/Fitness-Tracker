const db = require('../db');

class FitnessGoalsService {
    // Check if the user has active goals in the last 7 days
    async hasActiveGoal(userId) {
        const query = `
            SELECT COUNT(*) AS activeGoals
            FROM fitness_goals
            WHERE user_id = ? AND achieved = 0 AND created_at >= CURDATE() - INTERVAL 7 DAY;
        `;
        const results = await db.queryDatabase(query, [userId]);
        return results[0].activeGoals > 0;
    }

    // Insert a new fitness goal
    async saveFitnessGoal(userId, { activity, steps_goals, calories_goals, water_goals }) {
        const query = `
            INSERT INTO fitness_goals (user_id, activity, steps_goals, calories_goals, water_goals, achieved, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, 0, NOW(), NOW());
        `;
        const result = await db.queryDatabase(query, [userId, activity, steps_goals, calories_goals, water_goals]);
        return result.insertId; // Return the ID of the new goal
    }

    // Fetch a fitness goal by ID
    async fetchGoalById(goalId) {
        const query = `SELECT * FROM fitness_goals WHERE id = ?`;
        const results = await db.queryDatabase(query, [goalId]);
        return results[0]; // Return the goal object
    }

    // Fetch the latest goal for a user
    async fetchLatestGoal(userId) {
        const query = `
            SELECT id, activity, steps_goals, calories_goals, water_goals, achieved, created_at
            FROM fitness_goals
            WHERE user_id = ?
            ORDER BY id DESC
            LIMIT 1;
        `;
        const results = await db.queryDatabase(query, [userId]);
        return results[0]; // Return the latest goal
    }

    // Mark a goal as expired
    async expireGoal(goalId) {
        const query = `UPDATE fitness_goals SET achieved = -1 WHERE id = ?`;
        await db.queryDatabase(query, [goalId]);
    }
}

module.exports = new FitnessGoalsService();
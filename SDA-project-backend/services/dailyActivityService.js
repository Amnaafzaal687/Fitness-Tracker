const db = require('../db');

class DailyActivityService {
    // Log a new daily activity
    async logActivity(userId, { caloriesBurn, waterIntake, steps }) {
        const query = `
            INSERT INTO daily_activities (user_id, calories_burn, water_intake, steps, created_at)
            VALUES (?, ?, ?, ?, CURDATE());
        `;
        await db.queryDatabase(query, [userId, caloriesBurn, waterIntake, steps]);
    }

    // Fetch cumulative activity data for the current day
    async getCumulativeActivity(userId) {
        const query = `
            SELECT SUM(calories_burn) AS total_calories, 
                   SUM(water_intake) AS total_water, 
                   SUM(steps) AS total_steps
            FROM daily_activities
            WHERE user_id = ? AND DATE(created_at) = CURDATE();
        `;
        const results = await db.queryDatabase(query, [userId]);
        return results[0] || {};
    }

    // Fetch the latest active fitness goal
    async getActiveGoal(userId) {
        const query = `
            SELECT id, steps_goals, calories_goals, water_goals, achieved, created_at
            FROM fitness_goals
            WHERE user_id = ? AND achieved = 0
            ORDER BY id DESC
            LIMIT 1;
        `;
        const results = await db.queryDatabase(query, [userId]);
        return results[0]; // Returns the active goal or undefined if none exists
    }

    // Fetch cumulative activity data for a fitness goal period
    async getGoalActivityData(userId, goalStartDate, goalEndDate) {
        const query = `
            SELECT SUM(steps) AS total_steps, 
                   SUM(calories_burn) AS total_calories, 
                   SUM(water_intake) AS total_water
            FROM daily_activities
            WHERE user_id = ? AND DATE(created_at) BETWEEN DATE(?) AND DATE(?);
        `;
        const results = await db.queryDatabase(query, [userId, goalStartDate, goalEndDate]);
        return results[0] || {};
    }

    // Mark a fitness goal as achieved
    async markGoalAchieved(goalId) {
        const query = `
            UPDATE fitness_goals
            SET achieved = 1, achieved_at = NOW()
            WHERE id = ?;
        `;
        await db.queryDatabase(query, [goalId]);
    }
}

module.exports = new DailyActivityService();

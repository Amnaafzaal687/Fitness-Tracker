const db = require('../db');

class ProgressService {
    // Fetch active fitness goals
    async getActiveFitnessGoal(userId) {
        const query = `
            SELECT id, activity, steps_goals, calories_goals, water_goals, achieved, created_at
            FROM fitness_goals
            WHERE user_id = ? AND achieved = 0 AND created_at >= CURDATE() - INTERVAL 7 DAY
            LIMIT 1;
        `;
        const results = await db.queryDatabase(query, [userId]);
        return results[0]; // Return the active goal or undefined if none exists
    }

    // Fetch daily activity within a goal period
    async getDailyActivity(userId) {
        // Debugging the inner query to check the goal's start date
        const goalStartQuery = `
            SELECT DATE(created_at) AS goal_start_date
            FROM fitness_goals
            WHERE user_id = ? AND achieved = 0
            ORDER BY created_at DESC
            LIMIT 1;
        `;
        
        // Log to ensure we get a correct goal start date
        const goalStartResult = await db.queryDatabase(goalStartQuery, [userId]);
    
        if (!goalStartResult || goalStartResult.length === 0) {
            console.error('No active goal found for user:', userId);
            return { total_steps: 0, total_calories: 0, total_water: 0 };  // or handle this case differently
        }

        const goalStartDate = goalStartResult[0].goal_start_date;  // Only declare here once

        // Now modify the main query to use the valid goalStartDate
        const query = `
            SELECT 
                SUM(steps) AS total_steps, 
                SUM(calories_burn) AS total_calories, 
                SUM(water_intake) AS total_water
            FROM daily_activities
            WHERE user_id = ? 
            AND DATE(created_at) BETWEEN ? AND CURDATE();
        `;
        
        const results = await db.queryDatabase(query, [userId, goalStartDate]);
        return results[0] || { total_steps: 0, total_calories: 0, total_water: 0 };
    }
}

module.exports = new ProgressService();

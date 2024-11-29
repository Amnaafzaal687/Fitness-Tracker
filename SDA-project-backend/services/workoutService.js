const db = require('../db');

class WorkoutService {
    // Log a workout session
    async logWorkoutSession(userId, { workoutName, duration, sets, date }) {
        const query = `
            INSERT INTO workout_sessions (user_id, workoutname, duration, sets, date) 
            VALUES (?, ?, ?, ?, ?);
        `;
        await db.queryDatabase(query, [userId, workoutName, duration, sets, date]);
    }

    // Fetch workout history
    async getWorkoutHistory(userId) {
        const query = `
            SELECT workoutname, duration, sets, date 
            FROM workout_sessions 
            WHERE user_id = ? 
            ORDER BY date DESC;
        `;
        return await db.queryDatabase(query, [userId]);
    }
}

module.exports = new WorkoutService();

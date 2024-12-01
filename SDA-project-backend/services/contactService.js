const db = require('../db');

// Contact Service
class ContactService {
    async saveContactQuery({ name, email, message }) {
        if (!name || !email || !message) {
            throw new Error('All fields are required.');
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Invalid email format.');
        }

        const query = `
            INSERT INTO contact_queries (name, email, message) 
            VALUES (?, ?, ?)
        `;
        const params = [name, email, message];

        try {
            const results = await db.queryDatabase(query, params);
            return results;
        } catch (error) {
            throw new Error('Database insert error: ' + error.message);
        }
    }
}

module.exports = new ContactService();

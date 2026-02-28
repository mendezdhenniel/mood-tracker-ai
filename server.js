import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './db.js'; 
import { getAIResponse } from './services/aiService.js';

dotenv.config();
const app = express();
app.use(cors()); 
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Health Check
app.get('/', (req, res) => {
    res.send('✅ Mood Tracker API is live and running!');
});

// TEST ROUTE: This confirms if the AI can talk to the DB
app.get('/test-db', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT 1 + 1 AS result');
        res.json({ status: "Success", message: "Database is connected!", data: rows });
    } catch (error) {
        res.status(500).json({ status: "Error", details: error.message });
    }
});

app.post('/api/moods', async (req, res) => {
    try {
        const { full_name, mood_text } = req.body;
        
        // 1. Save User
        const [userResult] = await db.query(
            'INSERT INTO USERS (full_name) VALUES (?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)', 
            [full_name]
        );
        const userId = userResult.insertId || userResult.id;

        // 2. Call AI Service
        const ai_message = await getAIResponse(mood_text);

        // 3. Save Mood
        const [moodResult] = await db.query(
            'INSERT INTO MOOD_ENTRIES (user_id, mood) VALUES (?, ?)',
            [userId, mood_text]
        );
        const moodEntryId = moodResult.insertId;

        // 4. Save AI Response
        await db.query(
            'INSERT INTO AI_RESPONSES (entry_id, ai_message) VALUES (?, ?)',
            [moodEntryId, ai_message]
        );

        res.json({ ai_message });
    } catch (error) {
        console.error("SERVER ERROR:", error);
        res.status(500).json({ ai_message: "Server Error: Check your database connection." });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${PORT}`);
});
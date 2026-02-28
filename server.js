import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './db.js'; 
import { getAIResponse } from './services/aiService.js';

dotenv.config();

const app = express();
app.use(cors()); 
app.use(express.json());

// 1. Dynamic Port: Render will inject 10000 into process.env.PORT
const PORT = process.env.PORT || 3000;

// 2. Root Route: This fixes the "Cannot GET /" error in your screenshot
app.get('/', (req, res) => {
    res.send('✅ Mood Tracker API is live and running!');
});

// 3. POST: Process Mood (3-table schema)
app.post('/api/moods', async (req, res) => {
    try {
        const { full_name, mood_text } = req.body;
        
        // Step A: Insert/Find User and get ID
        const [userResult] = await db.query(
            'INSERT INTO USERS (full_name) VALUES (?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)', 
            [full_name]
        );
        const userId = userResult.insertId || userResult.id;

        // Step B: Get AI Response
        const ai_message = await getAIResponse(mood_text);

        // Step C: Save Mood Entry
        const [moodResult] = await db.query(
            'INSERT INTO MOOD_ENTRIES (user_id, mood) VALUES (?, ?)',
            [userId, mood_text]
        );
        const moodEntryId = moodResult.insertId;

        // Step D: Save AI Response
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
    console.log(`✅ Server is successfully running on port ${PORT}`);
});
import express from 'express';
import cors from 'cors';
import { db } from './db.js'; 
import { getAIResponse } from './services/aiService.js';

const app = express();
app.use(cors()); 
app.use(express.json());

// GET: Fetch History (Extra Credit)
app.get('/api/moods', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM moods ORDER BY created_at DESC LIMIT 10');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: "Database error" });
    }
});

// POST: Process Mood
app.post('/api/moods', async (req, res) => {
    try {
        const { full_name, mood_text } = req.body;
        
        // This calls the "Brain" service we fixed above
        const ai_message = await getAIResponse(mood_text);

        await db.query(
            'INSERT INTO moods (full_name, mood_text, ai_message) VALUES (?, ?, ?)',
            [full_name, mood_text, ai_message]
        );

        res.json({ ai_message });
    } catch (error) {
        console.error("SERVER ERROR:", error);
        res.status(500).json({ ai_message: "Server Error: Check your backend console." });
    }
});

app.listen(3000, () => console.log("✅ Backend running on port 3000"));
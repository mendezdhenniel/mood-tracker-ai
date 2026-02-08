import express from "express";
import { db } from "../db.js";
import { getAIResponse } from "../services/aiService.js";

const router = express.Router();

// --- POST: Create Mood (With Extra Credit: Input Validation) ---
router.post("/", async (req, res) => {
  const { user_id, mood_text } = req.body;

  // EXTRA CREDIT: Reject if mood_text is missing or just spaces
  if (!mood_text || mood_text.trim() === "") {
    return res.status(400).json({ error: "Mood text cannot be empty!" });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO mood_entries (user_id, mood_text) VALUES (?, ?)",
      [user_id, mood_text]
    );

    const aiMessage = await getAIResponse(mood_text);

    await db.query(
      "INSERT INTO ai_responses (mood_entry_id, ai_message) VALUES (?, ?)",
      [result.insertId, aiMessage]
    );

    res.json({ message: "Mood saved", aiMessage });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// --- GET: Read All Moods ---
router.get("/", async (req, res) => {
  const [rows] = await db.query(`
    SELECT u.full_name, m.id, m.mood_text, a.ai_message
    FROM users u
    JOIN mood_entries m ON u.id = m.user_id
    JOIN ai_responses a ON m.id = a.mood_entry_id
  `);
  res.json(rows);
});

// --- EXTRA CREDIT: DELETE Route ---
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // We delete from ai_responses first due to Foreign Key constraints
    await db.query("DELETE FROM ai_responses WHERE mood_entry_id = ?", [id]);
    await db.query("DELETE FROM mood_entries WHERE id = ?", [id]);
    
    res.json({ message: `Entry ID ${id} successfully deleted from XAMPP.` });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

export default router;
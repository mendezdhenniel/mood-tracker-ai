<template>
  <div class="mood-container">
    <h2>Mood Check-in</h2>
    
    <div v-if="errorMessage" class="error-banner">
      ⚠️ {{ errorMessage }}
    </div>

    <input v-model="name" placeholder="Your name" class="input-field" />
    <textarea v-model="mood" placeholder="How are you feeling? (Any language)" class="text-area"></textarea>
    
    <button @click="submitMood" :disabled="loading" class="submit-btn">
      <span v-if="loading" class="spinner"></span>
      {{ loading ? ' Consulting AI...' : 'Submit Mood' }}
    </button>
    
    <div v-if="aiMessage" class="ai-response">
      <strong>AI Advisor:</strong> {{ aiMessage }}
    </div>

    <hr v-if="history.length > 0" />

    <div v-if="history.length > 0" class="history-section">
      <h3>Recent History</h3>
      <ul>
        <li v-for="item in history" :key="item.id" class="history-item">
          <strong>{{ item.full_name }}:</strong> {{ item.mood_text }}
          <p class="history-ai">✨ {{ item.ai_message }}</p>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import api from '../services/api';

export default {
  data() {
    return { 
      name: '', 
      mood: '', 
      aiMessage: '',
      errorMessage: '', 
      loading: false, 
      history: [] 
    };
  },
  mounted() {
    this.fetchHistory(); 
  },
  methods: {
    async fetchHistory() {
      try {
        // Calls the GET route in server.js
        const res = await api.get('/api/moods');
        this.history = res.data;
      } catch (err) {
        console.error("History fetch failed");
      }
    },
    async submitMood() {
      if (!this.name || !this.mood) {
        this.errorMessage = "Please enter both your name and mood.";
        return;
      }
      
      this.loading = true;
      this.errorMessage = '';
      this.aiMessage = '';

      try {
        const res = await api.post('/api/moods', {
          full_name: this.name,
          mood_text: this.mood
        });
        
        // If the backend returns { ai_message: "..." }
        this.aiMessage = res.data.ai_message;
        
        // Refresh history to show the new entry immediately
        await this.fetchHistory(); 
        this.mood = ''; 
      } catch (error) {
        // Specific error message for the Error UI Extra Credit
        this.errorMessage = "Could not connect to the AI. Is the server running?";
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.mood-container { max-width: 450px; margin: 20px auto; display: flex; flex-direction: column; gap: 15px; font-family: sans-serif; }
.input-field, .text-area { padding: 12px; border: 1px solid #ddd; border-radius: 8px; }
.submit-btn { background: #42b983; color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: bold; display: flex; align-items: center; justify-content: center; }
.submit-btn:disabled { background: #a8d5c2; cursor: not-allowed; }

.error-banner { background: #ffebee; color: #c62828; padding: 10px; border-radius: 8px; border: 1px solid #ef9a9a; }

.spinner { border: 3px solid rgba(255,255,255,.3); border-radius: 50%; border-top: 3px solid #fff; width: 16px; height: 16px; animation: spin 1s linear infinite; margin-right: 10px; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

.ai-response { background: #f0fdf4; padding: 15px; border-left: 5px solid #42b983; border-radius: 4px; }
.history-item { list-style: none; background: #fff; border: 1px solid #eee; padding: 10px; margin-bottom: 10px; border-radius: 8px; }
.history-ai { font-style: italic; color: #666; font-size: 0.9em; margin-top: 5px; }
</style>
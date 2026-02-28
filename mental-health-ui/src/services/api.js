import axios from 'axios';

// Direct connection to your live Render Backend
const API_URL = 'https://mood-tracker-ai-4u98.onrender.com';

export default axios.create({
  baseURL: API_URL
});
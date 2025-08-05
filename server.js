// A simple backend server using Node.js and the Express framework

// 1. Import necessary libraries
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // Make sure to install this
require('dotenv').config(); // To load the secret key from a .env file

// 2. Initialize the app
const app = express();
app.use(cors()); // Allow your Chrome extension to talk to this server
app.use(express.json()); // Allow the server to read JSON data

const PORT = 3000; // The port your server will run on

// --- NEW: Health Check Route ---
// This will show a message when you visit http://localhost:3000
app.get('/', (req, res) => {
  res.send("Lexi's secure server is running. It's ready to receive requests from the extension.");
});

// 3. The single API endpoint
app.post('/api/getHint', async (req, res) => {
  try {
    // Get the conversation history and system prompt from the frontend
    const { history, systemPrompt } = req.body;

    // Get your secret key from the secure .env file
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'API key not found on server.' });
    }

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    const apiRequestBody = {
      contents: history,
      systemInstruction: { parts: [{ text: systemPrompt }] }
    };

    // Forward the request to the real Google AI API
    const googleResponse = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(apiRequestBody),
    });

    if (!googleResponse.ok) {
      const errorBody = await googleResponse.text();
      throw new Error(`Google API Error: ${googleResponse.status} - ${errorBody}`);
    }

    const data = await googleResponse.json();
    const hint = data.candidates[0].content.parts[0].text;

    // Send the AI's response back to the frontend
    res.json({ hint: hint });

  } catch (error) {
    console.error("Error in /api/getHint:", error);
    res.status(500).json({ error: 'Failed to fetch hint from Google AI.' });
  }
});

// 4. Start the server
app.listen(PORT, () => {
  console.log(`Lexi's secure server is running on http://localhost:${PORT}`);
});

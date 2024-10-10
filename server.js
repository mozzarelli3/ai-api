import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());  // To parse JSON bodies

// Test to make sure API is running
app.get('/', (req, res) => {
  res.send('API is running!');
});

// Route to handle text summarization
app.post('/summarise', async (req, res) => {
  const { text } = req.body;  // Get text from request body

  if (!text) {
    return res.status(400).json({ error: 'Text is required for summarisation.' });
  }

  try {
    // Call Azure OpenAI API using fetch
    const response = await fetch(`${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/gpt-35-turbo/chat/completions?api-version=2023-03-15-preview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.AZURE_OPENAI_API_KEY
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'You are an assistant that summarizes text to fit a character limit. If the text contains emoji or other Unicode characters, the limit is 70 characters. Otherwise, it is 160 characters.' },
          { role: 'user', content: `Summarise the following text: ${text}` }
        ],
        max_tokens: 100,
        temperature: 0.7
      })
    });

    // Parse the response as JSON
    const data = await response.json();

    // Check if the API returned a summary
    if (data.choices && data.choices.length > 0 && data.choices[0].message) {
      const summary = data.choices[0].message.content.trim();
      // Send the summarized text back to the client
      res.json({ summary });
    } else {
      // Handle the case where the summary is not available in the response
      res.status(500).json({ error: 'No summary available in the API response.' });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to summarise the text' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
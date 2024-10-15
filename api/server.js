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

  // Set default charLimit to 160 if not provided or invalid
  const limit = (charLimit === 320) ? 320 : 160;


  try {
    // Call Azure OpenAI API using fetch
    const response = await fetch('https://yak-dev-aai-app-1.openai.azure.com/openai/deployments/gpt-35-turbo/chat/completions?api-version=2024-08-01-preview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.AZURE_OPENAI_API_KEY
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'You are an assistant that summarises text. If the text contains emoji or Unicode characters, summarise it to fit 70 characters. Otherwise, summarise it to fit 160 characters. Only provide a single summary, and do not explain or list the number of characters.' },
          { role: 'user', content: `Summarise the following text in ${limit} characters or less: ${text}` }
        ],
        max_tokens: 150,
        temperature: 0.3
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
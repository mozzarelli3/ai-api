import { test, expect } from 'vitest';
import request from 'supertest';
import app from './server'; 

import dotenv from 'dotenv';
dotenv.config();


// Dummy test - make sure vitest works

test('Dummy test to check if Vitest is working', () => {
  expect(true).toBe(true);  // A simple test that always passes
});


// Check that the AI Summary that is generated is within 160 character limit

test('POST /summarise should return a summary within 160 characters', async () => {
  const response = await request(app)
    .post('/summarise')
    .send({ text: 'This is a long sample text that needs to be summarized by the AI. The summary should fit within 160 characters to meet the requirement. If not, well that really would not be very good, would it?' });

  // Check if the response status is OK
  expect(response.status).toBe(200);

  // Ensure the summary exists and is within the character limit
  const summary = response.body.summary;
  expect(summary).toBeDefined();
  expect(summary.length).toBeLessThanOrEqual(160);  // Check if the summary is 160 characters or less
});



// Check that AI Summary handles unicode characters correctly

test('should return a summarized text with max 70 characters for emoji text', async () => {
  const res = await request(app)
    .post('/summarise')
    .send({ text: "This is a test with emoji 🌍 that should be shortened to 70 characters. If this did not have an emoji, then we would expect to see the usual one hundred and sixty characters of course." });

  expect(res.statusCode).toEqual(200);
  expect(res.body).toHaveProperty('summary');
  expect(res.body.summary.length).toBeLessThanOrEqual(70);
});


// Check that AI Summary handles empty string input

test('should return 400 when text is not provided', async () => {
  const res = await request(app)
    .post('/summarise')
    .send({});

  expect(res.statusCode).toEqual(400);
  expect(res.body).toHaveProperty('error', 'Text is required for summarisation.');
});


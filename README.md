# BIO200 Child Image Game

React + Vite app for choosing two adult trait profiles and generating a fictional child portrait with OpenRouter image generation.

## Local Setup

1. Create `.env.local` with `OPENROUTER_API_KEY=...`.
2. Run `npm install` if dependencies are missing.
3. Run `npm run dev` for the Vite frontend, or `vercel dev` if you want the `/api/generate-child` function locally too.

The image generation endpoint is `api/generate-child.js` and expects the server environment variable `OPENROUTER_API_KEY`.

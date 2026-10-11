# OtoVerse mascot chat API

Production: `https://otoverse-mascot-api.vercel.app/api/chat`.
Vercel project: `otoverse-mascot-api`, team `team_fNO2S11GhnSBOTae8dY1X6kP`.

Deploy this directory independently of the Firebase frontend with the Vercel CLI.
Set `NEWS_AI_KEY` as a production Secret on this project; never place it in Vite variables or commit an env file.
The provider is `https://gen-ai.kkc.rmuti.ac.th/api/v1`, model `gemini-3.1-flash-lite`.

POST accepts `{message, history}` and requires the user's Firebase ID token in `Authorization: Bearer ...`.
Only the two OtoVerse production origins may use browser CORS. Firebase verifies token signatures.
Firestore rules enforce a rolling 24-hour limit of 60 requests per account and at least 5 seconds between requests, with atomic write preconditions. Deploy `firestore.rules` before using this API.
Prompts use public catalog, synopsis, and news data. Chat messages are not persisted or logged by this handler.
Provider failures still consume a request; closing the chat aborts the browser request but may not cancel provider work.

Frontend endpoint override: `VITE_MASCOT_CHAT_URL` (public endpoint only).

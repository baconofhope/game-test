# Prompt Match Party

A lightweight browser game prototype:

1. Everyone sees the same target AI-style image.
2. Each player writes a prompt trying to reproduce it.
3. The app generates one image per submitted prompt.
4. Players vote on which generated image is closest to the target.
5. The most-voted image wins that round.

## How to run

### 1) Set your OpenAI API key

```bash
export OPENAI_API_KEY="your_api_key_here"
```

Optional:

```bash
export OPENAI_IMAGE_MODEL="gpt-image-1"
```

### 2) Start the app server

```bash
cd /workspace/game-test
npm start
```

Open: <http://localhost:4173>

## Gameplay quick start

1. Choose player count (2–8).
2. Click **Start Round**.
3. Every player enters a prompt.
4. Click **Generate Entries**.
5. The app shows anonymous image labels (Image A, Image B, ...), then each player votes for the best match (cannot vote for self).
6. Click **Reveal Winner** to see results.

## API behavior

The frontend calls `POST /api/generate-image` with:

```json
{ "prompt": "your prompt text" }
```

The server proxies the request to OpenAI image generation and returns:

```json
{ "imageUrl": "https://... or data:image/png;base64,..." }
```

If OpenAI is unavailable (or `OPENAI_API_KEY` is not configured), the UI falls back to deterministic seeded preview images so the game remains playable.

## Notes

- Voting determines the winner (no text-similarity scoring).

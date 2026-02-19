# Prompt Match Party

A lightweight browser game prototype:

1. Everyone sees the same target AI-style image.
2. Each player writes a prompt trying to reproduce it.
3. The app scores each prompt by text similarity with the hidden source prompt.
4. The top score wins that round.

## How to run

### Option 1 (recommended): Python static server

```bash
cd /workspace/game-test
python3 -m http.server 4173
```

Open: <http://localhost:4173>

### Option 2: VS Code Live Server (if you use VS Code)

- Open this folder in VS Code.
- Right-click `index.html`.
- Click **Open with Live Server**.

## Gameplay quick start

1. Choose player count (2–8).
2. Click **Start Round**.
3. Every player enters a prompt.
4. Click **Score Round** to see rankings and the winner.

## Notes

- Image generation is simulated using seeded Picsum images for deterministic previews.
- Similarity is currently prompt-text based (word overlap + length heuristic).

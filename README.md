# Prompt Match Party

A lightweight browser game prototype:

1. Everyone sees the same target AI-style image.
2. Each player writes a prompt trying to reproduce it.
3. The app generates one image per submitted prompt.
4. Players vote on which generated image is closest to the target.
5. The most-voted image wins that round.

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
4. Click **Generate Entries**.
5. Each player votes for the best match (cannot vote for self).
6. Click **Reveal Winner** to see results.

## Notes

- Image generation is simulated using seeded Picsum images for deterministic previews.
- Voting determines the winner (no text-similarity scoring).

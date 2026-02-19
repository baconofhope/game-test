const promptSeeds = [
  "cinematic astronaut in neon jungle, volumetric lighting, ultra detailed",
  "cozy cabin by a frozen lake at sunrise, watercolor, soft pastel tones",
  "tiny dragon librarian reading glowing books, fantasy illustration",
  "retro-futuristic city with flying trams, rainy night, synthwave",
  "underwater temple covered in coral, sunrays through water, realism",
  "mountain village on floating islands, golden hour, digital painting"
];

const setupPanel = document.getElementById("setupPanel");
const roundPanel = document.getElementById("roundPanel");
const playerCountInput = document.getElementById("playerCount");
const startBtn = document.getElementById("startBtn");
const newRoundBtn = document.getElementById("newRoundBtn");
const promptForm = document.getElementById("promptForm");
const playerInputs = document.getElementById("playerInputs");
const targetImage = document.getElementById("targetImage");
const winningImage = document.getElementById("winningImage");
const winningPrompt = document.getElementById("winningPrompt");
const targetHint = document.getElementById("targetHint");
const roundTitle = document.getElementById("roundTitle");
const results = document.getElementById("results");
const scoreboard = document.getElementById("scoreboard");
const winnerCallout = document.getElementById("winnerCallout");

let round = 1;
let secretPrompt = "";

function hashCode(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function imageFromPrompt(prompt) {
  const seed = hashCode(prompt);
  return `https://picsum.photos/seed/${seed}/600/600`;
}

function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function scoreSimilarity(guess, target) {
  const gWords = new Set(normalize(guess));
  const tWords = new Set(normalize(target));
  const overlap = [...gWords].filter((word) => tWords.has(word)).length;
  const coverage = overlap / Math.max(1, tWords.size);
  const brevityPenalty = Math.min(1, normalize(guess).length / Math.max(3, tWords.size * 0.6));
  return Math.round((coverage * 85 + brevityPenalty * 15) * 100);
}

function renderPlayerInputs(playerCount) {
  playerInputs.innerHTML = "";
  for (let i = 1; i <= playerCount; i += 1) {
    const wrapper = document.createElement("label");
    wrapper.innerHTML = `Player ${i}
      <textarea id="player-${i}" rows="3" placeholder="Write your best image prompt..."></textarea>`;
    playerInputs.appendChild(wrapper);
  }
}

function createRound() {
  const index = Math.floor(Math.random() * promptSeeds.length);
  secretPrompt = promptSeeds[index];
  targetImage.src = imageFromPrompt(secretPrompt);
  targetHint.textContent = "Hint: Study colors, setting, and style details.";

  winningImage.src = "";
  winningPrompt.textContent = "No winner yet.";
  results.classList.add("hidden");
  roundTitle.textContent = `Round ${round}`;
}

startBtn.addEventListener("click", () => {
  const count = Number(playerCountInput.value);
  if (Number.isNaN(count) || count < 2 || count > 8) {
    alert("Choose between 2 and 8 players.");
    return;
  }

  renderPlayerInputs(count);
  createRound();
  setupPanel.classList.add("hidden");
  roundPanel.classList.remove("hidden");
});

newRoundBtn.addEventListener("click", () => {
  round += 1;
  createRound();
  [...playerInputs.querySelectorAll("textarea")].forEach((el) => {
    el.value = "";
  });
});

promptForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const entries = [...playerInputs.querySelectorAll("textarea")].map((input, idx) => ({
    player: idx + 1,
    prompt: input.value.trim()
  }));

  if (entries.some((e) => !e.prompt)) {
    alert("All players must submit a prompt.");
    return;
  }

  const ranked = entries
    .map((entry) => ({
      ...entry,
      score: scoreSimilarity(entry.prompt, secretPrompt)
    }))
    .sort((a, b) => b.score - a.score);

  scoreboard.innerHTML = ranked
    .map((r) => `<li>Player ${r.player}: ${r.score / 100}% similarity</li>`)
    .join("");

  const winner = ranked[0];
  winningImage.src = imageFromPrompt(winner.prompt);
  winningPrompt.textContent = `Player ${winner.player} prompt: “${winner.prompt}”`;
  winnerCallout.textContent = `🏆 Player ${winner.player} wins this round!`;
  results.classList.remove("hidden");
});

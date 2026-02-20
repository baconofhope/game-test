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
const gallerySection = document.getElementById("gallerySection");
const generatedGallery = document.getElementById("generatedGallery");
const voteForm = document.getElementById("voteForm");
const voteBtn = document.getElementById("voteBtn");
const results = document.getElementById("results");
const scoreboard = document.getElementById("scoreboard");
const winnerCallout = document.getElementById("winnerCallout");

let round = 1;
let secretPrompt = "";
let generatedEntries = [];

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

function renderPlayerInputs(playerCount) {
  playerInputs.innerHTML = "";
  for (let i = 1; i <= playerCount; i += 1) {
    const wrapper = document.createElement("label");
    wrapper.innerHTML = `Player ${i}
      <textarea id="player-${i}" rows="3" placeholder="Write your best image prompt..."></textarea>`;
    playerInputs.appendChild(wrapper);
  }
}

function resetRoundUi() {
  winningImage.src = "";
  winningPrompt.textContent = "No winner yet.";
  gallerySection.classList.add("hidden");
  generatedGallery.innerHTML = "";
  voteForm.innerHTML = "";
  voteBtn.classList.add("hidden");
  results.classList.add("hidden");
  scoreboard.innerHTML = "";
  winnerCallout.textContent = "";
  generatedEntries = [];
}

function createRound() {
  const index = Math.floor(Math.random() * promptSeeds.length);
  secretPrompt = promptSeeds[index];
  targetImage.src = imageFromPrompt(secretPrompt);
  targetHint.textContent = "Hint: Study colors, setting, and style details.";
  roundTitle.textContent = `Round ${round}`;
  resetRoundUi();
}

function renderGeneratedEntries(entries) {
  generatedGallery.innerHTML = entries
    .map(
      (entry) => `
      <article class="entry-card">
        <img src="${entry.imageUrl}" alt="Player ${entry.player} generated image" />
        <p><strong>Player ${entry.player}</strong>: ${entry.prompt}</p>
      </article>
    `
    )
    .join("");
}

function renderVoteInputs(entries) {
  voteForm.innerHTML = "";

  entries.forEach((voter) => {
    const label = document.createElement("label");
    label.textContent = `Player ${voter.player} votes for:`;

    const select = document.createElement("select");
    select.id = `vote-${voter.player}`;

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Choose a player";
    placeholder.selected = true;
    placeholder.disabled = true;
    select.appendChild(placeholder);

    entries
      .filter((candidate) => candidate.player !== voter.player)
      .forEach((candidate) => {
        const option = document.createElement("option");
        option.value = String(candidate.player);
        option.textContent = `Player ${candidate.player}`;
        select.appendChild(option);
      });

    label.appendChild(select);
    voteForm.appendChild(label);
  });

  voteBtn.classList.remove("hidden");
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

  if (entries.some((entry) => !entry.prompt)) {
    alert("All players must submit a prompt.");
    return;
  }

  generatedEntries = entries.map((entry) => ({
    ...entry,
    imageUrl: imageFromPrompt(entry.prompt),
    votes: 0
  }));

  renderGeneratedEntries(generatedEntries);
  renderVoteInputs(generatedEntries);
  gallerySection.classList.remove("hidden");
  results.classList.add("hidden");
});

voteBtn.addEventListener("click", () => {
  if (!generatedEntries.length) {
    return;
  }

  const voteValues = generatedEntries.map((entry) => {
    const select = document.getElementById(`vote-${entry.player}`);
    return {
      voter: entry.player,
      votedFor: Number(select.value)
    };
  });

  if (voteValues.some((vote) => Number.isNaN(vote.votedFor) || vote.votedFor < 1)) {
    alert("Every player must cast a vote.");
    return;
  }

  generatedEntries.forEach((entry) => {
    entry.votes = voteValues.filter((vote) => vote.votedFor === entry.player).length;
  });

  const ranked = [...generatedEntries].sort((a, b) => b.votes - a.votes);
  const winner = ranked[0];

  scoreboard.innerHTML = ranked
    .map((entry) => `<li>Player ${entry.player}: ${entry.votes} vote(s)</li>`)
    .join("");

  winningImage.src = winner.imageUrl;
  winningPrompt.textContent = `Player ${winner.player} prompt: “${winner.prompt}”`;
  winnerCallout.textContent = `🏆 Player ${winner.player} wins this round!`;
  results.classList.remove("hidden");
});

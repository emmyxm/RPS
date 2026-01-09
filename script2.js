const rock = document.getElementById("rock");
const paper = document.getElementById("paper");
const scissors = document.getElementById("scissors");
const reset = document.getElementById("reset");
const humanOutput = document.getElementById("human-output");
const aiOutput = document.getElementById("ai-output");
const gameCountElement = document.getElementById("game-count");
const winners = document.getElementById("winners");
const humanScoreDisplay = document.getElementById("human-score");
const aiScoreDisplay = document.getElementById("ai-score");

let gameScore = 0;
let humanScore = 0;
let aiScore = 0;

// Simple pattern-learning state
const playerHistory = [];
// N-gram configuration (track sequences up to length N)
const N = 3; // you can increase to track longer patterns
const ngramCounts = {}; // maps context key (e.g., 'rock,paper') -> { rock:0, paper:0, scissors:0 }
const globalCounts = { rock: 0, paper: 0, scissors: 0 };
// Probability to explore (choose a random move) to avoid being fully predictable
const explorationRate = 0.2;
const explorationDecay = 0.995; // per-round multiplier to reduce exploration as we learn

// Helper: ensure counts object exists for a given key
function ensureCounts(key) {
  if (!ngramCounts[key]) {
    ngramCounts[key] = { rock: 0, paper: 0, scissors: 0 };
  }
}

// Update model with an observed next move (nextMove) using the previous up-to-N moves
function updateModel(nextMove) {
  for (let k = 1; k <= N; k++) {
    if (playerHistory.length >= k) {
      const key = playerHistory.slice(-k).join(",");
      ensureCounts(key);
      ngramCounts[key][nextMove]++;
    }
  }
}

// Get predicted distribution for the next human move using backoff from N down to 1
function getProbabilities() {
  const choices = ["rock", "paper", "scissors"];
  for (let k = N; k >= 1; k--) {
    if (playerHistory.length >= k) {
      const key = playerHistory.slice(-k).join(",");
      const counts = ngramCounts[key];
      if (counts) {
        const total = counts.rock + counts.paper + counts.scissors;
        if (total > 0) {
          const probs = {
            rock: counts.rock / total,
            paper: counts.paper / total,
            scissors: counts.scissors / total,
          };
          // most likely human move
          const predicted = choices.reduce((a, b) =>
            probs[a] >= probs[b] ? a : b
          );
          return { probs, predicted };
        }
      }
    }
  }

  // fallback to global frequencies
  const gTotal = globalCounts.rock + globalCounts.paper + globalCounts.scissors;
  if (gTotal > 0) {
    const probs = {
      rock: globalCounts.rock / gTotal,
      paper: globalCounts.paper / gTotal,
      scissors: globalCounts.scissors / gTotal,
    };
    const predicted = Object.keys(probs).reduce((a, b) =>
      probs[a] >= probs[b] ? a : b
    );
    return { probs, predicted };
  }

  // no info: uniform distribution
  return {
    probs: { rock: 1 / 3, paper: 1 / 3, scissors: 1 / 3 },
    predicted: "rock",
  };
}

// Choose best response (max expected value) against a human distribution
function bestResponse(probs) {
  const choices = ["rock", "paper", "scissors"];
  const outcome = (ai, human) => {
    if (ai === human) return 0;
    if (
      (ai === "rock" && human === "scissors") ||
      (ai === "paper" && human === "rock") ||
      (ai === "scissors" && human === "paper")
    )
      return 1;
    return -1;
  };

  let best = [];
  let bestVal = -Infinity;
  for (const ai of choices) {
    let val = 0;
    for (const human of choices) {
      val += probs[human] * outcome(ai, human);
    }
    if (val > bestVal + 1e-9) {
      bestVal = val;
      best = [ai];
    } else if (Math.abs(val - bestVal) < 1e-9) {
      best.push(ai);
    }
  }

  // if tie, pick random among best
  return best[Math.floor(Math.random() * best.length)];
}

rock.addEventListener("click", () => handleClick(rock));

paper.addEventListener("click", () => handleClick(paper));

scissors.addEventListener("click", () => handleClick(scissors));

reset.addEventListener("click", function () {
  gameScore = 0;
  humanScore = 0;
  aiScore = 0;
  gameCountElement.textContent = "Game count:";
  winners.textContent = "Start Game";
  humanOutput.textContent = "";
  aiOutput.textContent = "";
  humanScoreDisplay.textContent = "0";
  aiScoreDisplay.textContent = "0";
});

function getAIChoice() {
  const choice = ["rock", "paper", "scissors"];
  // dynamic exploration (decreases as we observe more moves)
  const dynamicExploration = Math.max(
    0.02,
    explorationRate * Math.pow(explorationDecay, playerHistory.length)
  );
  if (playerHistory.length === 0 || Math.random() < dynamicExploration) {
    const randomChoice = Math.floor(Math.random() * choice.length);
    return { aiChoice: choice[randomChoice], predicted: null, isRandom: true };
  }

  const { probs, predicted } = getProbabilities();
  const aiMove = bestResponse(probs);
  return { aiChoice: aiMove, predicted, isRandom: false };
}

function determineWinner(player, ai) {
  if (player === ai) {
    return "Draw";
  } else if (
    (player === "rock" && ai === "scissors") ||
    (player === "paper" && ai === "rock") ||
    (player === "scissors" && ai === "paper")
  ) {
    return "You Win";
  } else {
    return "AI wins!";
  }
}

function handleClick(playerChoiceElement) {
  const playerChoice = playerChoiceElement.id;
  const { aiChoice, predicted, isRandom } = getAIChoice();
  const result = determineWinner(playerChoice, aiChoice);
  gameScore++;

  // Update scores based on result
  if (result === "You Win") {
    humanScore++;
  } else if (result === "AI wins!") {
    aiScore++;
  }

  // Update learning model AFTER observing the player's move
  updateModel(playerChoice);
  globalCounts[playerChoice]++;
  playerHistory.push(playerChoice);

  gameCountElement.textContent = `Game count: ${gameScore}`;
  winners.textContent = result;
  humanOutput.textContent = `Your choice: ${playerChoice}`;
  // Always show only the AI's final choice to avoid duplicate or confusing output
  aiOutput.textContent = `AI choice: ${aiChoice}`;
  humanScoreDisplay.textContent = humanScore;
  aiScoreDisplay.textContent = aiScore;
}

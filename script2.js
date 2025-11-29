const rock = document.getElementById("rock");
const paper = document.getElementById("paper");
const scissors = document.getElementById("scissors");
const reset = document.getElementById("reset");
const humanOutput = document.getElementById("human-output");
const aiOutput = document.getElementById("ai-output");
const gameCountElement = document.getElementById('game-count');
const winners = document.getElementById('winners');
const humanScoreDisplay = document.getElementById('human-score');
const aiScoreDisplay = document.getElementById('ai-score');

let gameScore = 0;
let humanScore = 0;
let aiScore = 0;

rock.addEventListener('click', () =>
handleClick(rock));

paper.addEventListener('click', () =>
handleClick(paper));

scissors.addEventListener('click', () =>
handleClick(scissors));

reset.addEventListener('click', function () {
    gameScore = 0;
    humanScore = 0;
    aiScore = 0;
    gameCountElement.textContent = 'Game count:';
    winners.textContent = 'Start Game';
    humanOutput.textContent = '';
    aiOutput.textContent = '';
    humanScoreDisplay.textContent = '0';
    aiScoreDisplay.textContent = '0';
});

function getAIChoice() {
    const choice = ["rock", "paper", "scissors"];
    let randomChoice = Math.floor(Math.random() * choice.length);
    return choice[randomChoice];
}

function determineWinner(player, ai) {
    if (player === ai) {
        return "Draw";
    } else if (
        (player === 'rock' && ai === 'scissors') ||
        (player === 'paper' && ai === 'rock') ||
        (player === 'scissors' && ai === 'paper')
    ) {
        return "You Win";
    } else {
        return "AI wins!";
    }
}

function handleClick(playerChoiceElement) {
    const playerChoice = playerChoiceElement.id;
    const aiChoice = getAIChoice();
    const result = determineWinner(playerChoice, aiChoice);
    gameScore++;
    
    // Update scores based on result
    if (result === "You Win") {
        humanScore++;
    } else if (result === "AI wins!") {
        aiScore++;
    }
    
    gameCountElement.textContent = `Game count: ${gameScore}`;
    winners.textContent = result;
    humanOutput.textContent = `Your choice: ${playerChoice}`;
    aiOutput.textContent = `AI choice: ${aiChoice}`;
    humanScoreDisplay.textContent = humanScore;
    aiScoreDisplay.textContent = aiScore;
}
function getHumanChoice() {
  // let input = prompt("Please enter your choice");
  return input.toLowerCase();
}

function getComputerChoice() {
  let input = ["rock", "paper", "scissors"];
  let randomIndex = Math.floor(Math.random() * input.length);
  return input[randomIndex];
}

let humanChoice = 0;
let computerChoice = 0;

function gamePlay(humanChoice, computerChoice) {
  if (computerChoice === humanChoice) {
    console.log("it a tie");
  } else if (
    (computerChoice === "rock" && humanChoice === "scissors") ||
    (computerChoice === "scissors" && humanChoice === "paper") ||
    (computerChoice === "paper" && humanChoice === "rock")
  ) {
    console.log(computerChoice + " you win🎉");
  } else {
    console.log("computer wins🎉");
  }
}

let human = getHumanChoice();
let computer = getComputerChoice();
gamePlay(human, computer);

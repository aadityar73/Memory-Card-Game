const creatures = ["🦄", "🧚‍♀️", "🧝‍♂️", "🌷", "🌲", "🍄", "🦋", "🍃"];

let difficulty = "easy";
let cards = [];
let flippedCards = [];
let score = 0;
let timerId;
let timer = 0;

const gameBoard = document.querySelector(".game-board");
const difficultySelect = document.getElementById("difficulty");
const startButton = document.getElementById("start-btn");
const timerDisplay = document.getElementById("timer");
const scoreDisplay = document.getElementById("score");

difficultySelect.addEventListener("change", () => {
  difficulty = difficultySelect.value;
});

startButton.addEventListener("click", startGame);

function startGame() {
  clearBoard();
  resetGame();
  generateCards();
  startTimer();
}

function clearBoard() {
  gameBoard.innerHTML = "";
}

function resetGame() {
  cards = [];
  flippedCards = [];
  score = 0;
  timer = 0;
  updateScoreDisplay();
  timerDisplay.textContent = timer;
}

function generateCards() {
  let pairs = 0;
  const creaturesCopy = creatures.slice();

  switch (difficulty) {
    case "easy":
      pairs = 4;
      break;
    case "medium":
      pairs = 6;
      break;
    case "hard":
      pairs = 8;
      break;
    default:
      pairs = 4;
      break;
  }

  const totalCards = pairs * 2;
  const selectedCreatures = creaturesCopy.splice(0, pairs);

  for (let i = 0; i < pairs; i++) {
    const creature = selectedCreatures[i];
    cards.push(creature, creature);
  }

  // Shuffle cards
  for (let i = totalCards - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }

  // Create and add cards to the game board
  for (let i = 0; i < totalCards; i++) {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.index = i;
    card.addEventListener("click", flipCard);
    gameBoard.appendChild(card);
  }
}

function flipCard(event) {
  const cardIndex = event.target.dataset.index;
  const cardElement = event.target;

  if (flippedCards.length < 2 && !flippedCards.includes(cardIndex)) {
    cardElement.innerText = cards[cardIndex];
    cardElement.classList.add("flipped"); // Add flipped class for animation
    flippedCards.push({ index: cardIndex, element: cardElement });
  }

  if (flippedCards.length === 2) {
    setTimeout(checkMatch, 1000);
  }
}

function checkMatch() {
  const card1 = cards[flippedCards[0].index];
  const card2 = cards[flippedCards[1].index];

  if (card1 === card2) {
    score += 10;
    updateScoreDisplay();
    flippedCards.forEach((card) => {
      card.element.removeEventListener("click", flipCard);
      card.element.style.backgroundColor = "#e0e0e0";
    });
  } else {
    flippedCards.forEach((card) => {
      card.element.innerText = "";
      card.element.classList.remove("flipped");
    });
  }

  flippedCards = [];

  // Check if all pairs have been matched
  const totalPairs = creatures.length;
  const matchedPairs = score / 10;
  if (matchedPairs === totalPairs / 2) {
    endGame();
  }
}

function startTimer() {
  timerId = setInterval(() => {
    timer++;
    timerDisplay.textContent = timer;
  }, 1000);
}

function stopTimer() {
  clearInterval(timerId);
}

function updateScoreDisplay() {
  scoreDisplay.textContent = score;
}

function endGame() {
  stopTimer();
  setTimeout(showWinningAlert, 500); // Delay to display the winning alert
}

function showHighScores() {
  const highScores = JSON.parse(localStorage.getItem("highScores")) || [];
  const highScoresList = document.createElement("ul");
  highScoresList.classList.add("high-scores-list");

  highScores.forEach((entry) => {
    const listItem = document.createElement("li");
    listItem.textContent = `${entry.name || "Anonymous"}: ${
      entry.score
    } seconds`;
    highScoresList.appendChild(listItem);
  });

  const highScoresContainer = document.querySelector(".high-scores");
  highScoresContainer.innerHTML = "<h2>High Scores</h2>";
  highScoresContainer.appendChild(highScoresList);
}

function showWinningAlert() {
  const playerName = prompt(
    "Congratulations! You have completed the game. Enter your name:"
  );
  if (playerName) {
    saveHighScore(playerName);
    alert(
      `Congratulations, ${playerName}! You have completed the game in ${timer} seconds!`
    );
  } else {
    alert(`Congratulations! You have completed the game in ${timer} seconds!`);
  }
  showHighScores(); // Only display high scores, not adding new entries here
}

function saveHighScore(name) {
  const highScores = JSON.parse(localStorage.getItem("highScores")) || [];
  const existingEntryIndex = highScores.findIndex(
    (entry) => entry.name === name
  );

  if (existingEntryIndex !== -1) {
    // If the player's score already exists with the provided name, update the score
    highScores[existingEntryIndex].score = timer;
  } else {
    // If the player's score doesn't exist with the provided name, add a new entry
    highScores.push({ name: name, score: timer });
  }

  highScores.sort((a, b) => a.score - b.score);
  highScores.splice(10); // Keep only the top 10 high scores

  localStorage.setItem("highScores", JSON.stringify(highScores));
}

// Function to clear high scores from local storage
function clearHighScores() {
  localStorage.removeItem("highScores");
}

// Clear high scores when the page is loaded
window.addEventListener("load", clearHighScores);

const board = document.getElementById("board");
const messageContainer = document.getElementById("message-container");
const resetBtn = document.getElementById("reset-btn");
const themeSwitch = document.getElementById("theme-switch");
const themeLabel = document.getElementById("theme-label");
const WORD_LENGTH = 5;
const ATTEMPTS = 6;
let currentRow = 0;
let currentCol = 0;
let isGameOver = false;
let solution = "";
let wordsList = [];
let guessedWords = new Set();

fetch("wordle-words.txt")
  .then((response) => response.text())
  .then((data) => {
    wordsList = data
      .split("\n")
      .map((w) => w.trim().toLowerCase())
      .filter((w) => w.length === 5);
    startGame();
  })
  .catch((error) => {
    showMessage("Error loading words.");
  });

function startGame() {
  isGameOver = false;
  currentRow = 0;
  currentCol = 0;
  guessedWords.clear();
  messageContainer.classList.remove("show");
  solution = wordsList[Math.floor(Math.random() * wordsList.length)];
  createBoard();
  document.addEventListener("keydown", handleKeyPress);
}

function createBoard() {
  board.innerHTML = "";
  for (let i = 0; i < ATTEMPTS; i++) {
    for (let j = 0; j < WORD_LENGTH; j++) {
      const tile = document.createElement("div");
      tile.classList.add("tile");
      tile.setAttribute("data-row", i);
      tile.setAttribute("data-col", j);
      board.appendChild(tile);
    }
  }
}

function handleKeyPress(e) {
  if (isGameOver) return;
  const key = e.key;
  if (key === "Enter") {
    if (currentCol === WORD_LENGTH) checkGuess();
    return;
  }
  if (key === "Backspace" || key === "Delete") {
    deleteLetter();
    return;
  }
  if (/^[a-zA-Z]$/.test(key)) addLetter(key.toLowerCase());
}

function addLetter(letter) {
  if (currentCol < WORD_LENGTH && currentRow < ATTEMPTS) {
    const tile = getTile(currentRow, currentCol);
    tile.textContent = letter;
    currentCol++;
  }
}

function deleteLetter() {
  if (currentCol > 0) {
    currentCol--;
    const tile = getTile(currentRow, currentCol);
    tile.textContent = "";
  }
}

function checkGuess() {
  const guess = getCurrentGuess();
  if (!wordsList.includes(guess)) {
    showMessage("Not in word list");
    return;
  }
  if (guessedWords.has(guess)) {
    showMessage("Already used that guess");
    return;
  }
  guessedWords.add(guess);
  revealTiles(guess);
}

function revealTiles(guess) {
  const rowTiles = [];
  for (let i = 0; i < WORD_LENGTH; i++) rowTiles.push(getTile(currentRow, i));
  const checkSolution = solution.split("");
  const guessArr = guess.split("");
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guessArr[i] === checkSolution[i]) {
      rowTiles[i].classList.add("correct");
      checkSolution[i] = null;
      guessArr[i] = null;
    }
  }
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guessArr[i] !== null && checkSolution.includes(guessArr[i])) {
      rowTiles[i].classList.add("present");
      checkSolution[checkSolution.indexOf(guessArr[i])] = null;
      guessArr[i] = null;
    }
  }
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guessArr[i] !== null) rowTiles[i].classList.add("absent");
  }
  rowTiles.forEach((tile) => tile.classList.add("revealed"));
  if (guess === solution) {
    showMessage("Great Job!");
    gameOver(true);
  } else {
    currentRow++;
    currentCol = 0;
    if (currentRow === ATTEMPTS) {
      showMessage("The word was: " + solution.toUpperCase());
      gameOver(false);
    }
  }
}

function showMessage(msg) {
  messageContainer.textContent = msg;
  messageContainer.classList.add("show");
}

function gameOver(won) {
  isGameOver = true;
  document.removeEventListener("keydown", handleKeyPress);
}

function getCurrentGuess() {
  let guess = "";
  for (let i = 0; i < WORD_LENGTH; i++)
    guess += getTile(currentRow, i).textContent;
  return guess;
}

function getTile(row, col) {
  return board.querySelector(`.tile[data-row='${row}'][data-col='${col}']`);
}

resetBtn.addEventListener("click", () => {
  startGame();
});

themeSwitch.addEventListener("change", () => {
  document.documentElement.classList.toggle("dark-mode");
  document.documentElement.classList.toggle("light-mode");
  themeLabel.textContent = document.documentElement.classList.contains(
    "light-mode"
  )
    ? "Light Mode"
    : "Dark Mode";
});

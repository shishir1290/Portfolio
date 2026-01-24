/** @format */

// High Score Storage Utility
export interface HighScore {
  score: number;
  date: string;
  difficulty?: string;
}

export interface GameScores {
  snake: HighScore[];
  tetris: HighScore[];
  tictactoe: { wins: number; losses: number; draws: number };
  rps: { wins: number; losses: number; draws: number };
}

const STORAGE_KEY = "portfolio_game_scores";

// Get all scores from localStorage
export const getAllScores = (): GameScores => {
  if (typeof window === "undefined") {
    return getDefaultScores();
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error loading scores:", error);
  }

  return getDefaultScores();
};

// Get default/empty scores
const getDefaultScores = (): GameScores => ({
  snake: [],
  tetris: [],
  tictactoe: { wins: 0, losses: 0, draws: 0 },
  rps: { wins: 0, losses: 0, draws: 0 },
});

// Save scores to localStorage
const saveScores = (scores: GameScores): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
  } catch (error) {
    console.error("Error saving scores:", error);
  }
};

// Snake Game Functions
export const getSnakeHighScores = (): HighScore[] => {
  return getAllScores()
    .snake.sort((a, b) => b.score - a.score)
    .slice(0, 10);
};

export const saveSnakeScore = (score: number, difficulty: string): void => {
  const scores = getAllScores();
  scores.snake.push({
    score,
    difficulty,
    date: new Date().toLocaleDateString(),
  });
  // Keep only top 10
  scores.snake = scores.snake.sort((a, b) => b.score - a.score).slice(0, 10);
  saveScores(scores);
};

export const getSnakeHighScore = (difficulty?: string): number => {
  const scores = getSnakeHighScores();
  if (difficulty) {
    const filtered = scores.filter((s) => s.difficulty === difficulty);
    return filtered.length > 0 ? filtered[0].score : 0;
  }
  return scores.length > 0 ? scores[0].score : 0;
};

// Tetris Game Functions
export const getTetrisHighScores = (): HighScore[] => {
  return getAllScores()
    .tetris.sort((a, b) => b.score - a.score)
    .slice(0, 10);
};

export const saveTetrisScore = (score: number, difficulty: string): void => {
  const scores = getAllScores();
  scores.tetris.push({
    score,
    difficulty,
    date: new Date().toLocaleDateString(),
  });
  // Keep only top 10
  scores.tetris = scores.tetris.sort((a, b) => b.score - a.score).slice(0, 10);
  saveScores(scores);
};

export const getTetrisHighScore = (difficulty?: string): number => {
  const scores = getTetrisHighScores();
  if (difficulty) {
    const filtered = scores.filter((s) => s.difficulty === difficulty);
    return filtered.length > 0 ? filtered[0].score : 0;
  }
  return scores.length > 0 ? scores[0].score : 0;
};

// Tic Tac Toe Stats Functions
export const getTicTacToeStats = () => {
  return getAllScores().tictactoe;
};

export const updateTicTacToeStats = (result: "win" | "loss" | "draw"): void => {
  const scores = getAllScores();
  if (result === "win") scores.tictactoe.wins++;
  else if (result === "loss") scores.tictactoe.losses++;
  else scores.tictactoe.draws++;
  saveScores(scores);
};

// Rock Paper Scissors Stats Functions
export const getRPSStats = () => {
  return getAllScores().rps;
};

export const updateRPSStats = (result: "win" | "loss" | "draw"): void => {
  const scores = getAllScores();
  if (result === "win") scores.rps.wins++;
  else if (result === "loss") scores.rps.losses++;
  else scores.rps.draws++;
  saveScores(scores);
};

// Reset all scores
export const resetAllScores = (): void => {
  saveScores(getDefaultScores());
};

// Reset specific game scores
export const resetGameScores = (
  game: "snake" | "tetris" | "tictactoe" | "rps",
): void => {
  const scores = getAllScores();
  if (game === "snake") scores.snake = [];
  else if (game === "tetris") scores.tetris = [];
  else if (game === "tictactoe")
    scores.tictactoe = { wins: 0, losses: 0, draws: 0 };
  else if (game === "rps") scores.rps = { wins: 0, losses: 0, draws: 0 };
  saveScores(scores);
};

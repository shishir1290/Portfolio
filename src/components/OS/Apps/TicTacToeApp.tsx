/** @format */

import React, { useState, useEffect } from "react";
import { useSound } from "@/hooks/useSound";
import {
  updateTicTacToeStats,
  getTicTacToeStats,
} from "@/utils/highScoreStorage";

type Player = "X" | "O" | null;
type Difficulty = "Easy" | "Medium" | "Hard";

export const TicTacToeApp: React.FC = () => {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState<Player | "Draw" | null>(null);
  const [isBotTurn, setIsBotTurn] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [stats, setStats] = useState(getTicTacToeStats());
  const { playClickSound, playWinSound, playLoseSound } = useSound();

  // Load stats on mount
  useEffect(() => {
    setStats(getTicTacToeStats());
  }, []);

  const checkWinner = (squares: Player[]) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (
        squares[a] &&
        squares[a] === squares[b] &&
        squares[a] === squares[c]
      ) {
        return squares[a];
      }
    }

    if (!squares.includes(null)) {
      return "Draw";
    }

    return null;
  };

  const handleClick = (i: number) => {
    if (board[i] || winner || isBotTurn) return;

    playClickSound();
    const newBoard = [...board];
    newBoard[i] = "X";
    setBoard(newBoard);
    setIsXNext(false);

    const gameWinner = checkWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
    } else {
      setIsBotTurn(true);
    }
  };

  // Minimax Algorithm
  const minimax = (
    squares: Player[],
    depth: number,
    isMaximizing: boolean,
  ): number => {
    const result = checkWinner(squares);
    if (result === "O") return 10 - depth;
    if (result === "X") return depth - 10;
    if (result === "Draw") return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (squares[i] === null) {
          squares[i] = "O";
          const score = minimax(squares, depth + 1, false);
          squares[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (squares[i] === null) {
          squares[i] = "X";
          const score = minimax(squares, depth + 1, true);
          squares[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  // Bot Logic
  useEffect(() => {
    if (isBotTurn && !winner) {
      const timer = setTimeout(() => {
        const availableMoves = board
          .map((val, idx) => (val === null ? idx : null))
          .filter((val) => val !== null) as number[];

        if (availableMoves.length > 0) {
          let move: number;

          if (difficulty === "Easy") {
            // Random move
            move =
              availableMoves[Math.floor(Math.random() * availableMoves.length)];
          } else if (difficulty === "Medium") {
            // 50% chance of best move, 50% random
            if (Math.random() > 0.5) {
              move = getBestMove(board);
            } else {
              move =
                availableMoves[
                  Math.floor(Math.random() * availableMoves.length)
                ];
            }
          } else {
            // Hard - Minimax
            move = getBestMove(board);
          }

          const newBoard = [...board];
          newBoard[move] = "O";
          setBoard(newBoard);
          setIsXNext(true);
          setIsBotTurn(false);

          const gameWinner = checkWinner(newBoard);
          if (gameWinner) {
            setWinner(gameWinner);
            if (gameWinner === "O") {
              playLoseSound();
              updateTicTacToeStats("loss");
            } else if (gameWinner === "X") {
              playWinSound();
              updateTicTacToeStats("win");
            } else if (gameWinner === "Draw") {
              updateTicTacToeStats("draw");
            }
            setStats(getTicTacToeStats());
          }
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isBotTurn, board, winner, difficulty, playWinSound, playLoseSound]);

  const getBestMove = (currentBoard: Player[]) => {
    let bestScore = -Infinity;
    let move = -1;
    for (let i = 0; i < 9; i++) {
      if (currentBoard[i] === null) {
        currentBoard[i] = "O";
        const score = minimax(currentBoard, 0, false);
        currentBoard[i] = null;
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }
    return move;
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setIsBotTurn(false);
  };

  return (
    <div className="h-full w-full bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex flex-col items-center justify-center p-2 md:p-4 overflow-auto">
      <h2 className="text-xl md:text-3xl font-bold mb-2 md:mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-600">
        ⭕ Tic-Tac-Toe ❌
      </h2>

      {/* Stats Display */}
      <div className="mb-2 md:mb-4 flex gap-3 md:gap-6 text-center">
        <div>
          <div className="text-xs text-gray-400">Wins</div>
          <div className="text-lg md:text-xl font-bold text-green-400">
            {stats.wins}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Losses</div>
          <div className="text-lg md:text-xl font-bold text-red-400">
            {stats.losses}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Draws</div>
          <div className="text-lg md:text-xl font-bold text-yellow-400">
            {stats.draws}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Win Rate</div>
          <div className="text-lg md:text-xl font-bold text-blue-400">
            {stats.wins + stats.losses > 0 ?
              Math.round((stats.wins / (stats.wins + stats.losses)) * 100)
            : 0}
            %
          </div>
        </div>
      </div>

      {/* Difficulty Selector */}
      <div className="mb-3 md:mb-4 flex gap-2">
        {(["Easy", "Medium", "Hard"] as Difficulty[]).map((level) => (
          <button
            key={level}
            onClick={() => {
              setDifficulty(level);
              resetGame();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs md:text-sm transition-all transform hover:scale-105 ${
              difficulty === level ?
                "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}>
            {level === "Easy" && "🐢 "}
            {level === "Medium" && "🏃 "}
            {level === "Hard" && "🚀 "}
            {level}
          </button>
        ))}
      </div>

      <div className="mb-3 md:mb-4 text-base md:text-lg font-medium text-gray-300">
        {winner ?
          winner === "Draw" ?
            <span className="text-yellow-400">🤝 It's a Draw!</span>
          : <span className={winner === "X" ? "text-blue-400" : "text-red-400"}>
              {winner === "X" ? "🎉 You Win!" : "💪 Bot Wins!"}
            </span>

        : <span>Next: {isXNext ? "You (X)" : "Bot (O)"}</span>}
      </div>

      <div className="grid grid-cols-3 gap-2 md:gap-3 bg-gray-800/50 p-2 md:p-3 rounded-xl backdrop-blur-sm shadow-2xl">
        {board.map((square, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            className={`w-16 h-16 md:w-24 md:h-24 bg-gray-900 rounded-lg flex items-center justify-center text-4xl md:text-5xl font-bold transition-all shadow-lg ${
              square === "X" ? "text-blue-400 bg-blue-500/10"
              : square === "O" ? "text-red-400 bg-red-500/10"
              : "hover:bg-gray-800 hover:scale-105 active:scale-95"
            }`}>
            {square}
          </button>
        ))}
      </div>

      <button
        onClick={resetGame}
        className="mt-4 md:mt-6 px-6 md:px-8 py-2 md:py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold">
        🔄 Reset Game
      </button>

      <p className="mt-3 md:mt-4 text-xs md:text-sm text-gray-400 text-center">
        🎮 Click a square to make your move
      </p>
    </div>
  );
};

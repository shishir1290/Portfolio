/** @format */

import React, { useState, useEffect } from "react";
import { useSound } from "@/hooks/useSound";

type Player = "X" | "O" | null;
type Difficulty = "Easy" | "Medium" | "Hard";

export const TicTacToeApp: React.FC = () => {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState<Player | "Draw" | null>(null);
  const [isBotTurn, setIsBotTurn] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const { playClickSound, playWinSound, playLoseSound } = useSound();

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
    isMaximizing: boolean
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
            if (gameWinner === "O") playLoseSound();
            else if (gameWinner === "X") playWinSound();
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
    <div className="h-full w-full bg-white dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Tic-Tac-Toe
      </h2>

      {/* Difficulty Selector */}
      <div className="mb-4 flex gap-2">
        {(["Easy", "Medium", "Hard"] as Difficulty[]).map((level) => (
          <button
            key={level}
            onClick={() => {
              setDifficulty(level);
              resetGame();
            }}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              difficulty === level
                ? "bg-blue-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}>
            {level}
          </button>
        ))}
      </div>

      <div className="mb-4 text-lg font-medium text-gray-700 dark:text-gray-300">
        {winner ? (
          winner === "Draw" ? (
            "It's a Draw!"
          ) : (
            <span className={winner === "X" ? "text-blue-500" : "text-red-500"}>
              Winner: {winner}
            </span>
          )
        ) : (
          <span>Next Player: {isXNext ? "You (X)" : "Bot (O)"}</span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 bg-gray-300 dark:bg-gray-700 p-2 rounded-lg">
        {board.map((square, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            className={`w-20 h-20 bg-white dark:bg-gray-800 rounded flex items-center justify-center text-4xl font-bold transition-colors ${
              square === "X"
                ? "text-blue-500"
                : square === "O"
                ? "text-red-500"
                : "hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}>
            {square}
          </button>
        ))}
      </div>

      <button
        onClick={resetGame}
        className="mt-6 px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors">
        Reset Game
      </button>
    </div>
  );
};

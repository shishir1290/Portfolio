/** @format */

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSound } from "@/hooks/useSound";
import { saveTetrisScore, getTetrisHighScore } from "@/utils/highScoreStorage";

type Difficulty = "Easy" | "Medium" | "Hard";

const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 25;

const SHAPES = [
  [[1, 1, 1, 1]], // I
  [
    [1, 1],
    [1, 1],
  ], // O
  [
    [0, 1, 0],
    [1, 1, 1],
  ], // T
  [
    [1, 0, 0],
    [1, 1, 1],
  ], // L
  [
    [0, 0, 1],
    [1, 1, 1],
  ], // J
  [
    [0, 1, 1],
    [1, 1, 0],
  ], // S
  [
    [1, 1, 0],
    [0, 1, 1],
  ], // Z
];

const COLORS = [
  "bg-cyan-500",
  "bg-yellow-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-red-500",
];

export const TetrisApp: React.FC = () => {
  const [grid, setGrid] = useState<number[][]>(
    Array.from({ length: ROWS }, () => Array(COLS).fill(0)),
  );
  const [currentPiece, setCurrentPiece] = useState<any>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [highScore, setHighScore] = useState(0);
  const [showNewHighScore, setShowNewHighScore] = useState(false);
  const [linesCleared, setLinesCleared] = useState(0);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const { playLoseSound, playClickSound } = useSound();

  // Load high score on mount and difficulty change
  useEffect(() => {
    setHighScore(getTetrisHighScore(difficulty));
  }, [difficulty]);

  const getSpeed = () => {
    switch (difficulty) {
      case "Easy":
        return 800;
      case "Medium":
        return 500;
      case "Hard":
        return 200;
      default:
        return 500;
    }
  };

  const spawnPiece = useCallback(() => {
    const shapeIndex = Math.floor(Math.random() * SHAPES.length);
    const shape = SHAPES[shapeIndex];
    const colorIndex = shapeIndex + 1; // 0 is empty

    setCurrentPiece({ shape, colorIndex });
    setPosition({ x: Math.floor(COLS / 2) - 1, y: 0 });

    // Check collision on spawn
    if (checkCollision(shape, Math.floor(COLS / 2) - 1, 0, grid)) {
      setGameOver(true);
      setIsPlaying(false);
      playLoseSound();
      // Save score when game over
      if (score > 0) {
        saveTetrisScore(score, difficulty);
        if (score > highScore) {
          setShowNewHighScore(true);
          setHighScore(score);
        }
      }
    }
  }, [grid, playLoseSound, score, difficulty, highScore]);

  const checkCollision = (
    shape: number[][],
    x: number,
    y: number,
    currentGrid: number[][],
  ) => {
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const newX = x + c;
          const newY = y + r;

          if (
            newX < 0 ||
            newX >= COLS ||
            newY >= ROWS ||
            (newY >= 0 && currentGrid[newY][newX])
          ) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const mergePiece = () => {
    const newGrid = grid.map((row) => [...row]);
    for (let r = 0; r < currentPiece.shape.length; r++) {
      for (let c = 0; c < currentPiece.shape[r].length; c++) {
        if (currentPiece.shape[r][c]) {
          const newY = position.y + r;
          const newX = position.x + c;
          if (newY >= 0) {
            newGrid[newY][newX] = currentPiece.colorIndex;
          }
        }
      }
    }

    // Clear lines
    let linesClearedNow = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (newGrid[r].every((cell) => cell !== 0)) {
        newGrid.splice(r, 1);
        newGrid.unshift(Array(COLS).fill(0));
        linesClearedNow++;
        r++; // Check same row again
      }
    }

    if (linesClearedNow > 0) {
      setScore((prev) => prev + linesClearedNow * 100);
      setLinesCleared((prev) => prev + linesClearedNow);
      playClickSound();
    }

    setGrid(newGrid);
    spawnPiece();
  };

  const move = (dx: number, dy: number) => {
    if (!currentPiece || gameOver || !isPlaying) return;

    if (
      !checkCollision(
        currentPiece.shape,
        position.x + dx,
        position.y + dy,
        grid,
      )
    ) {
      setPosition((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    } else if (dy > 0) {
      mergePiece();
    }
  };

  const rotate = () => {
    if (!currentPiece || gameOver || !isPlaying) return;

    const rotatedShape = currentPiece.shape[0].map((_: any, index: number) =>
      currentPiece.shape.map((row: any[]) => row[index]).reverse(),
    );

    if (!checkCollision(rotatedShape, position.x, position.y, grid)) {
      setCurrentPiece({ ...currentPiece, shape: rotatedShape });
    }
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isPlaying) return;

      switch (e.key) {
        case "ArrowLeft":
          move(-1, 0);
          break;
        case "ArrowRight":
          move(1, 0);
          break;
        case "ArrowDown":
          move(0, 1);
          break;
        case "ArrowUp":
          rotate();
          break;
        case " ":
          // Hard drop
          let dropY = 0;
          while (
            !checkCollision(
              currentPiece.shape,
              position.x,
              position.y + dropY + 1,
              grid,
            )
          ) {
            dropY++;
          }
          move(0, dropY);
          break;
      }
    },
    [currentPiece, position, grid, isPlaying, gameOver],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (isPlaying && !gameOver) {
      gameLoopRef.current = setInterval(() => {
        move(0, 1);
      }, getSpeed());
    } else {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    }

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [isPlaying, gameOver, currentPiece, position, grid, difficulty]);

  const resetGame = () => {
    setGrid(Array.from({ length: ROWS }, () => Array(COLS).fill(0)));
    setScore(0);
    setLinesCleared(0);
    setGameOver(false);
    setIsPlaying(true);
    setShowNewHighScore(false);
    spawnPiece();
  };

  return (
    <div className="h-full w-full bg-gradient-to-br from-gray-900 via-indigo-900 to-gray-900 flex flex-col items-center justify-center p-2 md:p-4 text-white overflow-auto">
      <h2 className="text-xl md:text-3xl font-bold mb-2 md:mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
        🎮 Tetris
      </h2>

      {/* Score and Controls */}
      <div className="mb-2 md:mb-4 flex flex-col md:flex-row gap-2 md:gap-6 items-center">
        <div className="flex gap-4 md:gap-6">
          <div className="text-center">
            <div className="text-xs text-gray-400">Score</div>
            <div className="text-xl md:text-2xl font-bold text-purple-400">
              {score}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400">High Score</div>
            <div className="text-xl md:text-2xl font-bold text-yellow-400">
              {highScore}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400">Lines</div>
            <div className="text-xl md:text-2xl font-bold text-green-400">
              {linesCleared}
            </div>
          </div>
        </div>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as Difficulty)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm hover:bg-gray-700 transition-colors"
          disabled={isPlaying}>
          <option value="Easy">🐢 Easy</option>
          <option value="Medium">🏃 Medium</option>
          <option value="Hard">🚀 Hard</option>
        </select>
      </div>

      {/* Game Board */}
      <div
        className="relative bg-red-500 border-4 border-purple-700/50 rounded-lg shadow-2xl shadow-purple-500/20"
        style={{
          width: COLS * BLOCK_SIZE,
          height: ROWS * BLOCK_SIZE,
        }}>
        {/* Render Grid */}
        {grid.map((row, r) =>
          row.map((cell, c) => {
            if (cell) {
              return (
                <div
                  key={`${r}-${c}`}
                  className={`absolute border border-black/20 rounded-sm shadow-md ${
                    COLORS[cell - 1]
                  }`}
                  style={{
                    left: c * BLOCK_SIZE,
                    top: r * BLOCK_SIZE,
                    width: BLOCK_SIZE,
                    height: BLOCK_SIZE,
                  }}
                />
              );
            }
            return null;
          }),
        )}

        {/* Render Current Piece */}
        {currentPiece &&
          !gameOver &&
          currentPiece.shape.map((row: number[], r: number) =>
            row.map((cell: number, c: number) => {
              if (cell) {
                return (
                  <div
                    key={`piece-${r}-${c}`}
                    className={`absolute border border-black/20 rounded-sm shadow-lg ${
                      COLORS[currentPiece.colorIndex - 1]
                    } animate-pulse`}
                    style={{
                      left: (position.x + c) * BLOCK_SIZE,
                      top: (position.y + r) * BLOCK_SIZE,
                      width: BLOCK_SIZE,
                      height: BLOCK_SIZE,
                    }}
                  />
                );
              }
              return null;
            }),
          )}

        {/* Game Over Overlay */}
        {gameOver && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center gap-4 animate-in fade-in zoom-in duration-300">
            <h3 className="text-3xl md:text-4xl font-bold text-red-500 drop-shadow-lg">
              Game Over!
            </h3>
            {showNewHighScore && (
              <p className="text-xl text-yellow-400 animate-bounce">
                🎉 New High Score!
              </p>
            )}
            <div className="text-center space-y-2">
              <div>
                <p className="text-gray-400 text-sm">Final Score</p>
                <p className="text-4xl font-bold text-purple-400">{score}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Lines Cleared</p>
                <p className="text-2xl font-bold text-green-400">
                  {linesCleared}
                </p>
              </div>
            </div>
            <button
              onClick={resetGame}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold">
              Play Again
            </button>
          </div>
        )}

        {/* Start Overlay */}
        {!isPlaying && !gameOver && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
            <div className="text-6xl animate-bounce">🎮</div>
            <button
              onClick={resetGame}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold">
              Start Game
            </button>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-2 md:mt-4 text-xs md:text-sm text-gray-400 text-center">
        <p>⬅️ ➡️ Move • ⬆️ Rotate • ⬇️ Soft Drop • Space Hard Drop</p>
        <p className="text-xs text-gray-500 mt-1">
          Clear lines to score points!
        </p>
      </div>
    </div>
  );
};

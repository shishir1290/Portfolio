/** @format */

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSound } from "@/hooks/useSound";

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
    Array.from({ length: ROWS }, () => Array(COLS).fill(0))
  );
  const [currentPiece, setCurrentPiece] = useState<any>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const { playLoseSound, playClickSound } = useSound();

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
    }
  }, [grid, playLoseSound]);

  const checkCollision = (
    shape: number[][],
    x: number,
    y: number,
    currentGrid: number[][]
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
    let linesCleared = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (newGrid[r].every((cell) => cell !== 0)) {
        newGrid.splice(r, 1);
        newGrid.unshift(Array(COLS).fill(0));
        linesCleared++;
        r++; // Check same row again
      }
    }

    if (linesCleared > 0) {
      setScore((prev) => prev + linesCleared * 100);
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
        grid
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
      currentPiece.shape.map((row: any[]) => row[index]).reverse()
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
              grid
            )
          ) {
            dropY++;
          }
          move(0, dropY);
          break;
      }
    },
    [currentPiece, position, grid, isPlaying, gameOver]
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
    setGameOver(false);
    setIsPlaying(true);
    spawnPiece();
  };

  return (
    <div className="h-full w-full bg-gray-900 flex flex-col items-center justify-center p-4 text-white">
      <h2 className="text-2xl font-bold mb-4">Tetris</h2>

      <div className="mb-4 flex gap-4 items-center">
        <div className="text-lg">Score: {score}</div>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as Difficulty)}
          className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm"
          disabled={isPlaying}>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>

      <div
        className="relative bg-black border-2 border-gray-700"
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
                  className={`absolute border border-black/20 ${
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
          })
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
                    className={`absolute border border-black/20 ${
                      COLORS[currentPiece.colorIndex - 1]
                    }`}
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
            })
          )}

        {gameOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
            <h3 className="text-3xl font-bold text-red-500 mb-4">Game Over</h3>
            <button
              onClick={resetGame}
              className="px-6 py-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors">
              Play Again
            </button>
          </div>
        )}

        {!isPlaying && !gameOver && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <button
              onClick={resetGame}
              className="px-6 py-2 bg-green-600 rounded hover:bg-green-700 transition-colors">
              Start Game
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-400 text-center">
        <p>Arrows to Move/Rotate</p>
        <p>Space to Drop</p>
      </div>
    </div>
  );
};

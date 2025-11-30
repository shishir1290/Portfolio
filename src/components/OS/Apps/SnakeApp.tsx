/** @format */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSound } from "@/hooks/useSound";

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Position = { x: number; y: number };
type Difficulty = "Easy" | "Medium" | "Hard";

const GRID_SIZE = 20;
const CELL_SIZE = 20; // px

export const SnakeApp: React.FC = () => {
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Direction>("RIGHT");
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const { playLoseSound, playClickSound } = useSound();

  const getSpeed = () => {
    switch (difficulty) {
      case "Easy":
        return 200;
      case "Medium":
        return 100;
      case "Hard":
        return 50;
      default:
        return 100;
    }
  };

  const generateFood = useCallback((): Position => {
    return {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  }, []);

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood(generateFood());
    setDirection("RIGHT");
    setGameOver(false);
    setScore(0);
    setIsPlaying(true);
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isPlaying) return;

      switch (e.key) {
        case "ArrowUp":
          if (direction !== "DOWN") setDirection("UP");
          break;
        case "ArrowDown":
          if (direction !== "UP") setDirection("DOWN");
          break;
        case "ArrowLeft":
          if (direction !== "RIGHT") setDirection("LEFT");
          break;
        case "ArrowRight":
          if (direction !== "LEFT") setDirection("RIGHT");
          break;
      }
    },
    [direction, isPlaying]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (isPlaying && !gameOver) {
      gameLoopRef.current = setInterval(() => {
        setSnake((prevSnake) => {
          const head = prevSnake[0];
          const newHead = { ...head };

          switch (direction) {
            case "UP":
              newHead.y -= 1;
              break;
            case "DOWN":
              newHead.y += 1;
              break;
            case "LEFT":
              newHead.x -= 1;
              break;
            case "RIGHT":
              newHead.x += 1;
              break;
          }

          // Check collision with walls
          if (
            newHead.x < 0 ||
            newHead.x >= GRID_SIZE ||
            newHead.y < 0 ||
            newHead.y >= GRID_SIZE
          ) {
            setGameOver(true);
            setIsPlaying(false);
            playLoseSound();
            return prevSnake;
          }

          // Check collision with self
          if (
            prevSnake.some(
              (segment) => segment.x === newHead.x && segment.y === newHead.y
            )
          ) {
            setGameOver(true);
            setIsPlaying(false);
            playLoseSound();
            return prevSnake;
          }

          const newSnake = [newHead, ...prevSnake];

          // Check collision with food
          if (newHead.x === food.x && newHead.y === food.y) {
            setScore((prev) => prev + 1);
            setFood(generateFood());
            playClickSound(); // Eat sound
          } else {
            newSnake.pop();
          }

          return newSnake;
        });
      }, getSpeed());
    } else {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    }

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [isPlaying, gameOver, direction, food, difficulty, generateFood]);

  return (
    <div className="h-full w-full bg-gray-900 flex flex-col items-center justify-center p-4 text-white">
      <h2 className="text-2xl font-bold mb-4">Snake Game</h2>

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
          width: GRID_SIZE * CELL_SIZE,
          height: GRID_SIZE * CELL_SIZE,
        }}>
        {snake.map((segment, i) => (
          <div
            key={i}
            className="absolute bg-green-500"
            style={{
              left: segment.x * CELL_SIZE,
              top: segment.y * CELL_SIZE,
              width: CELL_SIZE - 1,
              height: CELL_SIZE - 1,
            }}
          />
        ))}
        <div
          className="absolute bg-red-500 rounded-full"
          style={{
            left: food.x * CELL_SIZE,
            top: food.y * CELL_SIZE,
            width: CELL_SIZE - 1,
            height: CELL_SIZE - 1,
          }}
        />

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

      <p className="mt-4 text-sm text-gray-400">Use Arrow Keys to Move</p>
    </div>
  );
};

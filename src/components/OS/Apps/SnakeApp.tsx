/** @format */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSound } from "@/hooks/useSound";
import { saveSnakeScore, getSnakeHighScore } from "@/utils/highScoreStorage";

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
  const [highScore, setHighScore] = useState(0);
  const [showNewHighScore, setShowNewHighScore] = useState(false);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const { playLoseSound, playClickSound } = useSound();

  // Load high score on mount and difficulty change
  useEffect(() => {
    setHighScore(getSnakeHighScore(difficulty));
  }, [difficulty]);

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
    setShowNewHighScore(false);
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
    [direction, isPlaying],
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
            // Save score when game over
            if (score > 0) {
              saveSnakeScore(score, difficulty);
              if (score > highScore) {
                setShowNewHighScore(true);
                setHighScore(score);
              }
            }
            return prevSnake;
          }

          // Check collision with self
          if (
            prevSnake.some(
              (segment) => segment.x === newHead.x && segment.y === newHead.y,
            )
          ) {
            setGameOver(true);
            setIsPlaying(false);
            playLoseSound();
            // Save score when game over
            if (score > 0) {
              saveSnakeScore(score, difficulty);
              if (score > highScore) {
                setShowNewHighScore(true);
                setHighScore(score);
              }
            }
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
    <div className="h-full w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center p-2 md:p-4 text-white overflow-auto">
      <h2 className="text-xl md:text-3xl font-bold mb-2 md:mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
        🐍 Snake Game
      </h2>

      {/* Score and Controls */}
      <div className="mb-2 md:mb-4 flex flex-col md:flex-row gap-2 md:gap-4 items-center">
        <div className="flex gap-4 md:gap-6">
          <div className="text-center">
            <div className="text-xs text-gray-400">Score</div>
            <div className="text-xl md:text-2xl font-bold text-green-400">
              {score}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400">High Score</div>
            <div className="text-xl md:text-2xl font-bold text-yellow-400">
              {highScore}
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
        className="relative bg-black border-4 border-gray-700 rounded-lg shadow-2xl overflow-hidden"
        style={{
          width: GRID_SIZE * CELL_SIZE,
          height: GRID_SIZE * CELL_SIZE,
        }}>
        {/* Snake */}
        {snake.map((segment, i) => (
          <div
            key={i}
            className={`absolute rounded-sm transition-all ${
              i === 0 ?
                "bg-gradient-to-br from-green-400 to-green-600 shadow-lg"
              : "bg-green-500"
            }`}
            style={{
              left: segment.x * CELL_SIZE,
              top: segment.y * CELL_SIZE,
              width: CELL_SIZE - 1,
              height: CELL_SIZE - 1,
            }}
          />
        ))}
        {/* Food */}
        <div
          className="absolute bg-gradient-to-br from-red-400 to-red-600 rounded-full shadow-lg animate-pulse"
          style={{
            left: food.x * CELL_SIZE,
            top: food.y * CELL_SIZE,
            width: CELL_SIZE - 1,
            height: CELL_SIZE - 1,
          }}
        />

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
            <div className="text-center">
              <p className="text-gray-400 text-sm">Final Score</p>
              <p className="text-4xl font-bold text-green-400">{score}</p>
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
            <div className="text-6xl animate-bounce">🐍</div>
            <button
              onClick={resetGame}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold">
              Start Game
            </button>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-2 md:mt-4 text-xs md:text-sm text-gray-400 text-center">
        <p>🎮 Use Arrow Keys or Swipe to Move</p>
        <p className="text-xs text-gray-500 mt-1">
          Eat the red dots and avoid hitting walls or yourself!
        </p>
      </div>
    </div>
  );
};

/** @format */

import React, { useState } from "react";
import { useSound } from "@/hooks/useSound";

type Choice = "rock" | "paper" | "scissors" | null;
type Difficulty = "Easy" | "Medium" | "Hard";

export const RPSApp: React.FC = () => {
  const [userChoice, setUserChoice] = useState<Choice>(null);
  const [botChoice, setBotChoice] = useState<Choice>(null);
  const [result, setResult] = useState<string | null>(null);
  const [score, setScore] = useState({ user: 0, bot: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [lastUserChoice, setLastUserChoice] = useState<Choice>(null);
  const { playClickSound, playWinSound, playLoseSound } = useSound();

  const choices: Choice[] = ["rock", "paper", "scissors"];

  const getEmoji = (choice: Choice) => {
    switch (choice) {
      case "rock":
        return "🪨";
      case "paper":
        return "📄";
      case "scissors":
        return "✂️";
      default:
        return "❓";
    }
  };

  const getBotMove = (userMove: Choice): Choice => {
    if (difficulty === "Easy") {
      // Completely random
      return choices[Math.floor(Math.random() * choices.length)];
    } else if (difficulty === "Medium") {
      // 30% chance to counter user's last move (if exists), otherwise random
      if (lastUserChoice && Math.random() < 0.3) {
        if (lastUserChoice === "rock") return "paper";
        if (lastUserChoice === "paper") return "scissors";
        return "rock";
      }
      return choices[Math.floor(Math.random() * choices.length)];
    } else {
      // Hard: 60% chance to counter user's last move (predictable user), otherwise random
      if (lastUserChoice && Math.random() < 0.6) {
        if (lastUserChoice === "rock") return "paper";
        if (lastUserChoice === "paper") return "scissors";
        return "rock";
      }
      return choices[Math.floor(Math.random() * choices.length)];
    }
  };

  const playGame = (choice: Choice) => {
    setIsPlaying(true);
    setUserChoice(choice);
    setBotChoice(null);
    setResult(null);

    // Simulate bot thinking
    setTimeout(() => {
      const botMove = getBotMove(choice);
      setBotChoice(botMove);
      determineWinner(choice, botMove);
      setIsPlaying(false);
      setLastUserChoice(choice);
    }, 1000);
  };

  const determineWinner = (user: Choice, bot: Choice) => {
    if (user === bot) {
      setResult("Draw!");
    } else if (
      (user === "rock" && bot === "scissors") ||
      (user === "paper" && bot === "rock") ||
      (user === "scissors" && bot === "paper")
    ) {
      setResult("You Win!");
      setScore((prev) => ({ ...prev, user: prev.user + 1 }));
      playWinSound();
    } else {
      setResult("Bot Wins!");
      setScore((prev) => ({ ...prev, bot: prev.bot + 1 }));
      playLoseSound();
    }
  };

  return (
    <div className="h-full w-full bg-white dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Rock Paper Scissors
      </h2>

      {/* Difficulty Selector */}
      <div className="mb-8 flex gap-2">
        {(["Easy", "Medium", "Hard"] as Difficulty[]).map((level) => (
          <button
            key={level}
            onClick={() => setDifficulty(level)}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              difficulty === level
                ? "bg-blue-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}>
            {level}
          </button>
        ))}
      </div>

      {/* Scoreboard */}
      <div className="flex gap-8 mb-8 text-lg font-medium text-gray-700 dark:text-gray-300">
        <div className="text-center">
          <div className="text-sm text-gray-500">You</div>
          <div className="text-2xl text-blue-500">{score.user}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-500">Bot</div>
          <div className="text-2xl text-red-500">{score.bot}</div>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex items-center gap-8 mb-12">
        <div className="text-center">
          <div
            className={`w-24 h-24 flex items-center justify-center text-5xl bg-blue-100 dark:bg-blue-900 rounded-full border-4 border-blue-500 transition-transform ${
              isPlaying ? "animate-bounce" : ""
            }`}>
            {getEmoji(userChoice)}
          </div>
          <p className="mt-2 text-sm text-gray-500">You</p>
        </div>

        <div className="text-2xl font-bold text-gray-400">VS</div>

        <div className="text-center">
          <div
            className={`w-24 h-24 flex items-center justify-center text-5xl bg-red-100 dark:bg-red-900 rounded-full border-4 border-red-500 transition-transform ${
              isPlaying ? "animate-bounce" : ""
            }`}>
            {getEmoji(botChoice)}
          </div>
          <p className="mt-2 text-sm text-gray-500">Bot</p>
        </div>
      </div>

      {/* Result */}
      <div className="h-8 mb-8">
        {result && (
          <div
            className={`text-xl font-bold ${
              result === "You Win!"
                ? "text-green-500"
                : result === "Bot Wins!"
                ? "text-red-500"
                : "text-gray-500"
            }`}>
            {result}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        {choices.map((choice) => (
          <button
            key={choice}
            onClick={() => playGame(choice)}
            disabled={isPlaying}
            className="w-16 h-16 flex items-center justify-center text-3xl bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-gray-200 dark:border-gray-700">
            {getEmoji(choice)}
          </button>
        ))}
      </div>
    </div>
  );
};

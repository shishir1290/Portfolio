/** @format */

import React, { useState } from "react";
import { useSound } from "@/hooks/useSound";
import { updateRPSStats, getRPSStats } from "@/utils/highScoreStorage";

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
  const [stats, setStats] = useState(getRPSStats());
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
      updateRPSStats("draw");
    } else if (
      (user === "rock" && bot === "scissors") ||
      (user === "paper" && bot === "rock") ||
      (user === "scissors" && bot === "paper")
    ) {
      setResult("You Win!");
      setScore((prev) => ({ ...prev, user: prev.user + 1 }));
      updateRPSStats("win");
      playWinSound();
    } else {
      setResult("Bot Wins!");
      setScore((prev) => ({ ...prev, bot: prev.bot + 1 }));
      updateRPSStats("loss");
      playLoseSound();
    }
    setStats(getRPSStats());
  };

  return (
    <div className="h-full w-full bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex flex-col items-center justify-center p-2 md:p-4 overflow-auto">
      <h2 className="text-xl md:text-3xl font-bold mb-2 md:mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-600">
        ✊ Rock Paper Scissors ✂️
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
      <div className="mb-3 md:mb-6 flex gap-2">
        {(["Easy", "Medium", "Hard"] as Difficulty[]).map((level) => (
          <button
            key={level}
            onClick={() => setDifficulty(level)}
            className={`px-3 py-1.5 rounded-lg text-xs md:text-sm transition-all transform hover:scale-105 ${
              difficulty === level ?
                "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}>
            {level === "Easy" && "🐢 "}
            {level === "Medium" && "🏃 "}
            {level === "Hard" && "🚀 "}
            {level}
          </button>
        ))}
      </div>

      {/* Scoreboard */}
      <div className="flex gap-6 md:gap-10 mb-6 md:mb-8 text-base md:text-lg font-medium text-gray-300">
        <div className="text-center">
          <div className="text-xs md:text-sm text-gray-500">You</div>
          <div className="text-2xl md:text-3xl text-blue-400 font-bold">
            {score.user}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs md:text-sm text-gray-500">Bot</div>
          <div className="text-2xl md:text-3xl text-red-400 font-bold">
            {score.bot}
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex items-center gap-4 md:gap-8 mb-8 md:mb-12">
        <div className="text-center">
          <div
            className={`w-20 h-20 md:w-28 md:h-28 flex items-center justify-center text-4xl md:text-6xl bg-gradient-to-br from-blue-500 to-blue-600 rounded-full border-4 border-blue-400 shadow-2xl transition-all ${
              isPlaying ? "animate-bounce" : ""
            }`}>
            {getEmoji(userChoice)}
          </div>
          <p className="mt-2 text-xs md:text-sm text-gray-400 font-semibold">
            You
          </p>
        </div>

        <div className="text-xl md:text-3xl font-bold text-yellow-400 animate-pulse">
          VS
        </div>

        <div className="text-center">
          <div
            className={`w-20 h-20 md:w-28 md:h-28 flex items-center justify-center text-4xl md:text-6xl bg-gradient-to-br from-red-500 to-red-600 rounded-full border-4 border-red-400 shadow-2xl transition-all ${
              isPlaying ? "animate-bounce" : ""
            }`}>
            {getEmoji(botChoice)}
          </div>
          <p className="mt-2 text-xs md:text-sm text-gray-400 font-semibold">
            Bot
          </p>
        </div>
      </div>

      {/* Result */}
      <div className="h-8 md:h-10 mb-6 md:mb-8">
        {result && (
          <div
            className={`text-lg md:text-2xl font-bold animate-in zoom-in duration-300 ${
              result === "You Win!" ? "text-green-400"
              : result === "Bot Wins!" ? "text-red-400"
              : "text-yellow-400"
            }`}>
            {result === "You Win!" && "🎉 "}
            {result}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-3 md:gap-4">
        {choices.map((choice) => (
          <button
            key={choice}
            onClick={() => playGame(choice)}
            disabled={isPlaying}
            className="w-14 h-14 md:w-20 md:h-20 flex items-center justify-center text-3xl md:text-4xl bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl hover:from-gray-700 hover:to-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all border-2 border-gray-700 hover:border-gray-600 shadow-lg hover:shadow-xl transform hover:scale-110 active:scale-95">
            {getEmoji(choice)}
          </button>
        ))}
      </div>

      <p className="mt-4 md:mt-6 text-xs md:text-sm text-gray-400 text-center">
        🎮 Choose your move to play!
      </p>
    </div>
  );
};

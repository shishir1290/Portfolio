/** @format */

import React, { useState, useEffect } from "react";

interface BootScreenProps {
  onBootComplete: () => void;
}

export const BootScreen: React.FC<BootScreenProps> = ({ onBootComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  const bootMessages = [
    "Initializing system...",
    "Loading core modules...",
    "Starting services...",
    "Loading user profile...",
    "Preparing desktop environment...",
    "Almost ready...",
  ];

  useEffect(() => {
    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    // Boot messages
    const messageInterval = setInterval(() => {
      setCurrentMessage((prev) => {
        const currentIndex = bootMessages.indexOf(prev);
        const nextIndex = currentIndex + 1;
        if (nextIndex >= bootMessages.length) {
          clearInterval(messageInterval);
          return prev;
        }
        return bootMessages[nextIndex];
      });
    }, 500);

    // Set initial message
    setCurrentMessage(bootMessages[0]);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    };
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      setTimeout(() => {
        setIsComplete(true);
        setTimeout(() => {
          onBootComplete();
        }, 500);
      }, 300);
    }
  }, [progress, onBootComplete]);

  return (
    <div
      className={`fixed inset-0 z-[99999] bg-gradient-to-br from-[#0a0a1a] via-[#1a1a2e] to-[#16213e] flex items-center justify-center transition-opacity duration-500 ${
        isComplete ? "opacity-0" : "opacity-100"
      }`}>
      <div className="text-center space-y-8 px-8">
        {/* Logo/Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl animate-pulse">
              <span className="text-5xl">💼</span>
            </div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 blur-xl opacity-50 animate-pulse"></div>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-wider">
            Portfolio OS
          </h1>
          <p className="text-blue-300 text-sm md:text-base">Version 1.0.0</p>
        </div>

        {/* Loading Message */}
        <div className="h-8">
          <p className="text-gray-300 text-sm md:text-base animate-pulse">
            {currentMessage}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-md mx-auto space-y-2">
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300 ease-out rounded-full"
              style={{ width: `${progress}%` }}></div>
          </div>
          <p className="text-gray-400 text-xs text-right">{progress}%</p>
        </div>

        {/* Spinning loader */}
        <div className="flex justify-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>

        {/* Footer */}
        <div className="pt-8">
          <p className="text-gray-500 text-xs">
            © 2024 MD Sadmanur Islam Shishir. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

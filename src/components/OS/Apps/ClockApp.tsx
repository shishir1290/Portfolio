/** @format */

import React, { useState, useEffect } from "react";

export const ClockApp: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  // Analog clock calculations
  const secondDegrees = (seconds / 60) * 360 + 90;
  const minuteDegrees = (minutes / 60) * 360 + (seconds / 60) * 6 + 90;
  const hourDegrees = (hours / 12) * 360 + (minutes / 60) * 30 + 90;

  return (
    <div className="h-full w-full bg-white dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      {/* Analog Clock */}
      <div className="relative w-64 h-64 border-8 border-gray-800 dark:border-gray-200 rounded-full mb-8 shadow-xl bg-white dark:bg-gray-800">
        {/* Clock Face Markers */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-4 bg-gray-400 origin-bottom left-1/2 top-2"
            style={{
              transform: `translateX(-50%) rotate(${i * 30}deg)`,
              transformOrigin: "50% 112px", // Radius - marker height
            }}
          />
        ))}

        {/* Hands */}
        <div
          className="absolute top-1/2 left-1/2 w-24 h-1 bg-gray-800 dark:bg-white origin-left rounded-full"
          style={{
            transform: `rotate(${hourDegrees}deg)`,
            top: "calc(50% - 2px)",
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-28 h-1 bg-gray-600 dark:bg-gray-300 origin-left rounded-full"
          style={{
            transform: `rotate(${minuteDegrees}deg)`,
            top: "calc(50% - 2px)",
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-28 h-0.5 bg-red-500 origin-left rounded-full"
          style={{
            transform: `rotate(${secondDegrees}deg)`,
            top: "calc(50% - 1px)",
          }}
        />

        {/* Center Dot */}
        <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-red-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 border-2 border-white dark:border-gray-900" />
      </div>

      {/* Digital Clock */}
      <div className="text-center">
        <h2 className="text-5xl font-mono font-bold text-gray-900 dark:text-white mb-2">
          {time.toLocaleTimeString([], { hour12: false })}
        </h2>
        <p className="text-xl text-gray-500 dark:text-gray-400">
          {time.toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>
    </div>
  );
};

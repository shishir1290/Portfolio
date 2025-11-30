/** @format */

import React, { useEffect, useState } from "react";
import { useOS } from "@/contexts/OSContext";

export const ShutdownScreen: React.FC = () => {
  const { turnOn } = useOS();
  const [stage, setStage] = useState<"shutting-down" | "off">("shutting-down");

  useEffect(() => {
    const timer = setTimeout(() => {
      setStage("off");
    }, 3000); // 3 seconds shutdown animation

    return () => clearTimeout(timer);
  }, []);

  if (stage === "shutting-down") {
    return (
      <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <h2 className="text-2xl font-light">Shutting down...</h2>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center text-gray-500">
      <div className="text-center">
        <p className="mb-8 text-sm">System is powered off</p>
        <button
          onClick={turnOn}
          className="px-6 py-3 rounded-full border border-gray-700 hover:border-gray-500 hover:text-gray-300 transition-all duration-300 flex items-center gap-2 group">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 group-hover:text-green-400 transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          <span>Turn On</span>
        </button>
      </div>
    </div>
  );
};

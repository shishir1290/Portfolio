/** @format */

import React from "react";
import { useOS } from "@/contexts/OSContext";

export const SettingsApp: React.FC = () => {
  const { theme, setTheme, accentColor, setAccentColor } = useOS();

  const colors = [
    "#3b82f6", // Blue
    "#ef4444", // Red
    "#10b981", // Green
    "#f59e0b", // Yellow
    "#8b5cf6", // Purple
    "#ec4899", // Pink
    "#6366f1", // Indigo
    "#14b8a6", // Teal
  ];

  return (
    <div className="h-full w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-6 overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6">Settings</h2>

      <div className="space-y-8">
        {/* Theme Section */}
        <section>
          <h3 className="text-lg font-semibold mb-4">Appearance</h3>
          <div className="flex gap-4">
            <button
              onClick={() => setTheme("light")}
              className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                theme === "light"
                  ? "border-blue-500 bg-gray-100"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
              }`}>
              <div className="h-20 bg-white rounded mb-2 border border-gray-200 shadow-sm"></div>
              <span className="font-medium">Light</span>
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                theme === "dark"
                  ? "border-blue-500 bg-gray-800"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
              }`}>
              <div className="h-20 bg-gray-900 rounded mb-2 border border-gray-700 shadow-sm"></div>
              <span className="font-medium">Dark</span>
            </button>
          </div>
        </section>

        {/* Accent Color Section */}
        <section>
          <h3 className="text-lg font-semibold mb-4">Accent Color</h3>
          <div className="grid grid-cols-4 gap-4">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setAccentColor(color)}
                className={`h-12 rounded-lg transition-transform hover:scale-105 focus:outline-none ring-2 ring-offset-2 dark:ring-offset-gray-900 ${
                  accentColor === color ? "ring-gray-400" : "ring-transparent"
                }`}
                style={{ backgroundColor: color }}
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>
        </section>

        {/* About Section */}
        <section className="pt-8 border-t border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold mb-2">About System</h3>
          <p className="text-gray-600 dark:text-gray-400">
            OS Portfolio v2.0
            <br />
            Built with React, TypeScript, and Tailwind CSS.
          </p>
        </section>
      </div>
    </div>
  );
};

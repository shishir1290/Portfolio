/** @format */

import React, { useState, useEffect } from "react";

export const NotesApp: React.FC = () => {
  const [note, setNote] = useState("");

  useEffect(() => {
    const savedNote = localStorage.getItem("os-notes");
    if (savedNote) {
      setNote(savedNote);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setNote(newValue);
    localStorage.setItem("os-notes", newValue);
  };

  return (
    <div className="h-full w-full bg-yellow-50 dark:bg-gray-800 flex flex-col">
      <div className="bg-yellow-200 dark:bg-gray-700 p-2 border-b border-yellow-300 dark:border-gray-600 flex justify-between items-center">
        <span className="font-medium text-gray-700 dark:text-gray-200">
          My Notes
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Auto-saved
        </span>
      </div>
      <textarea
        className="flex-1 w-full p-4 bg-transparent resize-none focus:outline-none text-gray-800 dark:text-gray-200 font-mono text-lg leading-relaxed"
        value={note}
        onChange={handleChange}
        placeholder="Type your notes here..."
      />
    </div>
  );
};

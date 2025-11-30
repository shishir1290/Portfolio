/** @format */

import React, { useState } from "react";

export const CalculatorApp: React.FC = () => {
  const [display, setDisplay] = useState("0");
  const [equation, setEquation] = useState("");
  const [isNewNumber, setIsNewNumber] = useState(true);

  const handleNumber = (num: string) => {
    if (isNewNumber) {
      setDisplay(num);
      setIsNewNumber(false);
    } else {
      setDisplay(display === "0" ? num : display + num);
    }
  };

  const handleOperator = (op: string) => {
    setEquation(display + " " + op + " ");
    setIsNewNumber(true);
  };

  const handleEqual = () => {
    try {
      // eslint-disable-next-line no-eval
      const result = eval(equation + display);
      setDisplay(String(result));
      setEquation("");
      setIsNewNumber(true);
    } catch (error) {
      setDisplay("Error");
      setEquation("");
      setIsNewNumber(true);
    }
  };

  const handleClear = () => {
    setDisplay("0");
    setEquation("");
    setIsNewNumber(true);
  };

  const buttons = [
    { label: "C", type: "action", onClick: handleClear },
    { label: "/", type: "operator", onClick: () => handleOperator("/") },
    { label: "*", type: "operator", onClick: () => handleOperator("*") },
    { label: "-", type: "operator", onClick: () => handleOperator("-") },
    { label: "7", type: "number", onClick: () => handleNumber("7") },
    { label: "8", type: "number", onClick: () => handleNumber("8") },
    { label: "9", type: "number", onClick: () => handleNumber("9") },
    { label: "+", type: "operator", onClick: () => handleOperator("+") },
    { label: "4", type: "number", onClick: () => handleNumber("4") },
    { label: "5", type: "number", onClick: () => handleNumber("5") },
    { label: "6", type: "number", onClick: () => handleNumber("6") },
    { label: "=", type: "equal", onClick: handleEqual },
    { label: "1", type: "number", onClick: () => handleNumber("1") },
    { label: "2", type: "number", onClick: () => handleNumber("2") },
    { label: "3", type: "number", onClick: () => handleNumber("3") },
    { label: "0", type: "number", onClick: () => handleNumber("0") },
    { label: ".", type: "number", onClick: () => handleNumber(".") },
  ];

  return (
    <div className="h-full w-full bg-gray-900 p-4 flex flex-col">
      {/* Display */}
      <div className="bg-gray-800 rounded-lg p-4 mb-4 text-right">
        <div className="text-gray-400 text-sm h-6">{equation}</div>
        <div className="text-white text-4xl font-mono truncate">{display}</div>
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-4 gap-2 flex-1">
        {buttons.map((btn, i) => (
          <button
            key={i}
            onClick={btn.onClick}
            className={`rounded-lg text-xl font-medium transition-colors ${
              btn.type === "operator"
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : btn.type === "equal"
                ? "bg-green-600 text-white hover:bg-green-700 row-span-2"
                : btn.type === "action"
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-gray-700 text-white hover:bg-gray-600"
            } ${btn.label === "0" ? "col-span-2" : ""}`}>
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
};

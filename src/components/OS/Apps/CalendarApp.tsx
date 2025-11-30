/** @format */

import React, { useState, useEffect } from "react";

type Event = {
  date: string; // YYYY-MM-DD
  title: string;
};

export const CalendarApp: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [newEventTitle, setNewEventTitle] = useState("");

  useEffect(() => {
    const savedEvents = localStorage.getItem("os-calendar-events");
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    }
  }, []);

  const saveEvents = (updatedEvents: Event[]) => {
    setEvents(updatedEvents);
    localStorage.setItem("os-calendar-events", JSON.stringify(updatedEvents));
  };

  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const prevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const formatDateKey = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const handleDateClick = (day: number) => {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    setSelectedDate(date);
    setNewEventTitle("");
  };

  const addEvent = () => {
    if (!selectedDate || !newEventTitle.trim()) return;
    const dateKey = formatDateKey(selectedDate);
    const newEvent = { date: dateKey, title: newEventTitle };
    saveEvents([...events, newEvent]);
    setNewEventTitle("");
  };

  const deleteEvent = (index: number) => {
    const dateKey = formatDateKey(selectedDate!);
    const dayEvents = events.filter((e) => e.date === dateKey);
    const eventToDelete = dayEvents[index];
    const updatedEvents = events.filter((e) => e !== eventToDelete);
    saveEvents(updatedEvents);
  };

  const renderCalendar = () => {
    const days = [];
    const totalDays = daysInMonth(currentDate);
    const startDay = firstDayOfMonth(currentDate);

    // Empty cells for previous month
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }

    // Days of the month
    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        i
      );
      const isToday = new Date().toDateString() === date.toDateString();
      const isSelected = selectedDate?.toDateString() === date.toDateString();
      const dateKey = formatDateKey(date);
      const hasEvents = events.some((e) => e.date === dateKey);

      days.push(
        <button
          key={i}
          onClick={() => handleDateClick(i)}
          className={`h-10 w-10 rounded-full flex items-center justify-center text-sm relative hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
            isToday
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : isSelected
              ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300"
              : "text-gray-700 dark:text-gray-300"
          }`}>
          {i}
          {hasEvents && (
            <div className="absolute bottom-1 w-1 h-1 bg-red-500 rounded-full"></div>
          )}
        </button>
      );
    }

    return days;
  };

  const getSelectedDateEvents = () => {
    if (!selectedDate) return [];
    const dateKey = formatDateKey(selectedDate);
    return events.filter((e) => e.date === dateKey);
  };

  return (
    <div className="h-full w-full bg-white dark:bg-gray-900 flex flex-col p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={prevMonth}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
          ◀
        </button>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {currentDate.toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </h2>
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
          ▶
        </button>
      </div>

      {/* Days Header */}
      <div className="grid grid-cols-7 gap-1 mb-2 text-center text-xs font-bold text-gray-500 uppercase">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 justify-items-center mb-4">
        {renderCalendar()}
      </div>

      {/* Events Section */}
      <div className="flex-1 border-t border-gray-200 dark:border-gray-700 pt-4 overflow-y-auto">
        <h3 className="text-sm font-bold text-gray-500 mb-2">
          {selectedDate
            ? selectedDate.toLocaleDateString()
            : "Select a date to view events"}
        </h3>

        {selectedDate && (
          <div className="mb-4 flex gap-2">
            <input
              type="text"
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              placeholder="Add event..."
              className="flex-1 px-3 py-1 text-sm border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              onKeyDown={(e) => e.key === "Enter" && addEvent()}
            />
            <button
              onClick={addEvent}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600">
              Add
            </button>
          </div>
        )}

        <ul className="space-y-2">
          {getSelectedDateEvents().map((event, index) => (
            <li
              key={index}
              className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-2 rounded text-sm text-gray-700 dark:text-gray-300">
              <span>{event.title}</span>
              <button
                onClick={() => deleteEvent(index)}
                className="text-red-500 hover:text-red-700">
                ✕
              </button>
            </li>
          ))}
          {selectedDate && getSelectedDateEvents().length === 0 && (
            <li className="text-gray-400 text-xs italic">No events</li>
          )}
        </ul>
      </div>
    </div>
  );
};

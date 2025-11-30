/** @format */

import React, { useEffect, useRef } from "react";
import { useOS } from "@/contexts/OSContext";
import { useSearch } from "@/hooks/useSearch";
import { appRegistry } from "@/utils/appRegistry";

export const SearchBar: React.FC = () => {
  const { isSearchOpen, setSearchOpen, openWindow } = useOS();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleOpenApp = (appId: string) => {
    const app = appRegistry.find((a) => a.id === appId);
    if (app) {
      openWindow(appId, app.name, app.defaultSize);
      setSearchOpen(false);
      setQuery("");
    }
  };

  const { query, setQuery, results, hasResults } = useSearch(handleOpenApp);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleBackdropClick = () => {
    setSearchOpen(false);
    setQuery("");
  };

  const handleResultClick = (action: () => void) => {
    action();
    setSearchOpen(false);
    setQuery("");
  };

  if (!isSearchOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[10000]"
        onClick={handleBackdropClick}
      />

      {/* Search Results */}
      <div className="os-search-results">
        {/* Search Input */}
        <div className="p-4 border-b border-white/10">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search apps, projects, skills..."
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/60 outline-none focus:bg-white/15 focus:border-white/40 transition-all"
          />
        </div>

        {/* Results List */}
        <div className="os-search-results-list">
          {!query.trim() && (
            <div className="p-8 text-center text-white/60">
              <p>Type to search through apps, projects, and skills</p>
            </div>
          )}

          {query.trim() && !hasResults && (
            <div className="p-8 text-center text-white/60">
              <p>No results found for "{query}"</p>
            </div>
          )}

          {hasResults &&
            results.map((result, index) => (
              <div
                key={index}
                className="os-search-result-item"
                onClick={() => handleResultClick(result.action)}>
                <div className="os-search-result-icon">
                  {result.icon || "📱"}
                </div>
                <div className="os-search-result-content">
                  <h4 className="os-search-result-title">{result.title}</h4>
                  <p className="os-search-result-desc">{result.description}</p>
                </div>
                <div className="text-white/40 text-xs uppercase">
                  {result.type}
                </div>
              </div>
            ))}
        </div>

        {/* Footer Hint */}
        {hasResults && (
          <div className="p-3 border-t border-white/10 text-center text-white/40 text-xs">
            Press Enter to open first result
          </div>
        )}
      </div>
    </>
  );
};

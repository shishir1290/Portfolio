/** @format */

import { useState, useMemo } from "react";
import { appRegistry, AppMetadata } from "@/utils/appRegistry";
import { projects } from "@/components/JSON/projects";
import { skills } from "@/components/JSON/skills";

export interface SearchResult {
  type: "app" | "project" | "skill" | "content";
  title: string;
  description: string;
  action: () => void;
  icon?: string;
}

export const useSearch = (onOpenApp?: (appId: string) => void) => {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!query.trim()) return [];

    const lowerQuery = query.toLowerCase();
    const searchResults: SearchResult[] = [];

    // Search apps
    appRegistry.forEach((app) => {
      const nameMatch = app.name.toLowerCase().includes(lowerQuery);
      const keywordMatch = app.searchKeywords.some((k) =>
        k.toLowerCase().includes(lowerQuery)
      );
      const descMatch = app.description.toLowerCase().includes(lowerQuery);

      if (nameMatch || keywordMatch || descMatch) {
        searchResults.push({
          type: "app",
          title: app.name,
          description: app.description,
          icon: app.icon,
          action: () => onOpenApp?.(app.id),
        });
      }
    });

    // Search projects
    projects.forEach((project) => {
      const titleMatch = project.title.toLowerCase().includes(lowerQuery);
      const descMatch = project.description.toLowerCase().includes(lowerQuery);

      if (titleMatch || descMatch) {
        searchResults.push({
          type: "project",
          title: project.title,
          description: project.description,
          icon: "💼",
          action: () => onOpenApp?.("projects"),
        });
      }
    });

    // Search skills
    skills.forEach((skill) => {
      const labelMatch = skill.label.toLowerCase().includes(lowerQuery);

      if (labelMatch) {
        searchResults.push({
          type: "skill",
          title: skill.label,
          description: "Technical skill",
          icon: "⚡",
          action: () => onOpenApp?.("skills"),
        });
      }
    });

    return searchResults.slice(0, 10); // Limit to 10 results
  }, [query, onOpenApp]);

  return {
    query,
    setQuery,
    results,
    hasResults: results.length > 0,
  };
};

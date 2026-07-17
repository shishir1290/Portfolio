export function getYearsExperience(startDate: Date = new Date(2024, 8, 1)): string {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - startDate.getTime());
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  const diffYears = diffDays / 365.25;
  return `${diffYears.toFixed(1)}+`;
}

export function getExperienceDuration(startDate: Date = new Date(2024, 8, 1), endDate?: Date): string {
  const end = endDate || new Date();
  let years = end.getFullYear() - startDate.getFullYear();
  let months = end.getMonth() - startDate.getMonth();
  if (end.getDate() < startDate.getDate()) months--;
  if (months < 0) {
    years--;
    months += 12;
  }
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} Year${years > 1 ? "s" : ""}`);
  if (months > 0) parts.push(`${months} Month${months > 1 ? "s" : ""}`);
  return parts.length > 0 ? parts.join(" ") : "< 1 Month";
}

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Deterministically map a string to a readable HSL color.
 * Returns a CSS hsl(...) string.
 */
export function stringToHslColor(str = "", s = 65, l = 55) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    // Simple string hash
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32bit integer
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, ${s}%, ${l}%)`;
}

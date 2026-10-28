/**
 * Theme choice for the whole site. With nothing stored the site follows the operating system;
 * once the visitor uses the toggle, their choice is kept in this browser (localStorage) and
 * applied as data-theme on <html>, which the CSS tokens already understand.
 */

export type Theme = "light" | "dark";

const KEY = "theme";
const EVENT = "theme-change";

/**
 * Runs in <head> before the first paint, so a stored dark choice never flashes light.
 * A constant string with no user input; storage errors (private windows) are ignored.
 */
export const themeInitScript = `try{var t=localStorage.getItem("${KEY}");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}`;

/** The theme on screen now: the forced one if any, otherwise the OS preference. */
export function currentTheme(): Theme {
  const forced = document.documentElement.getAttribute("data-theme");
  if (forced === "light" || forced === "dark") return forced;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function setTheme(theme: Theme): void {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    window.localStorage.setItem(KEY, theme);
  } catch {
    // Storage is unavailable: the choice lasts until the page is closed.
  }
  window.dispatchEvent(new Event(EVENT));
}

/** Notifies on a toggle in this tab and on OS preference changes. */
export function subscribeTheme(onChange: () => void): () => void {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  window.addEventListener(EVENT, onChange);
  media.addEventListener("change", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    media.removeEventListener("change", onChange);
  };
}

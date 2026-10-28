"use client";

import { useEffect, useRef, useState } from "react";

type CopyState = "idle" | "copied" | "failed";

interface CopyButtonProps {
  /** The text to copy, or a function that reads it at click time (e.g. the page URL). */
  value: string | (() => string);
  /** Button text before copying. */
  label?: string;
  /** Read out to screen readers on success. */
  successMessage?: string;
  /** "md" is the larger button used outside code blocks. */
  size?: "sm" | "md";
}

/** Fallback for pages served without the async Clipboard API (e.g. plain http on a LAN). */
function legacyCopy(text: string): boolean {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    document.body.removeChild(area);
  }
}

export function CopyButton({
  value,
  label = "Copy code",
  successMessage = "Copied to clipboard",
  size = "sm",
}: CopyButtonProps) {
  const [state, setState] = useState<CopyState>("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const buttonText: Record<CopyState, string> = {
    idle: label,
    copied: "Copied",
    failed: "Copy failed",
  };
  const announcement: Record<CopyState, string> = {
    idle: "",
    copied: successMessage,
    failed: "Could not copy",
  };

  async function copy() {
    const text = typeof value === "function" ? value() : value;
    let ok: boolean;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
      ok = legacyCopy(text);
    }
    setState(ok ? "copied" : "failed");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 2000);
  }

  return (
    <>
      <button
        type="button"
        onClick={copy}
        className={`touch-target inline-flex min-w-24 items-center justify-center rounded-panel border border-rule bg-panel font-sans font-medium text-ink transition-colors hover:border-ink hover:bg-tint ${
          size === "md" ? "h-9 px-4 text-ui" : "h-8 px-3 text-xs"
        }`}
      >
        {buttonText[state]}
      </button>
      <span role="status" className="sr-only">
        {announcement[state]}
      </span>
    </>
  );
}

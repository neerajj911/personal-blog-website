import { useState } from "react";

/**
 * A number that goes up each time a form action returns a new state.
 *
 * React resets an uncontrolled form after its action finishes, but it only refreshes the
 * defaultValue of text inputs afterwards, not of <select>s. Using this as the form's `key`
 * remounts the fields so every one of them, selects included, shows what was just submitted.
 */
export function useFormVersion(state: unknown): number {
  const [seen, setSeen] = useState(state);
  const [version, setVersion] = useState(0);
  if (seen !== state) {
    setSeen(state);
    setVersion((current) => current + 1);
  }
  return version;
}

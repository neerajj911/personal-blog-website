import {
  createCssVariablesTheme,
  createHighlighterCore,
  type HighlighterCore,
  type ThemedToken,
} from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import { bundledLanguages } from "shiki/langs";

export const codeLanguages = [
  "sql",
  "dart",
  "typescript",
  "javascript",
  "json",
  "bash",
  "text",
] as const;

export type CodeLanguage = (typeof codeLanguages)[number];

// Colours come from CSS variables (--shiki-token-*, set in globals.css), so one
// tokenisation serves both the light and the dark theme.
const theme = createCssVariablesTheme({ name: "site", variablePrefix: "--shiki-" });

let highlighter: Promise<HighlighterCore> | undefined;

function getHighlighter(): Promise<HighlighterCore> {
  highlighter ??= createHighlighterCore({
    themes: [theme],
    langs: [
      bundledLanguages.sql,
      bundledLanguages.dart,
      bundledLanguages.typescript,
      bundledLanguages.javascript,
      bundledLanguages.json,
      bundledLanguages.bash,
    ],
    engine: createJavaScriptRegexEngine(),
  });
  return highlighter;
}

/** Splits code into lines of coloured tokens. Runs on the server only. */
export async function tokenize(
  code: string,
  lang: CodeLanguage,
): Promise<ThemedToken[][]> {
  if (lang === "text") {
    return code.split("\n").map((line) => [{ content: line, offset: 0 }]);
  }
  const hl = await getHighlighter();
  return hl.codeToTokensBase(code, { lang, theme: "site" });
}

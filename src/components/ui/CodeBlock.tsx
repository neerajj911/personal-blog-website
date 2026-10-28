import type { ThemedToken } from "shiki/core";
import { tokenize, type CodeLanguage } from "@/lib/highlight";
import { cn } from "@/lib/cn";
import { CopyButton } from "./CopyButton";

// Shiki encodes font styles as bit flags; 1 is italic.
const FONT_STYLE_ITALIC = 1;
const COMMENT_COLOR = "var(--shiki-token-comment)";

/** The PDF sets comments in italics; the css-variables theme does not, so mark them here. */
function isItalic(token: ThemedToken): boolean {
  return (
    token.color === COMMENT_COLOR || ((token.fontStyle ?? 0) & FONT_STYLE_ITALIC) !== 0
  );
}

interface CodeBlockProps {
  code: string;
  language: CodeLanguage;
  /** Text in the header bar. Defaults to the language name. */
  label?: string;
  className?: string;
}

const languageLabels: Record<CodeLanguage, string> = {
  sql: "SQL",
  dart: "Dart",
  typescript: "TypeScript",
  javascript: "JavaScript",
  json: "JSON",
  bash: "Shell",
  text: "Text",
};

/** Syntax-highlighted code with a header bar and a copy button. Highlighting runs on the server. */
export async function CodeBlock({ code, language, label, className }: CodeBlockProps) {
  const trimmed = code.replace(/\n+$/, "");
  const lines = await tokenize(trimmed, language);
  const title = label ?? languageLabels[language];

  return (
    <div
      className={cn(
        "overflow-hidden rounded-panel border border-rule bg-code",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-4 border-b border-rule bg-tint px-4 py-2">
        <span className="font-mono text-xs uppercase tracking-[0.06em] text-muted">
          {title}
        </span>
        <CopyButton
          value={trimmed}
          label="Copy code"
          successMessage="Code copied to clipboard"
        />
      </div>
      <pre
        tabIndex={0}
        role="region"
        aria-label={`${title} code`}
        className="overflow-x-auto p-4 font-mono text-mono text-ink"
      >
        <code>
          {lines.map((line, i) => (
            <span key={i}>
              {line.map((token, j) => (
                <span
                  key={j}
                  style={{
                    color: token.color,
                    fontStyle: isItalic(token) ? "italic" : undefined,
                  }}
                >
                  {token.content}
                </span>
              ))}
              {i < lines.length - 1 ? "\n" : null}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}

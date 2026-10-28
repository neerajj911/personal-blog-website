import type { Metadata } from "next";
import { Specimens } from "./Specimens";

export const metadata: Metadata = {
  title: "Design system",
  // A working reference for the build, not a page for readers or search engines.
  robots: { index: false, follow: false },
};

/* Documentation of the tokens in globals.css. If a value there changes, change it here too. */
const lightColors = [
  { name: "Paper", hex: "#FBFAF7", className: "bg-paper" },
  { name: "Panel", hex: "#FFFFFF", className: "bg-panel" },
  { name: "Ink", hex: "#14181F", className: "bg-ink" },
  { name: "Muted", hex: "#586070", className: "bg-muted" },
  { name: "Rule", hex: "#D9D5CC", className: "bg-rule" },
  { name: "Link", hex: "#2B4C9B", className: "bg-link" },
  { name: "Rust", hex: "#B5532A", className: "bg-rust" },
  { name: "Tint", hex: "#EEF1F8", className: "bg-tint" },
  { name: "Code", hex: "#F3F1EB", className: "bg-code" },
  { name: "Green", hex: "#1F6F4A", className: "bg-green" },
];

const darkColors = [
  { name: "Paper", hex: "#12151B", className: "bg-paper" },
  { name: "Panel", hex: "#181C24", className: "bg-panel" },
  { name: "Ink", hex: "#ECEAE4", className: "bg-ink" },
  { name: "Muted", hex: "#A7AEBB", className: "bg-muted" },
  { name: "Rule", hex: "#303644", className: "bg-rule" },
  { name: "Link", hex: "#93ABEA", className: "bg-link" },
  { name: "Rust", hex: "#E8946B", className: "bg-rust" },
  { name: "Tint", hex: "#1C2333", className: "bg-tint" },
  { name: "Code", hex: "#0D1015", className: "bg-code" },
  { name: "Bar", hex: "#2A3F7A", className: "bg-bar" },
];

const derived = [
  {
    name: "Green (dark)",
    value: "#5CC48E",
    note: "PDF lists no dark green; chosen for 8.5:1 on Paper",
  },
  {
    name: "Bar (light)",
    value: "#2B4C9B",
    note: "PDF lists Bar for dark only; light uses the Link blue",
  },
  {
    name: "Bar hover",
    value: "#233F85 / #34509A",
    note: "Primary button hover, light / dark",
  },
  {
    name: "Tint hover",
    value: "#E1E6F3 / #26304A",
    note: "Tag chip hover, light / dark",
  },
];

const typeScale = [
  {
    spec: "Display · Source Serif 4 · 700 · 54/1.08",
    sample: <p className="font-serif text-display font-bold">Engineering notes</p>,
  },
  {
    spec: "Article title · Source Serif 4 · 700 · 46/1.12",
    sample: <p className="font-serif text-title font-bold">The outbox pattern</p>,
  },
  {
    spec: "H2 · Source Serif 4 · 700 · 28/1.25",
    sample: <p className="font-serif text-h2 font-bold">Implementation</p>,
  },
  {
    spec: "Body · Source Serif 4 · 400 · 19/1.75",
    sample: (
      <p className="font-serif text-body">
        Write the note and its outbox row in one transaction, so both are saved or neither
        is.
      </p>
    ),
  },
  {
    spec: "UI and meta · Inter · 400-600 · 13-15",
    sample: (
      <p className="font-sans text-ui font-medium">
        Articles Topics Series Projects About
      </p>
    ),
  },
  {
    spec: "Code · JetBrains Mono · 400 · 14/1.7",
    sample: (
      <p className="font-mono text-mono">
        INSERT INTO outbox (id, note_id) VALUES (?, ?);
      </p>
    ),
  },
];

const spacing = [4, 8, 12, 16, 24, 32, 48, 72];

/** The chip is drawn in the given theme; its label stays in the page's own theme so it stays readable. */
function Swatches({
  colors,
  theme,
}: {
  colors: typeof lightColors;
  theme: "light" | "dark";
}) {
  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-5">
      {colors.map((color) => (
        <li key={color.name}>
          <div
            data-theme={theme}
            className={`h-14 rounded-panel border border-rule ${color.className}`}
          />
          <p className="mt-2 text-ui-sm font-semibold text-ink">{color.name}</p>
          <p className="font-mono text-xs text-muted">{color.hex}</p>
        </li>
      ))}
    </ul>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="mb-4 font-sans text-ui-sm font-semibold tracking-[0.08em] text-ink uppercase">
      {children}
    </h2>
  );
}

export default function DesignSystemPage() {
  return (
    <div className="page-container py-12">
      <header className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b-2 border-ink pb-4">
        <h1 className="font-serif text-h2 font-bold">Design system</h1>
        <p className="font-mono text-xs text-muted">
          [ yourname.dev ] · light default, dark supported
        </p>
      </header>

      <section className="pt-8" aria-labelledby="color-heading">
        <h2 id="color-heading" className="sr-only">
          Color
        </h2>
        <SectionTitle>Color</SectionTitle>
        <p className="mb-2 font-mono text-xs text-muted">Light</p>
        <Swatches colors={lightColors} theme="light" />
        <p className="mt-6 mb-2 font-mono text-xs text-muted">Dark</p>
        <Swatches colors={darkColors} theme="dark" />
        <p className="mt-6 mb-2 font-mono text-xs text-muted">
          Derived values (not printed in the PDF)
        </p>
        <dl className="grid gap-x-6 gap-y-1 text-ui sm:grid-cols-[max-content_max-content_1fr]">
          {derived.map((item) => (
            <div key={item.name} className="contents">
              <dt className="font-semibold text-ink">{item.name}</dt>
              <dd className="font-mono text-xs leading-normal text-muted sm:pt-0.5">
                {item.value}
              </dd>
              <dd className="text-ui-sm text-muted">{item.note}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="pt-12" aria-labelledby="type-heading">
        <h2 id="type-heading" className="sr-only">
          Typography
        </h2>
        <SectionTitle>Typography</SectionTitle>
        <dl className="border-t border-dotted border-rule">
          {typeScale.map((row) => (
            <div
              key={row.spec}
              className="grid gap-2 border-b border-dotted border-rule py-4 md:grid-cols-[16rem_1fr] md:gap-8"
            >
              <dt className="font-mono text-xs leading-normal text-muted">{row.spec}</dt>
              <dd>{row.sample}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section id="components" className="pt-12" aria-labelledby="components-heading">
        <h2 id="components-heading" className="sr-only">
          Components
        </h2>
        <SectionTitle>Components</SectionTitle>
        <p className="mb-6 max-w-[40rem] text-ui text-muted">
          Each component appears once in the light theme and once in the dark theme. Hover
          and press Tab to see the hover and focus states. The header and footer of this
          page are the Header and Footer components.
        </p>

        <div
          data-theme="light"
          className="rounded-panel border border-rule bg-paper p-6 text-ink"
        >
          <p className="mb-4 font-mono text-xs text-muted">Light</p>
          <Specimens />
        </div>
        <div
          data-theme="dark"
          className="mt-6 rounded-panel border border-rule bg-paper p-6 text-ink"
        >
          <p className="mb-4 font-mono text-xs text-muted">Dark</p>
          <Specimens />
        </div>
      </section>

      <section className="pt-12" aria-labelledby="layout-heading">
        <h2 id="layout-heading" className="sr-only">
          Layout rules
        </h2>
        <div className="border-t-2 border-ink pt-4">
          <SectionTitle>Layout rules</SectionTitle>
          <div className="grid gap-x-12 gap-y-2 text-ui-lg text-muted md:grid-cols-2">
            <ul className="list-disc space-y-2 pl-5">
              <li>
                Page container 1120px with 32px gutters; article column 70 characters or
                about 720px.
              </li>
              <li>Spacing scale: 4, 8, 12, 16, 24, 32, 48, 72.</li>
              <li>Lists are dense rows with dotted dividers; thumbnails are optional.</li>
            </ul>
            <ul className="list-disc space-y-2 pl-5">
              <li>Primary text 4.5:1 or better on paper and panel in both themes.</li>
              <li>Visible focus ring on every interactive element.</li>
              <li>Motion limited to hover and focus; no decorative animation.</li>
            </ul>
          </div>
          <p className="mt-6 mb-2 font-mono text-xs text-muted">Spacing scale in px</p>
          <ul className="flex flex-wrap items-end gap-4">
            {spacing.map((px) => (
              <li key={px} className="text-center">
                <div className="bg-rust" style={{ width: px, height: 12 }} />
                <span className="font-mono text-xs text-muted">{px}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

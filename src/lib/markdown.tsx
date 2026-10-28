import Link from "next/link";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import type { ReactNode } from "react";
import type { Element, ElementContent, Root, RootContent } from "hast";
import { toJsxRuntime, type Components } from "hast-util-to-jsx-runtime";
import { toString as hastToString } from "hast-util-to-string";
import rehypeSanitize, {
  defaultSchema,
  type Options as SanitizeOptions,
} from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { DiagramFigure } from "@/components/content/DiagramFigure";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { Panel } from "@/components/ui/Panel";
import { codeLanguages, type CodeLanguage } from "@/lib/highlight";

export interface Heading {
  id: string;
  text: string;
  depth: 2 | 3;
}

export interface RenderedMarkdown {
  content: ReactNode;
  headings: Heading[];
}

/* ---------------------------------------------------------------------------
 * Pipeline: Markdown -> mdast (GFM) -> hast -> block rewrites -> sanitize -> heading ids.
 * Raw HTML in the source is dropped (remark-rehype does not pass it through), and the
 * sanitizer then removes anything outside an allowlist. The result is turned into React
 * elements directly, so no HTML string is ever injected into the page.
 * ------------------------------------------------------------------------- */

function isElement(node: RootContent | ElementContent): node is Element {
  return node.type === "element";
}

function classNames(node: Element): string[] {
  const value = node.properties?.className;
  return Array.isArray(value) ? value.map(String) : [];
}

/** Meta string after the language on a fence: ```diagram:outbox caption="..." */
function readCaption(meta: unknown): string | undefined {
  if (typeof meta !== "string") return undefined;
  return /caption="([^"]*)"/.exec(meta)?.[1];
}

/**
 * Rewrites three Markdown shapes into marked-up divs/figures the renderer understands:
 *   - ```diagram:<name> caption="..."  ->  div[data-diagram][data-caption]
 *   - a paragraph holding only an image ->  figure with a figcaption from the image title
 *   - > **Title** followed by text      ->  div[data-callout="Title"]
 * It runs before sanitizing, so everything it emits is still checked against the allowlist.
 */
function rehypeBlocks() {
  return (tree: Root) => {
    const rewrite = (parent: Element | Root) => {
      parent.children = (parent.children as ElementContent[]).map(
        (child): ElementContent => {
          if (!isElement(child)) return child;
          rewrite(child);

          if (child.tagName === "pre") {
            const code = child.children.find(isElement);
            const lang = code
              ? classNames(code).find((c) => c.startsWith("language-diagram:"))
              : undefined;
            if (code && lang) {
              return {
                type: "element",
                tagName: "div",
                properties: {
                  dataDiagram: lang.replace("language-diagram:", ""),
                  dataCaption: readCaption(
                    (code.data as { meta?: unknown } | undefined)?.meta,
                  ),
                },
                children: [],
              };
            }
          }

          if (child.tagName === "p") {
            const content = child.children.filter(
              (c) => !(c.type === "text" && !c.value.trim()),
            );
            const [only] = content;
            if (
              content.length === 1 &&
              only &&
              isElement(only) &&
              only.tagName === "img"
            ) {
              const title =
                typeof only.properties?.title === "string" ? only.properties.title : "";
              const { title: _title, ...imgProps } = only.properties ?? {};
              return {
                type: "element",
                tagName: "figure",
                properties: {},
                children: [
                  { ...only, properties: imgProps },
                  ...(title
                    ? [
                        {
                          type: "element" as const,
                          tagName: "figcaption",
                          properties: {},
                          children: [{ type: "text" as const, value: title }],
                        },
                      ]
                    : []),
                ],
              };
            }
          }

          if (child.tagName === "blockquote") {
            const content = child.children.filter(isElement);
            const [first, ...rest] = content;
            const strong =
              first?.tagName === "p" && first.children.length === 1
                ? first.children[0]
                : undefined;
            if (first && strong && isElement(strong) && strong.tagName === "strong") {
              return {
                type: "element",
                tagName: "div",
                properties: { dataCallout: hastToString(strong) },
                children: rest,
              };
            }
          }

          return child;
        },
      );
    };
    rewrite(tree);
  };
}

const schema: SanitizeOptions = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), "figure", "figcaption"],
  attributes: {
    ...defaultSchema.attributes,
    img: [...(defaultSchema.attributes?.img ?? []), "alt", "width", "height"],
    div: [
      ...(defaultSchema.attributes?.div ?? []),
      "dataDiagram",
      "dataCaption",
      "dataCallout",
    ],
  },
};

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeBlocks)
  .use(rehypeSanitize, schema)
  .use(rehypeSlug);

function collectHeadings(tree: Root): Heading[] {
  const headings: Heading[] = [];
  const walk = (node: Element | Root) => {
    for (const child of node.children) {
      if (!isElement(child)) continue;
      if (
        (child.tagName === "h2" || child.tagName === "h3") &&
        typeof child.properties?.id === "string"
      ) {
        headings.push({
          id: child.properties.id,
          text: hastToString(child),
          depth: child.tagName === "h2" ? 2 : 3,
        });
      }
      walk(child);
    }
  };
  walk(tree);
  return headings;
}

/* ---------------------------------------------------------------------------
 * Element styles. Body text is Source Serif 4 at 19px; spacing follows the PDF's article page.
 * ------------------------------------------------------------------------- */

function isCodeLanguage(value: string): value is CodeLanguage {
  return (codeLanguages as readonly string[]).includes(value);
}

const components: Partial<Components> = {
  h2: ({ node: _node, ...props }) => (
    <h2
      {...props}
      className="mt-12 mb-4 scroll-mt-6 font-serif text-h2 font-bold text-ink first:mt-0"
    />
  ),
  h3: ({ node: _node, ...props }) => (
    <h3
      {...props}
      className="mt-8 mb-3 scroll-mt-6 font-serif text-item-title font-bold text-ink"
    />
  ),
  p: ({ node: _node, ...props }) => (
    <p {...props} className="my-4 font-serif text-body text-ink" />
  ),
  a: ({ node: _node, href, children, ...props }) => {
    const className = "text-link underline underline-offset-2 hover:decoration-2";
    if (href?.startsWith("/")) {
      return (
        <Link href={href} className={className}>
          {children}
        </Link>
      );
    }
    return (
      <a {...props} href={href} className={className} rel="noopener noreferrer">
        {children}
      </a>
    );
  },
  ul: ({ node: _node, ...props }) => (
    <ul
      {...props}
      className="my-4 list-disc space-y-2 pl-6 font-serif text-body marker:text-ink"
    />
  ),
  ol: ({ node: _node, ...props }) => (
    <ol
      {...props}
      className="my-4 list-decimal space-y-2 pl-6 font-serif text-body marker:text-ink"
    />
  ),
  code: ({ node: _node, ...props }) => (
    <code
      {...props}
      className="rounded-panel border border-rule bg-code px-1.5 py-0.5 font-mono text-[0.8em]"
    />
  ),
  pre: ({ node }) => {
    const code = node?.children.find(isElement);
    const lang = code
      ? classNames(code).find((c) => c.startsWith("language-"))
      : undefined;
    const name = lang?.replace("language-", "") ?? "text";
    return (
      <CodeBlock
        className="my-6"
        code={code ? hastToString(code) : ""}
        language={isCodeLanguage(name) ? name : "text"}
      />
    );
  },
  figure: ({ node: _node, children }) => (
    <figure className="my-8 [&>img]:w-full [&>img]:rounded-panel [&>img]:border [&>img]:border-rule">
      {children}
    </figure>
  ),
  figcaption: ({ node: _node, ...props }) => (
    <figcaption {...props} className="mt-2 text-ui-sm leading-normal text-muted" />
  ),
  // Markdown images are user-supplied; their size is unknown, so next/image does not apply.
  img: ({ node: _node, alt, ...props }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt={alt ?? ""} loading="lazy" decoding="async" />
  ),
  table: ({ node: _node, ...props }) => (
    <div className="my-6 overflow-x-auto" tabIndex={0} role="region" aria-label="Table">
      <table {...props} className="w-full border-collapse text-ui-lg" />
    </div>
  ),
  th: ({ node: _node, ...props }) => (
    <th {...props} className="border-b-2 border-ink px-3 py-2 text-left font-semibold" />
  ),
  td: ({ node: _node, ...props }) => (
    <td {...props} className="border-b border-dotted border-rule px-3 py-2 align-top" />
  ),
  hr: () => <hr className="my-10 border-t border-dotted border-rule" />,
  blockquote: ({ node: _node, ...props }) => (
    <blockquote
      {...props}
      className="my-6 border-l-2 border-rule pl-4 font-serif text-body text-muted italic"
    />
  ),
  div: ({ node: _node, children, ...props }) => {
    const rest = props as Record<string, string | undefined>;
    if (rest["data-diagram"]) {
      return <DiagramFigure name={rest["data-diagram"]} caption={rest["data-caption"]} />;
    }
    if (rest["data-callout"]) {
      return (
        <Panel
          title={rest["data-callout"]}
          headingLevel={3}
          className="my-6"
          bodyClassName="px-4 py-3 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
        >
          {children}
        </Panel>
      );
    }
    return <div>{children}</div>;
  },
};

export async function renderMarkdown(source: string): Promise<RenderedMarkdown> {
  const tree = (await processor.run(processor.parse(source))) as Root;
  return {
    headings: collectHeadings(tree),
    content: toJsxRuntime(tree, { Fragment, jsx, jsxs, components, passNode: true }),
  };
}

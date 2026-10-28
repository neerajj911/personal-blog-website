/**
 * Validation for everything the admin panel writes. Server actions parse form input with
 * these before it reaches the store, so the browser is never trusted. Phase 4 reuses the
 * same schemas in front of MongoDB.
 */
import * as z from "zod";

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const topicColors = [
  "flutter",
  "offline-first",
  "backend",
  "databases",
  "system-design",
  "ai",
  "tools",
] as const;

const slug = z
  .string()
  .trim()
  .max(100, "At most 100 characters.")
  .regex(SLUG_PATTERN, "Use lowercase letters, numbers and single hyphens.");

const requiredText = (max: number) =>
  z.string().trim().min(1, "Required.").max(max, `At most ${max} characters.`);

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `At most ${max} characters.`)
    .transform((value) => value || undefined);

const calendarDate = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use the format YYYY-MM-DD.")
  .refine((value) => {
    const date = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
  }, "That is not a real date.");

/** One entry per line; blank lines are dropped. */
function lines(max: number, perLine: number) {
  return z
    .string()
    .transform((value) =>
      value
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean),
    )
    .pipe(
      z
        .array(
          z.string().max(perLine, `Each line may have at most ${perLine} characters.`),
        )
        .max(max, `At most ${max} lines.`),
    );
}

const tags = z
  .string()
  .transform((value) =>
    [...new Set(value.split(",").map((tag) => tag.trim().toLowerCase()))].filter(Boolean),
  )
  .pipe(
    z
      .array(
        z
          .string()
          .max(30, "A tag may have at most 30 characters.")
          .regex(
            /^[a-z0-9][a-z0-9 .+#-]*$/,
            "Tags use letters, numbers, spaces and - . + #.",
          ),
      )
      .max(10, "At most 10 tags."),
  );

/** "Title | https://example.com" per line; the address is optional. */
const references = lines(30, 400).pipe(
  z.array(z.string()).transform((rows, ctx) => {
    const parsed: { title: string; href?: string }[] = [];
    for (const row of rows) {
      const [title = "", href] = row.split("|").map((part) => part.trim());
      if (!title) {
        ctx.addIssue({ code: "custom", message: `Missing title in “${row}”.` });
        continue;
      }
      if (href) {
        let valid = false;
        try {
          const url = new URL(href);
          valid = url.protocol === "https:" || url.protocol === "http:";
        } catch {
          valid = false;
        }
        if (!valid) {
          ctx.addIssue({
            code: "custom",
            message: `“${title}”: the address must be a full http(s) URL.`,
          });
          continue;
        }
      }
      parsed.push(href ? { title, href } : { title });
    }
    return parsed;
  }),
);

const slugList = z
  .string()
  .transform((value) =>
    [...new Set(value.split(",").map((item) => item.trim()))].filter(Boolean),
  )
  .pipe(z.array(slug).max(6, "At most 6 related articles."));

export const articleInputSchema = z.object({
  slug,
  title: requiredText(140),
  subtitle: optionalText(200),
  excerpt: requiredText(300),
  topicSlug: z.string().trim().min(1, "Choose a topic."),
  tags,
  status: z.enum(["draft", "published"]),
  publishedAt: calendarDate,
  seriesSlug: z.string().trim().default(""),
  // A disabled select is not submitted, so a missing part means "no series".
  seriesPart: z.string().trim().default(""),
  body: z
    .string()
    .max(200_000, "The body is too long.")
    .transform((v) => v.replace(/\r\n/g, "\n")),
  references,
  relatedSlugs: slugList,
});

export type ArticleInput = z.output<typeof articleInputSchema>;

export const topicInputSchema = z.object({
  slug,
  name: requiredText(60),
  shortName: requiredText(30),
  color: z.enum(topicColors),
});

export type TopicInput = z.output<typeof topicInputSchema>;

/** "Title | optional summary" per line. Part numbers follow the line order. */
const parts = lines(40, 400).pipe(
  z.array(z.string()).transform((rows, ctx) => {
    const parsed: { title: string; summary?: string }[] = [];
    for (const row of rows) {
      const [title = "", ...rest] = row.split("|").map((part) => part.trim());
      if (!title) {
        ctx.addIssue({ code: "custom", message: `Missing title in “${row}”.` });
        continue;
      }
      const summary = rest.join(" | ").trim();
      parsed.push(summary ? { title, summary } : { title });
    }
    return parsed;
  }),
);

export const seriesInputSchema = z.object({
  slug,
  title: requiredText(100),
  shortTitle: requiredText(60),
  summary: requiredText(300),
  description: requiredText(1500),
  learn: lines(10, 200),
  prerequisites: lines(10, 200),
  sourceLabel: requiredText(100),
  sourceNote: requiredText(300),
  parts,
});

export type SeriesInput = z.output<typeof seriesInputSchema>;

export interface FieldErrors {
  [field: string]: string[] | undefined;
}

/** What a form action returns to the form. Never contains stored records. */
export interface FormState {
  ok?: boolean;
  message?: string;
  errors?: FieldErrors;
}

export function toFieldErrors(error: z.ZodError): FieldErrors {
  return z.flattenError(error).fieldErrors as FieldErrors;
}

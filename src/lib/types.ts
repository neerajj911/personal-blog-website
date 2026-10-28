/** Colour keys for topic markers. Each maps to a --topic-* token in globals.css. */
export type TopicColor =
  | "flutter"
  | "offline-first"
  | "backend"
  | "databases"
  | "system-design"
  | "ai"
  | "tools";

export interface Topic {
  slug: string;
  /** Full name, used in the topics list: "Offline-First Architecture". */
  name: string;
  /** Short name, used beside article rows and in filter pills: "Offline-First". */
  shortName: string;
  color: TopicColor;
}

/** A topic plus the number of published articles in it, derived from the articles. */
export interface TopicWithCount extends Topic {
  articleCount: number;
}

export type PartStatus = "published" | "coming-soon";

export interface SeriesPart {
  number: number;
  title: string;
  summary?: string;
  status: PartStatus;
}

export interface Series {
  slug: string;
  title: string;
  /** Short name, used in article labels: "Part 3 · Offline-First Flutter". */
  shortTitle: string;
  /** One or two sentences, used in cards and panels. */
  summary: string;
  /** Introduction on the series page. */
  description: string;
  learn: string[];
  prerequisites: string[];
  /** Shown in the "Source code" panel. */
  source: { label: string; note: string };
  parts: SeriesPart[];
}

export interface Reference {
  title: string;
  href?: string;
}

export interface Article {
  slug: string;
  title: string;
  /** Short summary shown in lists. */
  excerpt: string;
  /** One-line standfirst under the title on the article page. Falls back to the excerpt. */
  subtitle?: string;
  topicSlug: string;
  tags: string[];
  /** Calendar date, YYYY-MM-DD. */
  publishedAt: string;
  updatedAt?: string;
  readingMinutes: number;
  series?: { slug: string; part: number };
  /** Article text as Markdown. */
  body?: string;
  references?: Reference[];
  /** Slugs chosen by hand for "Related articles". Computed when absent. */
  relatedSlugs?: string[];
}

export type ArticleStatus = "draft" | "published";

/**
 * An article as stored. Only the admin side ever sees `draft` records: the public
 * content layer filters to `published` before anything reaches a page.
 */
export interface ArticleRecord extends Article {
  status: ArticleStatus;
}

export interface Note {
  id: string;
  /** Calendar date, YYYY-MM-DD. */
  date: string;
  text: string;
}

export type ProjectStatus = "in-progress" | "in-design";

export interface ProjectLink {
  label: string;
  /** Absent while the target does not exist yet. */
  href?: string;
}

export interface Project {
  slug: string;
  title: string;
  status: ProjectStatus;
  summary: string;
  stack: string[];
  /** Shorter list for the Home card, when the mockup shows fewer than the project page. */
  cardStack?: string[];
  problem: string;
  decisions: string[];
  /** Placeholder text until there is something to report. */
  lessons: string;
  /** Layers from top to bottom. */
  architecture: string[];
  links: ProjectLink[];
}

export interface AboutSection {
  heading: string;
  body: string;
}

export interface AboutLink {
  label: string;
  href: string;
}

/** About page text. Everything on it must be true of the author: nothing is invented here. */
export interface AboutContent {
  intro: string;
  sections: AboutSection[];
  workingWith: string[];
  learning: string[];
  startHere: AboutLink[];
  /** Shown beside "Elsewhere" when the author chooses to publish an email address. */
  emailNote: string;
}

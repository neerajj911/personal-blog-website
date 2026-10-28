/**
 * ============================================================================
 *  SAMPLE DATA: NOT REAL CONTENT
 * ============================================================================
 * Every title, excerpt, date and note below comes from the approved UI mockup
 * and is placeholder content. Nothing here describes work that has actually
 * been published or measured. Tags and article body text are sample text
 * written to fill the mockup's layout.
 *
 * Pages never import this file directly: they go through src/lib/content.ts.
 * When the database arrives (phase 4) the functions in content.ts query it
 * instead and this file is deleted; the types in src/lib/types.ts stay.
 * ============================================================================
 */
import type { AboutContent, Article, Note, Project, Series, Topic } from "@/lib/types";

export const topics: Topic[] = [
  {
    slug: "flutter",
    name: "Flutter and Mobile Engineering",
    shortName: "Flutter",
    color: "flutter",
  },
  {
    slug: "offline-first",
    name: "Offline-First Architecture",
    shortName: "Offline-First",
    color: "offline-first",
  },
  {
    slug: "backend",
    name: "Backend Engineering",
    shortName: "Backend",
    color: "backend",
  },
  {
    slug: "databases",
    name: "Databases and Data Modeling",
    shortName: "Databases",
    color: "databases",
  },
  {
    slug: "system-design",
    name: "System Design",
    shortName: "System design",
    color: "system-design",
  },
  {
    slug: "ai",
    name: "AI Engineering",
    shortName: "AI",
    color: "ai",
  },
  {
    slug: "tools",
    name: "Developer Tools",
    shortName: "Tools",
    color: "tools",
  },
];

export const series: Series[] = [
  {
    slug: "offline-first-flutter",
    title: "Offline-First Flutter: From Fundamentals to Reliable Synchronization",
    shortTitle: "Offline-First Flutter",
    summary:
      "Building a notes app that works without a connection and syncs without losing or duplicating data.",
    description:
      "A walk through building a notes app that keeps working without a connection, and syncs to a Node.js and MongoDB backend without losing or duplicating data. Each part is published only after its implementation or experiment is finished and understood.",
    learn: [
      "How offline-first differs from caching an online app",
      "How to design a local database that drives the UI",
      "How to queue changes safely with an outbox",
      "How to make sync requests safe to retry",
      "How to test the failure cases, not only the happy path",
    ],
    prerequisites: [
      "Basic Dart and Flutter",
      "Familiarity with REST APIs",
      "Some SQL helps, but is not required",
    ],
    source: {
      label: "github.com/[your-handle]/[repository]",
      note: "Each article links to the commit that describes it.",
    },
    parts: [
      {
        number: 1,
        title: "Online-only vs offline-first",
        summary:
          "The problem, the failure modes of online-only apps, and what offline-first does and does not promise.",
        status: "published",
      },
      {
        number: 2,
        title: "Local database as source of truth",
        summary:
          "SQLite in Flutter, notes table design, and a UI that reads local data first.",
        status: "published",
      },
      {
        number: 3,
        title: "Transactional writes and the outbox",
        summary: "Why the note and its sync intent are written in one transaction.",
        status: "published",
      },
      {
        number: 4,
        title: "Sync triggers and stale acknowledgements",
        summary:
          "When to sync, what connectivity detection can and cannot tell you, and protecting against late acknowledgements.",
        status: "coming-soon",
      },
      {
        number: 5,
        title: "Sync API with Node.js and MongoDB",
        summary: "The endpoint contract, validation and the server-side data model.",
        status: "coming-soon",
      },
      {
        number: 6,
        title: "Idempotency keys and duplicate requests",
        summary: "Why retries create duplicates and how a key makes them harmless.",
        status: "coming-soon",
      },
      {
        number: 7,
        title: "Processing leases and generation numbers",
        summary: "Concurrent processing and protection against stale requests.",
        status: "coming-soon",
      },
      {
        number: 8,
        title: "Deletion and tombstones",
        summary:
          "Why hard deletes break sync and how tombstones are created and cleaned up.",
        status: "coming-soon",
      },
      {
        number: 9,
        title: "Failure testing",
        summary:
          "A test matrix across offline, online, flaky and interrupted sync, with the results actually observed.",
        status: "coming-soon",
      },
      {
        number: 10,
        title: "Production limitations and next steps",
        summary: "Conflict resolution, scaling, and what is deliberately left unsolved.",
        status: "coming-soon",
      },
    ],
  },
];

const outboxBody = `## The problem

When a user edits a note offline, two things must happen: the note changes locally, and the app records that the server still needs to hear about it. If those two writes can succeed independently, a crash between them leaves the app in a bad state. Either a local change will never sync, or a queued request describes a change that never happened.

## The core idea

An \`outbox\` is a table that holds pending sync operations. The app writes the note and its outbox row inside one database transaction, so both are saved or neither is. A separate sync worker reads the outbox later and sends each operation to the server.

\`\`\`diagram:outbox caption="Figure 1. The note and its outbox row are written together. The worker sends them to the server afterwards. Sample diagram."
\`\`\`

## Implementation

In SQLite, the transaction is explicit. Both statements run between \`BEGIN\` and \`COMMIT\`, so a failure in either rolls back both.

\`\`\`sql
BEGIN;
UPDATE notes SET body = ?, updated_at = ? WHERE id = ?;
INSERT INTO outbox (id, note_id, op, payload, created_at)
VALUES (?, ?, 'update', ?, ?);
COMMIT;
\`\`\`

> **Trade-off**
>
> The outbox grows while the device is offline, so it needs a retry policy and a cleanup rule. Later parts cover both.

## Takeaways

- Write the change and the intent to sync it in one transaction.
- Let a separate worker own network calls and retries.
- Treat the outbox as data that must be inspected, bounded and cleaned up.
`;

/** Newest first. */
export const articles: Article[] = [
  {
    slug: "outbox-pattern-write-locally-queue-transactionally",
    title: "The outbox pattern: write locally, queue transactionally",
    excerpt:
      "How to make a local write and its sync intent succeed or fail together, and why two separate writes are not enough.",
    subtitle: "How to make a local write and its sync intent succeed or fail together.",
    topicSlug: "offline-first",
    tags: ["sqlite", "outbox", "flutter", "transactions"],
    publishedAt: "2026-10-21",
    updatedAt: "2026-10-24",
    readingMinutes: 11,
    series: { slug: "offline-first-flutter", part: 3 },
    body: outboxBody,
    references: [
      {
        title: "SQLite documentation: transactions",
        href: "https://www.sqlite.org/lang_transaction.html",
      },
      {
        title: "Transactional outbox pattern, microservices.io",
        href: "https://microservices.io/patterns/data/transactional-outbox.html",
      },
      { title: "[Reference title]" },
    ],
    relatedSlugs: [
      "idempotent-endpoints-designing-for-the-second-request",
      "designing-mongodb-indexes-for-a-sync-endpoint",
    ],
  },
  {
    slug: "local-database-should-drive-your-flutter-ui",
    title: "Why the local database should drive your Flutter UI",
    excerpt:
      "Reading from SQLite first, treating the network as a background concern, and what that changes in your widget tree.",
    topicSlug: "flutter",
    tags: ["flutter", "sqlite"],
    publishedAt: "2026-10-14",
    readingMinutes: 9,
    series: { slug: "offline-first-flutter", part: 2 },
  },
  {
    slug: "online-only-vs-offline-first",
    title: "Online-only vs offline-first: what actually changes",
    excerpt:
      "A plain comparison of failure modes, data flow and user expectations before any code is written.",
    topicSlug: "offline-first",
    tags: ["flutter", "sync"],
    publishedAt: "2026-10-07",
    readingMinutes: 8,
    series: { slug: "offline-first-flutter", part: 1 },
  },
  {
    slug: "designing-mongodb-indexes-for-a-sync-endpoint",
    title: "Designing MongoDB indexes for a sync endpoint",
    excerpt:
      "Choosing compound indexes from the queries a sync API really runs, and checking them with explain.",
    topicSlug: "databases",
    tags: ["mongodb", "sync"],
    publishedAt: "2026-09-30",
    readingMinutes: 10,
  },
  {
    slug: "retry-budgets-and-backoff-in-nodejs-workers",
    title: "Retry budgets and backoff in Node.js workers",
    excerpt:
      "Bounding retries so a flaky dependency slows a worker down instead of taking it down.",
    topicSlug: "backend",
    tags: ["node.js"],
    publishedAt: "2026-09-22",
    readingMinutes: 7,
  },
  {
    slug: "how-flutter-turns-a-widget-tree-into-pixels",
    title: "How Flutter turns a widget tree into pixels",
    excerpt:
      "Build, layout and paint as three separate phases, and where each one can go wrong.",
    topicSlug: "flutter",
    tags: ["flutter"],
    publishedAt: "2026-09-15",
    readingMinutes: 12,
  },
  {
    slug: "idempotent-endpoints-designing-for-the-second-request",
    title: "Idempotent endpoints: designing for the second request",
    excerpt:
      "Why every retry is a duplicate in waiting, and how a key makes the second call harmless.",
    topicSlug: "backend",
    tags: ["idempotency", "node.js", "sync"],
    publishedAt: "2026-09-08",
    readingMinutes: 9,
  },
  {
    slug: "practical-checklist-for-tool-calling-llm-apps",
    title: "A practical checklist for tool-calling LLM apps",
    excerpt:
      "Schemas, timeouts, retries and logging for functions an LLM is allowed to call.",
    topicSlug: "ai",
    tags: [],
    publishedAt: "2026-08-30",
    readingMinutes: 8,
  },
];

/** Newest first. */
export const notes: Note[] = [
  {
    id: "2026-10-27",
    date: "2026-10-27",
    text: "Sample note: short dated updates on what is being built or learned appear here.",
  },
  {
    id: "2026-10-21",
    date: "2026-10-21",
    text: "Sample note: Part 3 is published. Part 4 is next, once its failure tests are written.",
  },
  {
    id: "2026-10-14",
    date: "2026-10-14",
    text: "Sample note: series repository link added to the series page.",
  },
];

export const projects: Project[] = [
  {
    slug: "offline-first-notes-app",
    title: "Offline-first Notes app",
    status: "in-progress",
    summary:
      "A Flutter notes app that stays usable without a connection and synchronizes through a Node.js and MongoDB backend.",
    stack: ["Flutter", "SQLite", "Node.js", "MongoDB"],
    problem:
      "Notes should stay usable without a connection, and changes made offline should reach the server reliably once it returns, without being lost or duplicated.",
    decisions: [
      "The local SQLite database drives the UI, not the network.",
      "Each change is written together with an outbox row in one transaction.",
      "Sync requests carry idempotency keys so retries are safe.",
    ],
    lessons: "[To be written once the series is complete.]",
    architecture: [
      "Flutter UI",
      "SQLite: notes and outbox",
      "Sync worker",
      "Node.js API",
      "MongoDB",
    ],
    links: [
      { label: "Source code [repository link]" },
      {
        label: "Read the Offline-First Flutter series",
        href: "/series/offline-first-flutter",
      },
    ],
  },
  {
    slug: "this-publication",
    title: "This publication",
    status: "in-design",
    summary:
      "A server-rendered technical blog with a private admin panel, built for long-form articles and search visibility.",
    stack: ["Next.js", "TypeScript", "MongoDB", "Markdown"],
    cardStack: ["Next.js", "TypeScript", "MongoDB"],
    problem:
      "Keep a durable, searchable record of what I learn, and publish it for other developers in a form that search engines can index.",
    decisions: [
      "Public pages are server-rendered or statically generated for SEO.",
      "A single allowlisted admin account manages content, with authorization checked on the server.",
      "Articles are Markdown, sanitized and rendered on the server.",
    ],
    lessons: "[To be written after launch.]",
    architecture: [
      "Reader",
      "Next.js pages (ISR)",
      "Server actions and routes",
      "MongoDB",
    ],
    links: [
      { label: "Source code [repository link]" },
      { label: "Related articles [coming soon]" },
    ],
  },
];

/**
 * About page text, from the mockup. The claims about what the author works with and
 * is learning are the mockup's wording and must be confirmed or rewritten by the author.
 */
export const about: AboutContent = {
  intro:
    "I am [Your Name], a software engineer working mainly with Flutter, React Native, Node.js and MongoDB. I am also learning advanced mobile architecture, offline-first systems, backend reliability and AI engineering.",
  sections: [
    {
      heading: "Why this site exists",
      body: "I write down what I learn: why an architectural decision is made, how an implementation works, what fails, and how problems get solved. Publishing it forces me to understand each topic properly, and it gives other developers a practical reference.",
    },
    {
      heading: "How I write",
      body: "I publish an article only after the implementation or experiment behind it is finished and understood. Articles explain the problem, the core concepts, the implementation, the edge cases and the trade-offs. Where something does not work, I say so.",
    },
  ],
  workingWith: ["Flutter", "React Native", "Node.js", "MongoDB"],
  learning: [
    "Offline-first architecture",
    "Advanced mobile architecture",
    "Backend reliability",
    "AI engineering",
  ],
  startHere: [
    { label: "Offline-First Flutter series", href: "/series/offline-first-flutter" },
    { label: "Projects", href: "/projects" },
    { label: "All articles", href: "/articles" },
  ],
  emailNote: "[optional, publish only if you choose to]",
};

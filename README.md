# yourname.dev

A personal engineering publication: long-form articles, series, topics, dated notes and projects, written as a long-term knowledge base. The first series is **Offline-First Flutter** (Flutter, SQLite, outbox pattern, Node.js, MongoDB).

`[ yourname.dev ]` and `[Your Name]` are placeholders until the real site name, domain and author details are decided. They live in one file: [`src/config/site.ts`](src/config/site.ts).

> The approved UI mockups ("Engineering Publication UI.pdf") are the source of truth for every visual decision. Nothing here restyles or adds to them.

## Status

| Phase | Scope                                                                   | State                                                               |
| ----- | ----------------------------------------------------------------------- | ------------------------------------------------------------------- |
| 1     | Scaffold, design tokens, core components, Home page, `/design-system`   | **Built**                                                           |
| 2     | Articles list, article detail, series, topics, projects and About pages | **Built**                                                           |
| 3     | Private admin panel: GitHub sign-in, articles, topics, series           | **Built** (partial, see [Admin panel](#admin-panel))                |
| 4     | MongoDB Atlas store behind the same interface                           | **Built** (see [Where the content lives](#where-the-content-lives)) |
| 5     | SEO: metadata, structured data, sitemap, robots, RSS, social images     | **Built** (see [SEO](#seo))                                         |
| 6     | Testing and deployment (Vercel + Atlas)                                 | Not started                                                         |

The admin panel does **not** yet include: editing notes, projects and the About page, and per-article SEO fields. Also built since: a light/dark toggle in the navbar, Cloudinary image upload in the article editor, and the MongoDB store.

Redirects are not needed yet: slugs cannot change after creation, so no address moves. When that changes, add them in `next.config.ts`.

## Stack

- Next.js 16 (App Router) with TypeScript in strict mode
- Tailwind CSS 4, with the design tokens as CSS variables (`src/app/globals.css`)
- `next/font`: Source Serif 4, Inter, JetBrains Mono (self-hosted at build time)
- Shiki for syntax highlighting (server-side, JavaScript regex engine, only the languages in use)
- unified, remark-parse, remark-gfm, remark-rehype, rehype-sanitize, rehype-slug and hast-util-to-jsx-runtime for article Markdown (see [Markdown pipeline](#markdown-pipeline))
- Auth.js (`next-auth` v5 beta) with the GitHub provider, JWT sessions
- Zod for validating everything the admin panel writes
- ESLint (`eslint-config-next`) and Prettier

- MongoDB (`mongodb` driver) for content; Cloudinary for images (signed direct uploads)

Decided for later phases: Mermaid rendered to SVG on the server, Vercel hosting. Secrets go in environment variables only; none are in the repository.

## Run it

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open <http://localhost:3000> (Next picks another port if 3000 is busy; the terminal says which).

| Command                | What it does               |
| ---------------------- | -------------------------- |
| `npm run dev`          | Development server         |
| `npm run build`        | Production build           |
| `npm run start`        | Serve the production build |
| `npm run lint`         | ESLint                     |
| `npm run typecheck`    | `tsc --noEmit`             |
| `npm run format`       | Prettier, write            |
| `npm run format:check` | Prettier, check only       |

If a change to `globals.css` does not show up in `npm run dev`, restart the dev server. During phase 1 the Turbopack Tailwind loader sometimes kept serving the old stylesheet.

### Environment variables (admin panel)

The public site needs none. The admin panel needs these in `.env.local` (copy [`.env.example`](.env.example); `.env.local` is git-ignored):

| Variable                                                               | What it is                                                                                                                                                                                                                                   |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AUTH_SECRET`                                                          | Random string that signs session cookies. `openssl rand -base64 32`                                                                                                                                                                          |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET`                                | A GitHub OAuth app: GitHub → Settings → Developer settings → OAuth Apps. Callback URL `http://localhost:3000/api/auth/callback/github`                                                                                                       |
| `ADMIN_GITHUB_ID`                                                      | The **numeric id** of the one GitHub account allowed in. Get it from `https://api.github.com/users/YOUR-LOGIN` (the `id` field)                                                                                                              |
| `AUTH_URL`                                                             | Needed when you run `npm run build && npm run start` yourself, e.g. `http://localhost:3000`. Not needed in `npm run dev`                                                                                                                     |
| `MONGODB_URI`                                                          | Atlas connection string; includes the database user and password. Without it the app uses a local JSON file (development only)                                                                                                               |
| `MONGODB_DB` (optional)                                                | Database name, default `blog`                                                                                                                                                                                                                |
| `MONGODB_SEED_SAMPLE` (optional)                                       | `true` loads the placeholder sample content once, into an **empty** database                                                                                                                                                                 |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Cloudinary dashboard, API keys. Image upload stays disabled until all three are set                                                                                                                                                          |
| `SITE_URL`                                                             | The public origin, e.g. `https://example.com`. Used for canonical links, the sitemap, the feed and social images. Set it before building for production. On Vercel the production domain is used if unset; otherwise `http://localhost:3000` |
| `CLOUDINARY_FOLDER` (optional)                                         | Upload folder, default `blog`                                                                                                                                                                                                                |
| `CONTENT_DATA_DIR` (optional)                                          | Where the local-file fallback keeps `content.json`. Default `./.data`                                                                                                                                                                        |

A `.env.local` was created for development with a generated `AUTH_SECRET` and the **placeholder** `ADMIN_GITHUB_ID=1000001`. Replace it with your own id, and fill in the two `AUTH_GITHUB_*` values, before you try to sign in. Until both GitHub values are set the login page says sign-in is not configured. If `ADMIN_GITHUB_ID` is missing or not a number, **nobody** can sign in.

## Routes

| Route               | Page                                                                                          | Rendering                        |
| ------------------- | --------------------------------------------------------------------------------------------- | -------------------------------- |
| `/`                 | Home                                                                                          | Static                           |
| `/articles`         | Article list: topic pills, tag filter, search (`q`), sort, pagination, sidebar                | Dynamic (reads the query string) |
| `/articles/[slug]`  | Article: header, Markdown body, sticky contents, series panel, references, prev/next, related | Static (`generateStaticParams`)  |
| `/topics`           | All topics with article counts                                                                | Static                           |
| `/topics/[slug]`    | Articles in one topic                                                                         | Dynamic                          |
| `/series`           | All series                                                                                    | Static                           |
| `/series/[slug]`    | Series: introduction, what you will learn, ordered parts with status, progress                | Static                           |
| `/projects`         | Projects                                                                                      | Static                           |
| `/about`            | About                                                                                         | Static                           |
| `/design-system`    | Tokens and every component, in light and dark. Marked `noindex`.                              | Static                           |
| any unknown address | 404 page (`not-found.tsx`); unknown article, series or topic slugs return a real 404 status   | -                                |

Also: `/feed.xml` (RSS), `/sitemap.xml`, `/robots.txt`, `/opengraph-image` and `/og/articles/[slug]` (social preview images). See [SEO](#seo).

Admin routes (all private; see [Admin panel](#admin-panel)). Every one is dynamic, `noindex`, and answers an anonymous visitor with a redirect to `/admin/login`:

| Route                                | Page                                                            |
| ------------------------------------ | --------------------------------------------------------------- |
| `/admin/login`                       | "Sign in with GitHub"                                           |
| `/admin`                             | Dashboard: counts and the list of drafts                        |
| `/admin/articles`, `/new`, `/[slug]` | List (filter All / Drafts / Published), create, edit and delete |
| `/admin/topics`, `/new`, `/[slug]`   | List, create, edit, delete                                      |
| `/admin/series`, `/new`, `/[slug]`   | List, create, edit, delete                                      |
| `/api/auth/*`                        | Auth.js endpoints (sign-in callback, sign-out, session)         |

## Folder structure

```
src/
  auth.ts                 Auth.js config: GitHub provider, allowlist check, JWT session
  proxy.ts                Optimistic gate for /admin (redirect, no-store, noindex). Not the security boundary
  app/
    layout.tsx            <html>, fonts only
    not-found.tsx         404 for unmatched addresses (brings its own header and footer)
    globals.css           Design tokens, Tailwind theme, base styles, utilities
    (site)/               Public pages; its layout adds the skip link, Header, <main>, Footer
      page.tsx            Home
      articles/           List (page.tsx) and detail ([slug]/page.tsx)
      topics/             Index and one topic ([slug]/page.tsx)
      series/             Index and one series ([slug]/page.tsx)
      projects/  about/   One page each
      design-system/      /design-system page (page, specimens, working pill demo)
    admin/                Private panel: layout, login, dashboard, articles, topics, series, actions.ts
    api/auth/[...nextauth]/route.ts   Auth.js handlers
  components/
    ui/                   Generic building blocks: Button, FilterPill, TagChip, TopicMarker, StatusText,
                          Panel, ProgressBar, SectionHeading, Breadcrumb, PageHeader, Pagination,
                          CodeBlock, CopyButton
    layout/               Header, Footer, NavLink, Wordmark
    content/              Blog-specific compositions: ArticleRow, ArticlesSidebar, SortSelect,
                          TableOfContents, InSeriesPanel, SharePanel, PrevNextCards, RelatedArticles,
                          ReferencesList, DiagramFigure, MarkAsRead, SeriesPartRow, SeriesCard,
                          SeriesReadingProgress, ProjectPanel, ProjectCard, FeaturedSeriesPanel,
                          TopicsPanel, NotesFeed
    admin/                Admin-only components: AdminNav, fields, ArticleForm, TopicForm, SeriesForm,
                          MarkdownEditor (with preview), DeleteForm, SubmitButton, Notice, ...
  config/site.ts          Site name, author, tagline, navigation, social links (placeholders)
  data/sample-content.ts  SAMPLE DATA. Seeds the store on first run; read by lib/content.ts for notes, projects, About
  lib/
    content.ts            The only way PUBLIC pages read content. Published articles only
    admin/                Admin side: session.ts (requireAdmin), allowlist.ts, content.ts (guarded
                          data access), form-values.ts
    store/                Persistence behind one interface: types.ts, mongo-store.ts, file-store.ts (dev fallback), seed.ts
    schemas.ts            Zod schemas for everything the admin panel writes
    cloudinary.ts         Signs direct-to-Cloudinary uploads (server only)
    theme.ts              Light/dark choice: head init script, read/set, subscribe
    markdown.tsx          Markdown -> sanitized React elements, plus the list of headings
    highlight.ts          Shiki setup
    reading-progress.ts   "Parts read" kept in this browser's localStorage
    urls.ts  format.ts  cn.ts  types.ts
```

Rules the structure follows:

- `ui/` knows nothing about articles or series; `content/` composes `ui/` pieces with domain types.
- Public pages read content only through `src/lib/content.ts`, which returns published articles and nothing else. Persistence sits behind the `ContentStore` interface in `src/lib/store/types.ts`; in phase 4 a MongoDB implementation replaces the file store in `src/lib/store/index.ts` and no page changes. `src/data/sample-content.ts` is then deleted; the types in `lib/types.ts` stay.
- Server components by default. Client components are `NavLink` (current page), `CopyButton` and `SharePanel` (clipboard), `SortSelect`, `TableOfContents` (highlights the current heading), `MarkAsRead` and `SeriesReadingProgress` (browser-only progress), and the design-system `PillDemo`.

## Design tokens

Source: PDF page 11 ("Design system"). Colour tokens are declared once as `light-dark(<light>, <dark>)`, so both themes sit on one line.

| Token   | Light     | Dark      | Used for                          |
| ------- | --------- | --------- | --------------------------------- |
| `paper` | `#FBFAF7` | `#12151B` | Page background                   |
| `panel` | `#FFFFFF` | `#181C24` | Panels, cards, inputs             |
| `ink`   | `#14181F` | `#ECEAE4` | Primary text                      |
| `muted` | `#586070` | `#A7AEBB` | Secondary text                    |
| `rule`  | `#D9D5CC` | `#303644` | Borders and dotted dividers       |
| `link`  | `#2B4C9B` | `#93ABEA` | Links, keywords in code           |
| `rust`  | `#B5532A` | `#E8946B` | Accent, focus ring, series labels |
| `tint`  | `#EEF1F8` | `#1C2333` | Tag chips, code header bar        |
| `code`  | `#F3F1EB` | `#0D1015` | Code block background             |
| `green` | `#1F6F4A` | `#5CC48E` | "Published", strings in code      |
| `bar`   | `#2B4C9B` | `#2A3F7A` | Panel header bar, primary button  |

**Not printed in the PDF (derived by me, flagged for your review):**

- Dark `green` `#5CC48E` (the PDF lists no dark green). Chosen for 8.5:1 contrast on the dark paper.
- Light `bar`: the PDF lists "Bar" for dark only; in light the header bars are the link blue, so it reuses `#2B4C9B`.
- Hover colours `bar-hover` (`#233F85` light, `#34509A` dark) and `tint-hover` (`#E1E6F3` light, `#26304A` dark).
- Topic marker colours (`#219B8A` Flutter, `#D8672A` Offline-First, `#4B6FD2` Backend, `#895AC4` Databases, `#2B8DB9` System design, `#CB9821` AI, `#7A8394` Tools). The PDF shows them but prints no hex, so they were sampled from the rendered swatches. The same values are used in dark.

**Type scale** (PDF): Display Source Serif 4 700 54/1.08 (letter-spacing -0.02em, measured from the mockup), Article title 46/1.12, H2 28/1.25, Body 19/1.75, UI and meta Inter 13-15, Code JetBrains Mono 14/1.7. Display and title shrink on small screens; the PDF specifies desktop only. Three extra sizes came from measuring the mockups: `text-item-title` 20.8px (article rows, project cards), `text-panel-title` 19.2px (series title in a panel) and `text-page-title` 44px (Articles, Projects, About, with -0.02em letter-spacing). Other measured sizes: page introductions 18px, About introduction 20px, About section headings 26px.

**Layout** (PDF): 1120px of content with 32px gutters, article column about 720px (`max-w-reading`), spacing scale 4, 8, 12, 16, 24, 32, 48, 72 (Tailwind units 1, 2, 3, 4, 6, 8, 12, 18). Home is a main column plus a 304px sidebar with a 40px gap; Articles and Series use a 280px sidebar, About a 372px one, the article page a 260px sidebar beside the 720px column. A few paddings measured from the mockup are 20px (article rows, project cards) and 14px (header); they are off the scale because the mockup is.

### Theme behaviour

- Light is the default.
- Dark applies automatically when the visitor's operating system asks for it.
- `data-theme="light"` or `data-theme="dark"` on `<html>` forces a theme. On any other element it forces the theme for that subtree; `/design-system` uses this to show both themes side by side.
- A toggle at the right end of the navbar (sun/moon button) switches between light and dark. With nothing chosen the site follows the OS. Once you use the toggle the choice is kept in this browser (`localStorage`, key `theme`) and applied before the first paint, so it does not flash. The PDF shows no toggle, so its look (a bordered 44px square, icon only) is my addition; it uses existing tokens. The admin panel has no toggle of its own but follows the stored choice.

The token block is declared on `:root` and on every `[data-theme]` element. That is intentional: a custom property holding `light-dark()` is resolved where it is declared, so a forced-theme wrapper must declare it again.

## Components

All components are typed, have visible hover and focus states, and work in both themes. Open `/design-system` to see them.

| Component        | Notes                                                                                                                           |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `Header`         | Bracketed monospace wordmark, nav with current-page marker, working search form (GET `/articles?q=`). Stacks on narrow screens. |
| `Footer`         | Wordmark, tagline, sample-content notice, links. External links open in a new tab and say so to screen readers.                 |
| `Panel`          | 1px border, 4px radius, no shadow, header bar with a real heading.                                                              |
| `ArticleRow`     | Number, title, excerpt, topic marker, date, reading time, series label.                                                         |
| `TopicMarker`    | Coloured dot plus a required text label.                                                                                        |
| `TagChip`        | Monospace tag; becomes a link when given `href`.                                                                                |
| `Button`         | `primary` and `secondary`, 44px minimum height. A link when given `href`, a button otherwise.                                   |
| `FilterPill`     | `aria-current` as a link, `aria-pressed` as a button. 44px hit area around a 36px pill.                                         |
| `CodeBlock`      | Shiki highlighting on the server, header bar with the language, `CopyButton`.                                                   |
| `CopyButton`     | Copies with the Clipboard API, falls back to `execCommand`; announces "Copied" through a live region.                           |
| `StatusText`     | "Published", "Coming soon", "You are here": always words, never colour alone.                                                   |
| `SectionHeading` | Uppercase title with a 2px ink rule and an optional link on the right.                                                          |
| `ProgressBar`    | `role="progressbar"` with a text label.                                                                                         |
| `Breadcrumb`     | "Home / Articles": links blue, current page muted with `aria-current="page"`.                                                   |
| `PageHeader`     | Breadcrumb, 44px page title and a short introduction.                                                                           |
| `Pagination`     | Previous, "Page 1 of 3", next. An unavailable direction is plain text, not a dead link.                                         |

`Panel` also takes an optional `meta` text for the right end of its header bar (used for a project's status), and `StatusText` an optional `short` wording ("Soon") for narrow sidebars.

The components in `content/` are listed in the folder structure above; they are compositions of the ones in this table.

## Content layer and sample data

Every public page gets its content from [`src/lib/content.ts`](src/lib/content.ts) (`getArticles`, `getArticle`, `getTopics`, `getSeries`, `getRelatedArticles`, `getProjects`, `getAbout`, ...). Articles, topics and series come from the content store (a JSON file, seeded on first run from [`src/data/sample-content.ts`](src/data/sample-content.ts), which is labelled as sample data at the top). Notes, projects and the About text are still read straight from the sample file until the admin panel can edit them.

- Titles, excerpts, dates, series structure, projects and the About text are copied from the mockup. They are placeholders, not published work, and the footer says so (`site.sampleNotice`). No benchmark, test result or production experience is claimed anywhere.
- Article **tags** and the text of the one fully written article ("The outbox pattern") were written to fill the mockup's layout. The seven other articles have no body: their page shows the summary and a note that it is sample content.
- Topic article counts, popular tags, series progress ("3 of 10 parts published"), prev/next links, related articles and "Showing 1 to 8 of 8" are **derived** from the data, not stored. On Home the topic counts therefore read 2, 2, 2, 1, 0, 1, 0 (Flutter, Offline-First, Backend, Databases, System design, AI, Tools) instead of the mockup's 4, 3, 2, 1, 0, 0, 0 (the mockup's numbers contradict its own article list). A series part shows as **Published** exactly when a published article is filed under it.
- "Related articles" uses hand-picked slugs when the article has them (`relatedSlugs`), then falls back to shared tags and topic, never the article itself or its own series.

### Markdown pipeline

Article text is Markdown, turned into React elements on the server by `src/lib/markdown.tsx`:

1. `remark-parse` + `remark-gfm` (tables, task lists, strikethrough) to a syntax tree.
2. `remark-rehype` to HTML nodes. **Raw HTML in the source is dropped.**
3. A small plugin rewrites three shapes (table below), then `rehype-sanitize` removes everything outside an allowlist (links, images, headings, lists, tables, code).
4. `rehype-slug` adds heading ids; the `h2`/`h3` list feeds the table of contents.
5. `hast-util-to-jsx-runtime` builds React elements directly, so no HTML string is ever injected into the page.

Syntax beyond plain Markdown:

| You write                                                                          | You get                                                                                                                                                  |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A fenced block with a language                                                     | `CodeBlock`: Shiki highlighting and a copy button. Languages: sql, dart, typescript, javascript, json, bash; anything else is plain text.                |
| A paragraph that is only an image, with a title: `![alt](url "Figure 2. Caption")` | A `figure` with a caption.                                                                                                                               |
| `> **Trade-off**` followed by text                                                 | A callout box with that title.                                                                                                                           |
| A fence tagged `diagram:outbox` with `caption="..."`                               | A diagram from `DiagramFigure.tsx`. **Placeholder**: the plan is Mermaid rendered to SVG on the server; until then the one sample diagram is hand-built. |

## Page behaviour

**Articles** (`/articles`): filters live in the URL (`?topic=`, `?tag=`, `?q=`, `?sort=oldest`, `?page=`), so every state is linkable. Search matches title, summary, tags and topic name, all words required. The header search box submits here. Unknown values show "Nothing matches"; a page number out of range is clamped.

**Article** (`/articles/[slug]`): 720px reading column; sticky sidebar with a contents list (highlights the section you are in), the series panel (a window of five parts around this one) and a "Copy link" button. Below the text: references, previous/next part (a part not yet published is shown as "Coming soon" and not linked), related articles. The contents list is hidden below 1024px wide.

**Series** (`/series/[slug]`): parts link to their articles once published. "Your reading progress" is **stored only in this browser** (localStorage): a part counts as read when you scroll to the end of its article. Nothing is sent to a server.

**Projects** and **About**: text comes from the sample data. Placeholder links (repository, email) are shown as plain muted text, not as links.

## Admin panel

A private area at `/admin` for one person. There is no mockup for it in the PDF, so it is composed from the existing components and tokens (Panel, Button, FilterPill, Breadcrumb, the same colours and type) with no new visual styles. Form fields (`components/admin/fields.tsx`) use the existing `panel`, `rule`, `ink` and `rust` tokens.

### Who can get in

1. **Sign-in** is GitHub OAuth through Auth.js. After GitHub confirms who someone is, the `signIn` callback allows only the account whose numeric id equals `ADMIN_GITHUB_ID`. Anyone else is sent back to the login page with "not allowed". The panel has no passwords and no sign-up.
2. **Sessions** are signed, encrypted, `HttpOnly` cookies that last 8 hours. They hold the GitHub id plus the name, email and avatar address GitHub returns. No access tokens are stored.
3. **Every page, every server action and every data function re-checks.** `requireAdmin()` ([`src/lib/admin/session.ts`](src/lib/admin/session.ts)) reads the session and re-compares the id with the allowlist on each call, so changing `ADMIN_GITHUB_ID` locks the old account out as soon as the server restarts, even though its cookie is still valid. It is called first in each admin page, in each exported server action, and again inside every function in [`src/lib/admin/content.ts`](src/lib/admin/content.ts), the only module that reads drafts or writes content.
4. **`src/proxy.ts`** redirects visitors without an admin session to the login page and adds `Cache-Control: private, no-store` and `X-Robots-Tag: noindex`. It is deliberately **not** relied on: server actions are POSTs to the page they live on and can leave a proxy matcher after a refactor, and the layout does not re-run on navigation.
5. **Drafts never reach the public site.** Public pages read through `src/lib/content.ts`, which filters to `status: "published"` before anything else sees the data. A draft's address returns 404, and it is absent from lists, search, tag pages, topic counts and series progress.
6. **All input is validated on the server** with Zod ([`src/lib/schemas.ts`](src/lib/schemas.ts)): slug shape, lengths, real calendar dates, `http(s)`-only reference links, existing topic and series, existing related articles, one article per series part. The Markdown body then goes through the same sanitizing pipeline as the public site, so `<script>`, raw HTML and `javascript:` links are removed on render too. Server actions return only error messages and the values just typed, never stored records.
7. **Origin check.** Next.js rejects server-action POSTs whose `Origin` differs from the host; Auth.js protects its own endpoints with a CSRF token.

### What you can do

- **Articles**: create, edit, delete. Fields: title, slug (fixed after creation, since it is the URL), standfirst, summary, topic, status (Draft/Published), publication date, tags, series and part, Markdown body with a **Preview** button (rendered by the same pipeline as the public page), references (`Title | https://…` per line), related articles. Reading time is computed from the body (about 220 words a minute, never below 1 minute). "Updated" is set automatically when a published article's body changes.
- **Topics**: create, edit (name, short name, colour), delete. A topic that any article, draft or published, still uses cannot be deleted.
- **Series**: create, edit, delete. Parts are one per line (`Title | optional summary`); part numbers follow the line order. A series cannot lose a part that has an article, and cannot be deleted while articles are filed under it.
- Every save refreshes the whole public site (`revalidatePath("/", "layout")`), so a published change shows on the next visit without a rebuild.

### Where the content lives

Behind the `ContentStore` interface ([`src/lib/store`](src/lib/store/index.ts)), chosen at startup:

- **MongoDB** when `MONGODB_URI` is set. Collections `articles`, `topics`, `series` in database `MONGODB_DB` (default `blog`); each document's `_id` is its slug, so a duplicate slug is rejected by the database. Indexes on article status/date, topic and series are created on first connect. A new database is **empty** (the public site then shows empty lists); set `MONGODB_SEED_SAMPLE=true` once to load the placeholder sample content, which only happens when all three collections are empty. In Atlas, allow your machine's (and, when deployed, Vercel's) IP under Network Access.
- **A local JSON file** (`.data/content.json`, git-ignored, seeded from the sample data, replaced atomically on each write) when `MONGODB_URI` is not set. For development only. On Vercel a missing `MONGODB_URI` is a startup error rather than an empty site.

Every read happens on the server, in `src/lib/content.ts` (public, published articles only) or `src/lib/admin/content.ts` (guarded by `requireAdmin()`). The connection string never reaches the browser.

### Images (Cloudinary)

The article editor has an **Insert an image** panel: choose a JPG, PNG, WebP, GIF or AVIF (up to 8 MB), write alt text (required) and an optional caption, then **Upload and insert**. The browser asks a server action for a signature (admin only), uploads straight to Cloudinary, and the Markdown `![alt](url "caption")` is inserted at the cursor. The API secret never leaves the server; the signature fixes the folder and the allowed formats, and the URL carries `f_auto,q_auto` so Cloudinary serves the best format. A caption becomes a `figure` caption on the public page. Without the three `CLOUDINARY_*` variables the panel says upload is not configured.

## SEO

- **Titles and descriptions**: every page has a title (`%s | yourname.dev`); articles use their standfirst or summary as the description, series use their summary, topics a plain "Articles about X." Pages without their own description use the site description.
- **Canonical addresses** on every page. `/articles` with any query (`?q=`, `?tag=`, `?topic=`, `?sort=`, `?page=`) is `noindex, follow` and points at `/articles`; a topic with no articles is `noindex`.
- **Open Graph and Twitter**: article pages declare type `article` with published and modified times, section and tags. Social images are generated: `/opengraph-image` for the site and `/og/articles/<slug>` per article (title on the design's paper colours, rendered with `next/og`; the default font only, since the site fonts are not loaded into it). A draft or unknown slug returns 404 there.
- **Structured data (JSON-LD)**: `WebSite` on Home; `BlogPosting` plus `BreadcrumbList` on articles, with `isPartOf` for series parts. `<` is escaped so article text cannot close the script tag. The `author` is **left out while the author name is still the "[Your Name]" placeholder** (`src/config/site.ts`), so nothing false is published.
- **`/sitemap.xml`**: static pages, published articles (with last-modified), series, and topics that have articles. Never drafts.
- **`/robots.txt`**: allows everything except `/admin`, `/api/` and `/design-system`, and points to the sitemap. On a Vercel **preview** deployment it disallows everything and every page is `noindex`.
- **`/feed.xml`**: RSS 2.0, the 20 newest published articles, linked from every page's `<head>` and from the footer.
- Saving anything in the admin panel refreshes the sitemap and the feed along with the pages.

Before launch: set `SITE_URL`, replace the placeholder author, site name and sample content (the footer's sample notice says the content is sample), and check the result with Google Search Console and a structured-data validator, neither of which I ran.

## Accessibility

- Semantic landmarks, one `h1`, ordered headings, a "Skip to content" link (visible only on focus).
- One `:focus-visible` rule gives every link, button, input and scroll region a 2px rust ring with a 2px offset.
- Text contrast checked in both themes with a script (WCAG formula). Body text pairs are 4.75:1 or better; the lowest is rust on paper in light (4.75:1). Rust is not used for text on `tint` or `code` backgrounds, where it would fall to 4.39:1.
- Topic dots are decorative and always sit beside a text label. The amber AI dot is 2.5:1 on paper, which is acceptable only because the label carries the meaning.
- Form input has a label (visually hidden). Code blocks and tables that scroll are keyboard-focusable.
- Pages have one `h1`; breadcrumbs, pagination and the contents list are labelled `nav` landmarks; the current item uses `aria-current`; the result count on `/articles` is a polite live region.
- Article diagrams are exposed as one image with a text description; decorative arrows are hidden from screen readers.
- Buttons, nav links, footer links and pills have 44px hit areas. List links in the Topics panel follow the mockup's denser rows (about 33px, above the WCAG 2.2 minimum of 24px).

## How to test

Automated checks:

```bash
npm run format:check && npm run lint && npm run typecheck && npm run build
```

By hand (`npm run dev`, then <http://localhost:3000>):

1. Compare `/` at about 1280px wide with PDF pages 1-2, and `/design-system` with page 11.
2. Resize to about 768px and 375px: nothing scrolls sideways, the header stacks, the sidebar moves below the articles.
3. Switch your OS between light and dark mode: both themes render.
4. Press Tab from the top: skip link, wordmark, five nav links, search, then the page. Every stop shows a rust ring.
5. On `/design-system`, click **Copy code**: the label changes to "Copied" for two seconds.
6. Click the pills under "Filter pills, tags": one is selected at a time.
7. `/articles`: click a topic pill, a tag chip, change Sort to Oldest, type in the header search box and press Enter. The address bar changes each time and the list follows.
8. `/articles/outbox-pattern-write-locally-queue-transactionally`: scroll; the contents list highlights the current section and stays on screen. Click "Copy link". Scroll to the end, then open `/series/offline-first-flutter`: it reads "1 of 3 published parts read".
9. Open `/articles/nope`, `/series/nope`, `/topics/nope`: each shows the 404 page.
10. Pagination only appears with more than 8 matching articles. To see it with the sample data, temporarily set `ARTICLES_PER_PAGE` in `src/lib/content.ts` to 3.

Admin panel (set up `.env.local` first, see [Environment variables](#environment-variables-admin-panel)):

11. Open `/admin` while signed out: you land on `/admin/login`. Try `/admin/articles/new` and `/admin/articles/online-only-vs-offline-first`: same redirect.
12. Sign in with GitHub as the allowlisted account: you reach the dashboard. Sign in as any other GitHub account: "That GitHub account is not allowed".
13. **New article**: fill the form, leave Status as Draft, **Create article**. Open `/articles/<your-slug>` in a private window: 404. Search for its title on `/articles`: not listed.
14. Edit it, set Status to Published, **Save changes**: `/articles/<your-slug>` now works and it appears on Home and `/articles`.
15. Submit with a bad slug (`Bad Slug!`), an empty summary and a reference like `Broken | javascript:alert(1)`: each field shows an error and keeps what you typed.
16. Write `<script>alert(1)</script>` and `[x](javascript:alert(1))` in the body and press **Preview**: no script, no link.
17. Series: file the article under a part that already has an article (refused), then under an empty part (accepted; that part reads "Published" on `/series/offline-first-flutter`).
18. Topics: delete a topic that has articles (refused with a reason), then one that has none (accepted).
19. Open an edit form, then sign out in another tab and press Save: you are sent to the login page and nothing changes.
20. Delete the article: its address returns 404 and it leaves every list.
21. Click the sun/moon button at the right end of the navbar: the theme switches. Reload: it stays. Clear the `theme` key in browser storage: it follows your OS again.
22. With the `CLOUDINARY_*` keys set, open an article editor, use **Insert an image** (pick a file, write alt text), then **Preview**: the image appears and its Markdown is in the body. Check the file arrived in your Cloudinary media library, in the `blog` folder.

## Known limitations

- **No mockup exists for** `/series` (index), `/topics`, `/topics/[slug]` and the 404 page. I composed them from existing components and tokens and added no new styles. Please review them.
- GitHub and LinkedIn links are placeholders (`your-handle`, `your-profile`).
- Only one article has a body. The diagram is a hand-built placeholder for the later Mermaid step.
- With 8 sample articles and 8 per page, the pager never shows by default (tested with a page size of 3).
- The article contents list is hidden on screens narrower than 1024px; the other sidebar panels move below the text.
- The Sort menu needs JavaScript (it navigates on change). Filters, tags, search and paging are plain links and forms.
- Markdown images use a plain `<img>` because their size is not stored; they can cause layout shift.
- "Read" progress is marked when the end of an article scrolls into view, not by time spent.
- The About page wording is the mockup's. It states what the author works with and is learning; **confirm or rewrite it, since nothing may be claimed that is not true**.
- Dark-mode appearance is my extrapolation from the palette; the PDF shows dark swatches only, not dark pages.
- Mobile layout is my adaptation: the PDF shows desktop only. The header stacks instead of using a menu button.
- Verified in a browser: layout against the PDF (desktop), focus ring, copy buttons, search, sort, filters, reading progress, 404s, no horizontal scrolling at 375px, dark theme on the article page. Hover states were reviewed by reading the styles, not by moving a pointer over every element, and clipboard contents were not read back.
- No automated test suite yet (phase 6). Verification so far is lint, typecheck, production build and manual checks.
- `src/app/favicon.ico` is still the Next.js default.

SEO limitations: the structured data and social images were checked by reading the generated output (tags, JSON parses, valid RSS XML, image served as PNG), not with Google's or Facebook's validators. Article text is not scanned for a word count or reading-level hints. Pages have no per-article custom title/description (the title and standfirst are used).

Phase 3 limitations:

- **Real GitHub sign-in has not been tested end to end**: it needs your OAuth app and account. I tested the allowlist, redirects and actions with session cookies I signed myself using the same `AUTH_SECRET` (a throwaway script outside the repo), including a valid session for a different GitHub id and a tampered cookie. The GitHub round trip itself (`signIn` callback with a real `account`) is untested.
- **Not editable yet**: notes, projects, the About page, site settings. No per-article SEO fields (phase 5). Uploaded images cannot be listed, reused or deleted from the admin panel (manage them in Cloudinary); the 8 MB limit is checked in the browser, so enforce a limit in Cloudinary too if it matters.
- **MongoDB and Cloudinary**: the Mongo store was exercised against a scratch database on your Atlas cluster (list, create, duplicate slug, update, delete, parallel first-run seeding). The Cloudinary signature was checked against the example in Cloudinary's documentation, and the panel's not-configured path was exercised, but **no image has actually been uploaded** because no Cloudinary keys were available. Every article read loads all articles (with bodies); fine for a blog, not for thousands of posts.
- No history or undo; deleting is permanent. The file fallback is not deployable.
- `next-auth` is the v5 beta (`5.0.0-beta.32`); v5 has not had a stable release. Pin it and check its release notes before upgrading.
- Production needs `AUTH_URL` (or Vercel's automatic host detection); without it Auth.js rejects the request with `UntrustedHost`.
- No rate limiting and no audit log of admin actions. Sign-in itself is delegated to GitHub.
- Part numbers are line positions, so reordering the lines of a series changes which article is "part 3" (the editor warns in its hint text).
- Preview shows the Markdown body only, not the whole article page.
- Unknown article, series and topic addresses return a real 404 status and render correctly in a browser, but in production the HTML sent by the server for them is Next.js's client-render fallback, so without JavaScript the page is blank. I did not check whether this also happened before the phase 3 restructure into `(site)`.
- Admin form validation messages are in English only; there is no unsaved-changes warning.
- `.claude/launch.json` configures the preview server for Claude Code; delete it if you do not use that.

## Notes on the mockup

Small inconsistencies in the PDF, resolved as follows (tell me if you want them the other way):

- Series part 4 is "Sync triggers and stale acknowledgements" on Home but "Sync triggers, connectivity and stale acknowledgements" on the series page. Home's wording is used.
- Series part 5 is "Sync API design with Node.js and MongoDB" on the series page and "Sync API with Node.js and MongoDB" in the article sidebar. The shorter form is in the sample data.
- Topic counts (4, 3, 2, 1, 0, 0, 0) and "3 of 21 articles" contradict the mockup's own article list (an AI article exists although AI shows 0). Counts are derived from the sample articles instead.
- The Projects page shows four stack tags for "This publication" (Markdown included) while the Home card shows three. Both are kept (`cardStack`).
- "Published" looks dark on the article sidebar in the PDF but is green elsewhere; green is used everywhere.
- The mockup's third reference ("[Reference title]") has no address, so it is shown as muted text rather than a link.

## Open questions

1. Site name and domain (currently `[ yourname.dev ]`).
2. Which social links to publish (GitHub, LinkedIn, email, RSS).
3. Your GitHub numeric id and an OAuth app, so the real sign-in can be tried (see the environment variables).
4. Your Cloudinary keys, so image upload can be tried for real.
5. Which admin features come next: notes, projects, About, per-article SEO?

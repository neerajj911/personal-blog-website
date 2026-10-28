/**
 * Site-wide settings. Values in [square brackets] are placeholders until the
 * real details are decided (site name and domain, social links).
 */
export const site = {
  /** Shown in the header and footer as "[ yourname.dev ]". */
  domain: "yourname.dev",
  author: "[Your Name]",
  tagline:
    "Practical engineering knowledge: architecture, real implementations, debugging and trade-offs.",
  description:
    "Engineering notes on how systems actually work, and where they break. Architecture, implementation, debugging and trade-offs.",
  /** Remove once real content replaces the sample data. */
  sampleNotice: "Design mockup. All names, dates and article text are sample content.",
  nav: [
    { href: "/articles", label: "Articles" },
    { href: "/topics", label: "Topics" },
    { href: "/series", label: "Series" },
    { href: "/projects", label: "Projects" },
    { href: "/about", label: "About" },
  ],
  footerNav: [
    { href: "/articles", label: "Articles" },
    { href: "/series", label: "Series" },
    { href: "/projects", label: "Projects" },
    { href: "/about", label: "About" },
    { href: "/feed.xml", label: "RSS" },
  ],
  /** TODO: replace with the real profile URLs, or remove an entry to hide its link. */
  social: [
    { href: "https://github.com/your-handle", label: "GitHub", handle: "[your-handle]" },
    {
      href: "https://www.linkedin.com/in/your-profile",
      label: "LinkedIn",
      handle: "[your-profile]",
    },
  ],
} as const;

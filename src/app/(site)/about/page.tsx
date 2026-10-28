import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/config/site";
import { getAbout } from "@/lib/content";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Panel } from "@/components/ui/Panel";
import { TagChip } from "@/components/ui/TagChip";

export const metadata: Metadata = { title: "About" };

export default async function AboutPage() {
  const about = await getAbout();

  return (
    <div className="page-container pt-10 pb-18">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "About" }]} />
      <h1 className="mt-3 font-serif text-page-title font-bold text-ink">About</h1>

      <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[minmax(0,1fr)_23.25rem] lg:gap-[3.75rem]">
        <div>
          <p className="font-serif text-xl leading-[1.75] text-ink">{about.intro}</p>

          {about.sections.map((section) => (
            <section key={section.heading} className="mt-10">
              <h2 className="font-serif text-[1.625rem] leading-[1.25] font-bold text-ink">
                {section.heading}
              </h2>
              <p className="mt-3 font-serif text-body text-ink">{section.body}</p>
            </section>
          ))}

          <section className="mt-10">
            <h2 className="font-serif text-[1.625rem] leading-[1.25] font-bold text-ink">
              Start here
            </h2>
            <ul className="mt-3 list-disc space-y-1 pl-6 font-serif text-body marker:text-ink">
              {about.startHere.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-link hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside aria-label="Skills and contact" className="flex flex-col gap-6">
          <Panel title="Working with">
            <ul className="flex flex-wrap gap-2">
              {about.workingWith.map((item) => (
                <li key={item}>
                  <TagChip>{item}</TagChip>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Learning">
            <ul className="list-disc space-y-1 pl-5 text-ui-lg leading-snug marker:text-ink">
              {about.learning.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Panel>

          <Panel title="Elsewhere" bodyClassName="px-4 py-2">
            <ul>
              {site.social.map((item) => (
                <li
                  key={item.href}
                  className="border-b border-dotted border-rule text-ui-lg"
                >
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center text-link hover:underline"
                  >
                    {item.label}: {item.handle}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
              <li className="inline-flex min-h-11 items-center text-ui-lg text-muted">
                Email: {about.emailNote}
              </li>
            </ul>
          </Panel>
        </aside>
      </div>
    </div>
  );
}

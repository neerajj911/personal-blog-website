import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Source_Serif_4 } from "next/font/google";
import { site } from "@/config/site";
import { themeInitScript } from "@/lib/theme";
import "./globals.css";

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
  axes: ["opsz"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: `${site.domain}: engineering notes`,
    template: `%s | ${site.domain}`,
  },
  description: site.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sourceSerif.variable} ${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-screen flex-col">{children}</body>
    </html>
  );
}

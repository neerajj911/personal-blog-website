import { site } from "@/config/site";
import { ogSize, renderOgImage } from "@/lib/og";

export const alt = site.description;
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return renderOgImage({
    title: "Engineering notes on how systems actually work, and where they break.",
    kicker: "A technical journal",
  });
}

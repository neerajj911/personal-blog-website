"use client";

import { useId, useRef, useState } from "react";
import { signImageUploadAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";

const MAX_BYTES = 8 * 1024 * 1024;
const FORMATS = ["image/avif", "image/gif", "image/jpeg", "image/png", "image/webp"];

interface ImageUploaderProps {
  /** Receives the Markdown for the uploaded image to put into the body. */
  onInsert: (markdown: string) => void;
}

const field =
  "min-h-11 w-full rounded-panel border border-rule bg-panel px-3 font-sans text-ui text-ink placeholder:text-muted hover:border-muted";

/** Markdown text that cannot break out of the image syntax. */
function clean(value: string): string {
  return value
    .replace(/[\[\]\r\n"]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Uploads one image straight to Cloudinary with a server-made signature, then hands back Markdown. */
export function ImageUploader({ onInsert }: ImageUploaderProps) {
  const id = useId();
  const file = useRef<HTMLInputElement>(null);
  const [alt, setAlt] = useState("");
  const [caption, setCaption] = useState("");
  const [status, setStatus] = useState<{
    kind: "idle" | "busy" | "ok" | "error";
    text: string;
  }>({ kind: "idle", text: "" });

  async function upload() {
    const chosen = file.current?.files?.[0];
    if (!chosen) return setStatus({ kind: "error", text: "Choose an image first." });
    if (!FORMATS.includes(chosen.type)) {
      return setStatus({
        kind: "error",
        text: "Use a JPG, PNG, WebP, GIF or AVIF image.",
      });
    }
    if (chosen.size > MAX_BYTES) {
      return setStatus({ kind: "error", text: "The image is larger than 8 MB." });
    }
    if (!clean(alt)) {
      return setStatus({
        kind: "error",
        text: "Describe the image in the alt text. It is read aloud to people who cannot see it.",
      });
    }

    setStatus({ kind: "busy", text: "Uploading…" });
    try {
      const signed = await signImageUploadAction();
      if ("error" in signed) return setStatus({ kind: "error", text: signed.error });
      const { ticket } = signed;

      const body = new FormData();
      body.set("file", chosen);
      body.set("api_key", ticket.apiKey);
      body.set("timestamp", String(ticket.timestamp));
      body.set("signature", ticket.signature);
      body.set("folder", ticket.folder);
      body.set("allowed_formats", ticket.allowedFormats);

      const response = await fetch(ticket.uploadUrl, { method: "POST", body });
      const result = (await response.json()) as {
        secure_url?: string;
        error?: { message?: string };
      };
      if (!response.ok || !result.secure_url) {
        return setStatus({
          kind: "error",
          text: result.error?.message ?? "Cloudinary rejected the upload.",
        });
      }

      // f_auto,q_auto lets Cloudinary pick the best format and quality for each browser.
      const url = result.secure_url.replace("/upload/", "/upload/f_auto,q_auto/");
      const title = clean(caption);
      onInsert(`![${clean(alt)}](${url}${title ? ` "${title}"` : ""})`);
      setStatus({ kind: "ok", text: "Uploaded and inserted into the body." });
      setAlt("");
      setCaption("");
      if (file.current) file.current.value = "";
    } catch {
      setStatus({
        kind: "error",
        text: "The upload failed. Check your connection and try again.",
      });
    }
  }

  // These inputs sit inside the article form: Enter must upload, not save the article.
  function submitOnEnter(event: React.KeyboardEvent) {
    if (event.key === "Enter") {
      event.preventDefault();
      void upload();
    }
  }

  return (
    <fieldset className="rounded-panel border border-rule bg-panel p-4">
      <legend className="px-1 text-ui-sm font-semibold text-ink">Insert an image</legend>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-file`} className="text-ui-sm font-semibold text-ink">
            Image file
          </label>
          <input
            id={`${id}-file`}
            ref={file}
            type="file"
            accept={FORMATS.join(",")}
            className="text-ui text-ink file:mr-3 file:min-h-11 file:rounded-panel file:border file:border-ink file:bg-panel file:px-4 file:font-semibold"
          />
          <p className="text-ui-sm text-muted">
            JPG, PNG, WebP, GIF or AVIF, up to 8 MB.
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-alt`} className="text-ui-sm font-semibold text-ink">
            Alt text (required)
          </label>
          <input
            id={`${id}-alt`}
            value={alt}
            onChange={(event) => setAlt(event.target.value)}
            onKeyDown={submitOnEnter}
            className={field}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-caption`} className="text-ui-sm font-semibold text-ink">
            Caption (optional)
          </label>
          <input
            id={`${id}-caption`}
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            onKeyDown={submitOnEnter}
            className={field}
          />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <Button
          type="button"
          variant="secondary"
          onClick={upload}
          disabled={status.kind === "busy"}
        >
          {status.kind === "busy" ? "Uploading…" : "Upload and insert"}
        </Button>
        <p
          role={status.kind === "error" ? "alert" : "status"}
          className={
            status.kind === "error"
              ? "text-ui font-medium text-rust"
              : status.kind === "ok"
                ? "text-ui font-medium text-green"
                : "text-ui text-muted"
          }
        >
          {status.text}
        </p>
      </div>
    </fieldset>
  );
}

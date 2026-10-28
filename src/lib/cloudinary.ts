import "server-only";
import { createHash } from "node:crypto";

/**
 * Signed direct uploads to Cloudinary. The admin's browser sends the image straight to
 * Cloudinary with a signature made here, so the API secret never leaves the server and large
 * files never pass through Next.js. The signature covers `folder`, `allowed_formats` and
 * `timestamp`, so Cloudinary itself rejects other formats or a different folder.
 */

export const IMAGE_FORMATS = ["avif", "gif", "jpg", "png", "webp"] as const;

export interface UploadTicket {
  uploadUrl: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  allowedFormats: string;
}

/** Cloudinary's scheme: sort params by name, join as name=value&..., append the secret, SHA-1. */
export function signParams(
  params: Record<string, string | number>,
  secret: string,
): string {
  const base = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return createHash("sha1")
    .update(base + secret)
    .digest("hex");
}

/** Null when the three CLOUDINARY_* variables are not all set. */
export function createUploadTicket(): UploadTicket | null {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  if (!cloudName || !apiKey || !apiSecret) return null;

  const folder = process.env.CLOUDINARY_FOLDER?.trim() || "blog";
  const allowedFormats = IMAGE_FORMATS.join(",");
  const timestamp = Math.floor(Date.now() / 1000);

  return {
    uploadUrl: `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`,
    apiKey,
    timestamp,
    folder,
    allowedFormats,
    signature: signParams(
      { allowed_formats: allowedFormats, folder, timestamp },
      apiSecret,
    ),
  };
}

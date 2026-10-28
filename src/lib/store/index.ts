import "server-only";
import { fileStore } from "./file-store";
import { mongoStore } from "./mongo-store";
import type { ContentStore } from "./types";

/**
 * MongoDB when MONGODB_URI is set. Otherwise the local JSON file, for development only: on
 * Vercel (read-only filesystem) a missing MONGODB_URI is a configuration error, not a reason to
 * quietly serve an empty site.
 */
function choose(): ContentStore {
  if (process.env.MONGODB_URI) return mongoStore;
  if (process.env.VERCEL)
    throw new Error("MONGODB_URI is required when deployed on Vercel.");
  return fileStore;
}

export const store: ContentStore = choose();

export * from "./types";

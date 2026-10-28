import type { ArticleRecord, Series, SeriesPart, Topic } from "@/lib/types";

/** A series part as stored. Its public status is derived from the articles, never stored. */
export type StoredSeriesPart = Omit<SeriesPart, "status">;

export type StoredSeries = Omit<Series, "parts"> & { parts: StoredSeriesPart[] };

export class StoreConflictError extends Error {
  constructor(what: string) {
    super(`${what} already exists.`);
    this.name = "StoreConflictError";
  }
}

export class StoreNotFoundError extends Error {
  constructor(what: string) {
    super(`${what} was not found.`);
    this.name = "StoreNotFoundError";
  }
}

/** Records are keyed by slug. Slugs are never renamed after creation. */
export interface Collection<T> {
  list(): Promise<T[]>;
  get(slug: string): Promise<T | undefined>;
  /** Throws StoreConflictError when the slug is taken. */
  create(record: T): Promise<void>;
  /** Throws StoreNotFoundError when the slug does not exist. */
  update(record: T): Promise<void>;
  remove(slug: string): Promise<void>;
}

/**
 * The only thing the rest of the app knows about persistence. Phase 3 backs it with a
 * local JSON file; phase 4 backs the same interface with MongoDB.
 */
export interface ContentStore {
  articles: Collection<ArticleRecord>;
  topics: Collection<Topic>;
  series: Collection<StoredSeries>;
}

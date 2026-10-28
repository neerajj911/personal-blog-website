import "server-only";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { seedData, type StoreData } from "./seed";
import {
  StoreConflictError,
  StoreNotFoundError,
  type Collection,
  type ContentStore,
} from "./types";

/**
 * Phase 3 stand-in for the database: one JSON file, read fresh on every call and replaced
 * atomically on every write. Fine for one admin on one machine. It is NOT for production:
 * Vercel's filesystem is read-only and not shared between instances. Phase 4 replaces it.
 */
const directory = process.env.CONTENT_DATA_DIR ?? path.join(process.cwd(), ".data");
const file = path.join(directory, "content.json");

/** Writes are queued so two overlapping actions cannot overwrite each other. */
let queue: Promise<unknown> = Promise.resolve();

async function load(): Promise<StoreData> {
  try {
    return JSON.parse(await readFile(file, "utf8")) as StoreData;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    const seed = seedData();
    await save(seed);
    return seed;
  }
}

async function save(data: StoreData): Promise<void> {
  await mkdir(directory, { recursive: true });
  const temporary = `${file}.${process.pid}.tmp`;
  await writeFile(temporary, JSON.stringify(data, null, 2), "utf8");
  await rename(temporary, file);
}

function mutate<T>(change: (data: StoreData) => T): Promise<T> {
  const run = queue.then(async () => {
    const data = await load();
    const result = change(data);
    await save(data);
    return result;
  });
  queue = run.catch(() => undefined);
  return run;
}

function collection<K extends "articles" | "topics" | "series">(
  key: K,
  label: string,
): Collection<StoreData[K][number]> {
  type Item = StoreData[K][number];
  const items = (data: StoreData) => data[key] as Item[];
  const slugOf = (item: Item) => (item as { slug: string }).slug;

  return {
    async list() {
      return structuredClone(items(await load()));
    },
    async get(slug) {
      return structuredClone(items(await load()).find((item) => slugOf(item) === slug));
    },
    create(record) {
      return mutate((data) => {
        const list = items(data);
        if (list.some((item) => slugOf(item) === slugOf(record))) {
          throw new StoreConflictError(`${label} “${slugOf(record)}”`);
        }
        list.push(structuredClone(record));
      });
    },
    update(record) {
      return mutate((data) => {
        const list = items(data);
        const index = list.findIndex((item) => slugOf(item) === slugOf(record));
        if (index === -1) throw new StoreNotFoundError(`${label} “${slugOf(record)}”`);
        list[index] = structuredClone(record);
      });
    },
    remove(slug) {
      return mutate((data) => {
        const list = items(data);
        const index = list.findIndex((item) => slugOf(item) === slug);
        if (index === -1) throw new StoreNotFoundError(`${label} “${slug}”`);
        list.splice(index, 1);
      });
    },
  };
}

export const fileStore: ContentStore = {
  articles: collection("articles", "Article"),
  topics: collection("topics", "Topic"),
  series: collection("series", "Series"),
};

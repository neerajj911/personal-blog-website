import "server-only";
import { MongoClient, MongoServerError, type Db } from "mongodb";
import { seedData } from "./seed";
import {
  StoreConflictError,
  StoreNotFoundError,
  type Collection,
  type ContentStore,
} from "./types";

/**
 * MongoDB implementation of ContentStore. One collection per kind, keyed by slug (`_id`), so
 * a duplicate slug is rejected by the database itself. The connection string comes from
 * MONGODB_URI (it carries the username and password) and never leaves the server.
 */

declare global {
  var __mongoDb: Promise<Db> | undefined;
}

/** Reused across hot reloads and warm serverless invocations so connections are not leaked. */
function database(): Promise<Db> {
  globalThis.__mongoDb ??= (async () => {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI is not set.");
    // ignoreUndefined: optional fields that are undefined are left out, not stored as null.
    const client = new MongoClient(uri, { ignoreUndefined: true, maxPoolSize: 5 });
    const db = client.db(process.env.MONGODB_DB?.trim() || "blog");

    await db
      .collection("articles")
      .createIndexes([
        { key: { status: 1, publishedAt: -1 } },
        { key: { topicSlug: 1 } },
        { key: { "series.slug": 1, "series.part": 1 } },
      ]);

    // First run on an empty database: optionally load the sample content, once.
    if (process.env.MONGODB_SEED_SAMPLE === "true") {
      const empty =
        (await db.collection("articles").estimatedDocumentCount()) === 0 &&
        (await db.collection("topics").estimatedDocumentCount()) === 0 &&
        (await db.collection("series").estimatedDocumentCount()) === 0;
      if (empty) {
        const seed = seedData();
        // Upserts that only write when the slug is absent: the build starts several workers at
        // once and each of them reaches this point, so seeding must be safe to run in parallel.
        const insertMissing = async <T extends { slug: string }>(
          name: string,
          items: T[],
        ) => {
          if (items.length === 0) return;
          await db.collection<{ _id: string }>(name).bulkWrite(
            items.map((item) => ({
              updateOne: {
                filter: { _id: item.slug },
                update: { $setOnInsert: item as unknown as Record<string, unknown> },
                upsert: true,
              },
            })),
          );
        };
        await insertMissing("articles", seed.articles);
        await insertMissing("topics", seed.topics);
        await insertMissing("series", seed.series);
      }
    }
    return db;
  })().catch((error) => {
    // Do not cache a failed connection: the next request should try again.
    globalThis.__mongoDb = undefined;
    throw error;
  });
  return globalThis.__mongoDb;
}

type Doc = { _id: string };

function collection<T extends { slug: string }>(
  name: string,
  label: string,
): Collection<T> {
  const handle = async () => (await database()).collection<Doc>(name);
  const toRecord = (doc: Doc): T => {
    const { _id: _unused, ...record } = doc;
    return record as unknown as T;
  };

  return {
    async list() {
      return (await (await handle()).find().toArray()).map(toRecord);
    },
    async get(slug) {
      const doc = await (await handle()).findOne({ _id: slug });
      return doc ? toRecord(doc) : undefined;
    },
    async create(record) {
      try {
        await (
          await handle()
        ).insertOne({ ...record, _id: record.slug } as unknown as Doc);
      } catch (error) {
        if (error instanceof MongoServerError && error.code === 11000) {
          throw new StoreConflictError(`${label} “${record.slug}”`);
        }
        throw error;
      }
    },
    async update(record) {
      const result = await (
        await handle()
      ).replaceOne({ _id: record.slug }, {
        ...record,
        _id: record.slug,
      } as unknown as Doc);
      if (result.matchedCount === 0) {
        throw new StoreNotFoundError(`${label} “${record.slug}”`);
      }
    },
    async remove(slug) {
      const result = await (await handle()).deleteOne({ _id: slug });
      if (result.deletedCount === 0) throw new StoreNotFoundError(`${label} “${slug}”`);
    },
  };
}

export const mongoStore: ContentStore = {
  articles: collection("articles", "Article"),
  topics: collection("topics", "Topic"),
  series: collection("series", "Series"),
};

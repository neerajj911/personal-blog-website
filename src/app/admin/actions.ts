"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { signIn, signOut } from "@/auth";
import { createUploadTicket, type UploadTicket } from "@/lib/cloudinary";
import {
  deleteArticle,
  deleteSeries,
  deleteTopic,
  saveArticle,
  saveSeries,
  saveTopic,
  type SaveResult,
} from "@/lib/admin/content";
import { requireAdmin } from "@/lib/admin/session";
import type { FormState } from "@/lib/schemas";
import { renderMarkdown } from "@/lib/markdown";

/**
 * Server actions are public POST endpoints, so each one calls requireAdmin() (directly or
 * through lib/admin/content.ts) before doing anything. They return only a FormState: field
 * errors and the values the admin just typed, never stored records.
 */

/** Everything the public site shows can change, so refresh all of it. */
function refreshPublicSite() {
  revalidatePath("/", "layout");
  // Route handlers are cached separately from pages.
  revalidatePath("/sitemap.xml");
  revalidatePath("/feed.xml");
}

function fields(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string" && !key.startsWith("$ACTION")) values[key] = value;
  }
  return values;
}

function toState(
  result: SaveResult,
  values: Record<string, string>,
): FormState & {
  values: Record<string, string>;
} {
  return result.ok
    ? { ok: true, values }
    : {
        ok: false,
        errors: result.errors,
        message: "Fix the highlighted fields.",
        values,
      };
}

/* -------------------------------------------------------------- sign in / out */

export async function signInAction(): Promise<void> {
  await signIn("github", { redirectTo: "/admin" });
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: "/admin/login" });
}

/* ------------------------------------------------------------------ articles */

export type AdminFormState = FormState & { values?: Record<string, string> };

async function articleAction(
  mode: "create" | "update",
  formData: FormData,
): Promise<AdminFormState> {
  await requireAdmin();
  const values = fields(formData);
  const result = await saveArticle(mode, values);
  if (!result.ok) return toState(result, values);
  refreshPublicSite();
  redirect(`/admin/articles/${encodeURIComponent(values.slug?.trim() ?? "")}?saved=1`);
}

export async function createArticleAction(
  _previous: AdminFormState | undefined,
  formData: FormData,
): Promise<AdminFormState> {
  return articleAction("create", formData);
}

export async function updateArticleAction(
  _previous: AdminFormState | undefined,
  formData: FormData,
): Promise<AdminFormState> {
  return articleAction("update", formData);
}

export async function deleteArticleAction(
  _previous: AdminFormState | undefined,
  formData: FormData,
): Promise<AdminFormState> {
  await requireAdmin();
  const slug = formData.get("slug");
  if (typeof slug === "string" && slug) {
    await deleteArticle(slug);
    refreshPublicSite();
  }
  redirect("/admin/articles?deleted=1");
}

/** Renders Markdown with the same pipeline as the public page, for the editor's preview. */
export async function previewMarkdownAction(source: string): Promise<ReactNode> {
  await requireAdmin();
  if (typeof source !== "string" || source.length > 200_000) return null;
  return (await renderMarkdown(source)).content;
}

/** A short-lived signature for one direct-to-Cloudinary upload. The API secret stays here. */
export async function signImageUploadAction(): Promise<
  { ticket: UploadTicket } | { error: string }
> {
  await requireAdmin();
  const ticket = createUploadTicket();
  return ticket
    ? { ticket }
    : { error: "Image upload is not configured: set the CLOUDINARY_* variables." };
}

/* -------------------------------------------------------------------- topics */

async function topicAction(
  mode: "create" | "update",
  formData: FormData,
): Promise<AdminFormState> {
  await requireAdmin();
  const values = fields(formData);
  const result = await saveTopic(mode, values);
  if (!result.ok) return toState(result, values);
  refreshPublicSite();
  redirect("/admin/topics?saved=1");
}

export async function createTopicAction(
  _previous: AdminFormState | undefined,
  formData: FormData,
): Promise<AdminFormState> {
  return topicAction("create", formData);
}

export async function updateTopicAction(
  _previous: AdminFormState | undefined,
  formData: FormData,
): Promise<AdminFormState> {
  return topicAction("update", formData);
}

export async function deleteTopicAction(
  _previous: AdminFormState | undefined,
  formData: FormData,
): Promise<AdminFormState> {
  await requireAdmin();
  const slug = formData.get("slug");
  if (typeof slug !== "string" || !slug) redirect("/admin/topics");
  const result = await deleteTopic(slug);
  if (!result.ok) return toState(result, {});
  refreshPublicSite();
  redirect("/admin/topics?deleted=1");
}

/* -------------------------------------------------------------------- series */

async function seriesAction(
  mode: "create" | "update",
  formData: FormData,
): Promise<AdminFormState> {
  await requireAdmin();
  const values = fields(formData);
  const result = await saveSeries(mode, values);
  if (!result.ok) return toState(result, values);
  refreshPublicSite();
  redirect("/admin/series?saved=1");
}

export async function createSeriesAction(
  _previous: AdminFormState | undefined,
  formData: FormData,
): Promise<AdminFormState> {
  return seriesAction("create", formData);
}

export async function updateSeriesAction(
  _previous: AdminFormState | undefined,
  formData: FormData,
): Promise<AdminFormState> {
  return seriesAction("update", formData);
}

export async function deleteSeriesAction(
  _previous: AdminFormState | undefined,
  formData: FormData,
): Promise<AdminFormState> {
  await requireAdmin();
  const slug = formData.get("slug");
  if (typeof slug !== "string" || !slug) redirect("/admin/series");
  const result = await deleteSeries(slug);
  if (!result.ok) return toState(result, {});
  refreshPublicSite();
  redirect("/admin/series?deleted=1");
}

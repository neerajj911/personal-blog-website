import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { deleteArticleAction, updateArticleAction } from "@/app/admin/actions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { DeleteForm } from "@/components/admin/DeleteForm";
import { Notice } from "@/components/admin/Notice";
import { Button } from "@/components/ui/Button";
import { getArticleRecord, listSeriesOptions, listTopics } from "@/lib/admin/content";
import { articleToValues } from "@/lib/admin/form-values";
import { requireAdmin } from "@/lib/admin/session";
import { SLUG_PATTERN } from "@/lib/schemas";

export const metadata: Metadata = { title: "Edit article" };

export default async function EditArticlePage({
  params,
  searchParams,
}: PageProps<"/admin/articles/[slug]">) {
  await requireAdmin();
  const { slug } = await params;
  const { saved } = await searchParams;

  // The slug comes from the URL, so check its shape before it reaches the store.
  if (!SLUG_PATTERN.test(slug)) notFound();
  const article = await getArticleRecord(slug);
  if (!article) notFound();

  const [topics, series] = await Promise.all([listTopics(), listSeriesOptions()]);

  return (
    <>
      <AdminPageHeader
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Articles", href: "/admin/articles" },
          { label: article.title },
        ]}
        title="Edit article"
        actions={
          article.status === "published" ? (
            <Button href={`/articles/${article.slug}`} variant="secondary">
              View on site
            </Button>
          ) : null
        }
      />
      {saved ? <Notice>Saved.</Notice> : null}
      <ArticleForm
        mode="update"
        action={updateArticleAction}
        initial={articleToValues(article)}
        topics={topics.map(({ slug: topicSlug, name }) => ({ slug: topicSlug, name }))}
        series={series}
      />
      <div className="mt-10 max-w-xl">
        <DeleteForm
          slug={article.slug}
          what="article"
          action={deleteArticleAction}
          consequence="This removes the article and its URL from the site. It cannot be undone."
        />
      </div>
    </>
  );
}

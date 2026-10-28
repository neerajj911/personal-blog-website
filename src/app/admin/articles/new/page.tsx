import type { Metadata } from "next";
import { createArticleAction } from "@/app/admin/actions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { listSeriesOptions, listTopics } from "@/lib/admin/content";
import { articleToValues } from "@/lib/admin/form-values";
import { requireAdmin } from "@/lib/admin/session";

export const metadata: Metadata = { title: "New article" };

export default async function NewArticlePage() {
  await requireAdmin();
  const [topics, series] = await Promise.all([listTopics(), listSeriesOptions()]);

  return (
    <>
      <AdminPageHeader
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Articles", href: "/admin/articles" },
          { label: "New" },
        ]}
        title="New article"
      />
      <ArticleForm
        mode="create"
        action={createArticleAction}
        initial={articleToValues()}
        topics={topics.map(({ slug, name }) => ({ slug, name }))}
        series={series}
      />
    </>
  );
}

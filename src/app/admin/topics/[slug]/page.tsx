import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { deleteTopicAction, updateTopicAction } from "@/app/admin/actions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DeleteForm } from "@/components/admin/DeleteForm";
import { TopicForm } from "@/components/admin/TopicForm";
import { getTopicRecord } from "@/lib/admin/content";
import { topicToValues } from "@/lib/admin/form-values";
import { requireAdmin } from "@/lib/admin/session";
import { SLUG_PATTERN } from "@/lib/schemas";

export const metadata: Metadata = { title: "Edit topic" };

export default async function EditTopicPage({
  params,
}: PageProps<"/admin/topics/[slug]">) {
  await requireAdmin();
  const { slug } = await params;
  if (!SLUG_PATTERN.test(slug)) notFound();
  const topic = await getTopicRecord(slug);
  if (!topic) notFound();

  return (
    <>
      <AdminPageHeader
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Topics", href: "/admin/topics" },
          { label: topic.name },
        ]}
        title="Edit topic"
      />
      <TopicForm
        mode="update"
        action={updateTopicAction}
        initial={topicToValues(topic)}
      />
      <div className="mt-10 max-w-xl">
        <DeleteForm
          slug={topic.slug}
          what="topic"
          action={deleteTopicAction}
          consequence="A topic can only be deleted when no article, draft or published, uses it."
        />
      </div>
    </>
  );
}

import type { Metadata } from "next";
import { createTopicAction } from "@/app/admin/actions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { TopicForm } from "@/components/admin/TopicForm";
import { topicToValues } from "@/lib/admin/form-values";
import { requireAdmin } from "@/lib/admin/session";

export const metadata: Metadata = { title: "New topic" };

export default async function NewTopicPage() {
  await requireAdmin();
  return (
    <>
      <AdminPageHeader
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Topics", href: "/admin/topics" },
          { label: "New" },
        ]}
        title="New topic"
      />
      <TopicForm mode="create" action={createTopicAction} initial={topicToValues()} />
    </>
  );
}

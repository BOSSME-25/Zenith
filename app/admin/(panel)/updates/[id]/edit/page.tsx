import { notFound } from "next/navigation";
import { safeSql, isDbConfigured } from "@/lib/db";
import { UpdateForm } from "@/components/admin/UpdateForm";
import { editUpdate } from "@/app/actions/update";

export const metadata = { title: "Edit Update" };

type Row = {
  id: number;
  title: string;
  slug: string;
  body: string;
  published: boolean;
  publish_date: string;
};

export default async function EditUpdatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) notFound();
  if (!isDbConfigured()) notFound();
  const { rows } = await safeSql<Row>`SELECT id, title, slug, body, published, publish_date FROM updates WHERE id = ${numericId} LIMIT 1`;
  const post = rows[0];
  if (!post) notFound();
  const isoDate = (() => {
    try {
      return new Date(post.publish_date).toISOString().slice(0, 10);
    } catch {
      return "";
    }
  })();

  return (
    <div>
      <header className="mb-6">
        <p className="eyebrow text-eventide">Updates</p>
        <h1 className="mt-2 text-3xl font-semibold text-midnight">Edit Update</h1>
      </header>
      <div className="max-w-3xl rounded-2xl bg-white border border-ion p-6 md:p-8">
        <UpdateForm
          action={editUpdate}
          submitLabel="Save changes"
          hiddenFields={{ id: String(numericId) }}
          defaults={{
            title: post.title,
            slug: post.slug,
            body: post.body,
            published: post.published,
            publish_date: isoDate,
          }}
        />
      </div>
    </div>
  );
}

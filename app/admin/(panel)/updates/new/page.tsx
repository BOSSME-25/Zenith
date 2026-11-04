import { UpdateForm } from "@/components/admin/UpdateForm";
import { requireSection } from "@/lib/auth";
import { createUpdate } from "@/app/actions/update";

export const metadata = { title: "New Update" };

export default async function NewUpdatePage() {
  await requireSection("updates");
  return (
    <div>
      <header className="mb-6">
        <p className="eyebrow text-eventide">Updates</p>
        <h1 className="mt-2 text-3xl font-semibold text-midnight">New Update</h1>
      </header>
      <div className="max-w-3xl rounded-2xl bg-white border border-ion p-6 md:p-8">
        <UpdateForm action={createUpdate} submitLabel="Publish update" />
      </div>
    </div>
  );
}

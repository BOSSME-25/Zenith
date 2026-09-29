import { notFound } from "next/navigation";
import { safeSql } from "@/lib/db";
import { CometForm, type CometFormValues } from "@/components/admin/CometForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit Comet" };

export default async function EditCometPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cometId = Number(id);
  if (!Number.isFinite(cometId)) notFound();

  const { rows } = await safeSql<CometFormValues>`
    SELECT id, status, name, photo_url, grad_year, current_grade, milestone_type,
           headline, full_story, certifications, field_or_institution,
           current_role_or_program, mentor_opt_in, tags, consent_on_file,
           consent_recorded_by, featured_quarter
    FROM comet_profiles WHERE id = ${cometId} LIMIT 1
  `;
  const comet = rows[0];
  if (!comet) notFound();

  return (
    <div className="max-w-3xl">
      <header className="mb-6">
        <p className="eyebrow text-eventide">Comets</p>
        <h1 className="mt-2 text-3xl font-semibold text-midnight">Edit {comet.name}</h1>
      </header>
      <CometForm
        comet={{
          ...comet,
          full_story: comet.full_story ?? "",
          certifications: comet.certifications ?? [],
          tags: comet.tags ?? [],
        }}
      />
    </div>
  );
}

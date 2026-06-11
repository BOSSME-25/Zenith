import { notFound } from "next/navigation";
import { safeSql } from "@/lib/db";
import { IssueForm, type IssueDefaults } from "@/components/admin/IssueForm";
import { editIssue } from "@/app/actions/newsletter-issue";
import type { IssueEvent } from "@/lib/validators";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit Newsletter Issue" };

type Row = {
  id: number;
  issue_number: number;
  month_label: string;
  published: boolean;
  hero_image_url: string | null;
  hero_title: string;
  hero_text: string | null;
  hero_cta_label: string | null;
  hero_cta_url: string | null;
  founder_note: string | null;
  spotlight_image_url: string | null;
  spotlight_name: string | null;
  spotlight_text: string | null;
  events: IssueEvent[] | null;
  classroom_title: string | null;
  classroom_text: string | null;
  stat_value: string | null;
  stat_text: string | null;
};

export default async function EditIssuePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const issueId = Number(id);
  if (!Number.isFinite(issueId)) notFound();

  const { rows } = await safeSql<Row>`SELECT * FROM newsletter_issues WHERE id = ${issueId} LIMIT 1`;
  const issue = rows[0];
  if (!issue) notFound();

  const defaults: IssueDefaults = {
    issue_number: issue.issue_number,
    month_label: issue.month_label,
    published: issue.published,
    hero_image_url: issue.hero_image_url ?? "",
    hero_title: issue.hero_title,
    hero_text: issue.hero_text ?? "",
    hero_cta_label: issue.hero_cta_label ?? "",
    hero_cta_url: issue.hero_cta_url ?? "",
    founder_note: issue.founder_note ?? "",
    spotlight_image_url: issue.spotlight_image_url ?? "",
    spotlight_name: issue.spotlight_name ?? "",
    spotlight_text: issue.spotlight_text ?? "",
    events: issue.events ?? [],
    classroom_title: issue.classroom_title ?? "",
    classroom_text: issue.classroom_text ?? "",
    stat_value: issue.stat_value ?? "",
    stat_text: issue.stat_text ?? "",
  };

  return (
    <div>
      <header className="mb-6">
        <p className="eyebrow text-eventide">Newsletter</p>
        <h1 className="mt-2 text-3xl font-semibold text-midnight">
          Edit Issue #{String(issue.issue_number).padStart(2, "0")}
        </h1>
      </header>
      <div className="max-w-3xl">
        <IssueForm
          action={editIssue}
          defaults={defaults}
          submitLabel="Save issue"
          hiddenFields={{ id: String(issue.id) }}
        />
      </div>
    </div>
  );
}

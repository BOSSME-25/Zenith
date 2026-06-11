import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Section } from "@/components/Section";
import { NewsletterIssue, type IssueData } from "@/components/NewsletterIssue";
import { safeSql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const issueId = Number(id);
  if (!Number.isFinite(issueId)) return { title: "Newsletter" };
  const { rows } = await safeSql<{ issue_number: number; month_label: string }>`
    SELECT issue_number, month_label FROM newsletter_issues
    WHERE id = ${issueId} AND published = TRUE LIMIT 1
  `;
  const issue = rows[0];
  return {
    title: issue
      ? `The Comet Trail — Issue ${String(issue.issue_number).padStart(2, "0")} (${issue.month_label})`
      : "Newsletter",
  };
}

export default async function NewsletterIssuePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const issueId = Number(id);
  if (!Number.isFinite(issueId)) notFound();

  const { rows } = await safeSql<IssueData>`
    SELECT * FROM newsletter_issues WHERE id = ${issueId} AND published = TRUE LIMIT 1
  `;
  const issue = rows[0];
  if (!issue) notFound();

  return (
    <Section bg="white">
      <div className="max-w-3xl mx-auto mb-8">
        <Link
          href="/newsletter"
          className="inline-flex items-center gap-2 text-sm font-semibold text-eventide hover:text-midnight"
        >
          <ArrowLeft size={16} aria-hidden /> Latest issue
        </Link>
      </div>
      <NewsletterIssue issue={issue} />
    </Section>
  );
}

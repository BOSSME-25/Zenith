import { IssueForm } from "@/components/admin/IssueForm";
import { createIssue } from "@/app/actions/newsletter-issue";

export const metadata = { title: "New Newsletter Issue" };

export default function NewIssuePage() {
  return (
    <div>
      <header className="mb-6">
        <p className="eyebrow text-eventide">Newsletter</p>
        <h1 className="mt-2 text-3xl font-semibold text-midnight">New Issue</h1>
        <p className="mt-2 text-midnight-75 max-w-2xl">
          Fill in each section below — every field maps to a spot in The Comet Trail layout. Sections
          you leave empty are simply hidden on the published page.
        </p>
      </header>
      <div className="max-w-3xl">
        <IssueForm
          action={createIssue}
          submitLabel="Save issue"
          draftKey="zenith:newsletter:new-draft"
        />
      </div>
    </div>
  );
}

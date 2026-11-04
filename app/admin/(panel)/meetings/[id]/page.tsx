import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import {
  type DocRow,
  getAdminMeeting,
  getNoticeLocation,
  getPosters,
  listAdminMeetings,
} from "@/lib/meetings";
import {
  type DocKind,
  attendanceOf,
  DOC_KIND_LABELS,
  MEETING_TYPE_LABELS,
  documentBaseName,
  effectiveStatus,
  formatBytes,
  formatMeetingDate,
  formatMeetingTime,
  formatStamp,
  phoenixDateKey,
  toPhoenixInput,
} from "@/lib/meetings-shared";
import { MeetingForm } from "@/components/admin/MeetingForm";
import { MeetingActionForm } from "@/components/admin/MeetingActionForm";
import { DocumentUploader } from "@/components/admin/DocumentUploader";
import { NoticeLocationBanner } from "@/components/admin/NoticeLocationBanner";
import { inputClass, labelClass } from "@/components/forms/FormStatus";
import {
  cancelMeeting,
  discardDraft,
  moveMeeting,
  publishNotice,
  withdrawDocument,
} from "@/app/actions/meeting";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit meeting" };

const ACTION_LABELS: Record<string, string> = {
  created: "Created as a draft",
  added_to_archive: "Added to the archive",
  edited: "Edited",
  blocked_change: "Change blocked by the 24-hour rule",
  blocked_publish: "Publish blocked by the 24-hour rule",
  published: "Notice published",
  cancelled: "Cancelled",
  rescheduled: "Moved to another meeting",
  document_added: "File added",
  document_replaced: "File replaced",
  document_withdrawn: "File withdrawn",
};

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-white border border-ion p-6 md:p-8">
      <h2 className="eyebrow text-eventide">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function nextBase(docs: DocRow[], kind: DocKind, dateKey: string) {
  const max = docs.filter((d) => d.kind === kind).reduce((n, d) => Math.max(n, d.version), 0);
  return documentBaseName(kind, dateKey, max + 1);
}

function DocLink({ doc }: { doc: DocRow }) {
  return (
    <a
      href={doc.blob_url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 font-semibold text-eventide underline underline-offset-2 hover:text-midnight"
    >
      {doc.label}, PDF{doc.size_bytes ? `, ${formatBytes(doc.size_bytes)}` : ""}
      <ExternalLink size={14} aria-hidden />
    </a>
  );
}

export default async function EditMeetingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const { id } = await params;
  const { created } = await searchParams;
  const data = await getAdminMeeting(id);
  if (!data) notFound();
  const { meeting: m, docs, audit } = data;
  const posters = await getPosters();
  const { location: noticeLocation } = await getNoticeLocation();
  const dateKey = phoenixDateKey(m.starts_at);
  const eff = effectiveStatus(m);
  const active = docs.filter((d) => !d.superseded_at && !d.withdrawn_at);
  const activeOf = (k: DocKind) => active.filter((d) => d.kind === k);
  const everyMeeting = await listAdminMeetings();
  const others = everyMeeting.filter(
    (o) => o.id !== m.id && o.status === "scheduled" && o.starts_at.getTime() > Date.now(),
  );
  const movedTo = m.rescheduled_to ? everyMeeting.find((o) => o.id === m.rescheduled_to) : null;

  const formValues = {
    id: m.id,
    title: m.title,
    meeting_type: m.meeting_type,
    committee_name: m.committee_name ?? "",
    starts_at: toPhoenixInput(m.starts_at),
    ends_at: m.ends_at ? toPhoenixInput(m.ends_at) : "",
    location_name: m.location_name ?? "",
    location_address: m.location_address ?? "",
    virtual_url: m.virtual_url ?? "",
    virtual_meeting_id: m.virtual_meeting_id ?? "",
    virtual_passcode: m.virtual_passcode ?? "",
    dial_in: m.dial_in ?? "",
    recording_url: m.recording_url ?? "",
    public_note: m.public_note ?? "",
    emergency_reason: m.emergency_reason ?? "",
    attendance: attendanceOf(m),
  };

  const canDiscard = m.status === "draft" && !m.notice_posted_at && docs.length === 0;

  return (
    <div className="space-y-6 max-w-3xl">
      <header>
        <Link href="/admin/meetings" className="text-sm text-eventide hover:underline">
          Back to meetings
        </Link>
        <p className="eyebrow text-eventide mt-4">{MEETING_TYPE_LABELS[m.meeting_type]} meeting</p>
        <h1 className="mt-2 text-3xl font-semibold text-midnight">{m.title}</h1>
        <p className="mt-1 text-midnight-75">
          {formatMeetingDate(m.starts_at)}, {formatMeetingTime(m.starts_at, m.ends_at)}
        </p>
        {m.status !== "draft" && (
          <p className="mt-3">
            <a
              href={`/public-meetings/${m.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-eventide underline underline-offset-2"
            >
              View the public page <ExternalLink size={14} aria-hidden />
            </a>
          </p>
        )}
      </header>

      <NoticeLocationBanner />

      {created && (
        <div role="status" className="rounded-xl border border-aurora bg-aurora-25 p-4 text-sm text-midnight">
          Saved as a draft. Nothing is public yet. Add the agenda below, then publish the notice.
        </div>
      )}

      <Card title="Notice">
        {m.status === "draft" && (
          <div className="space-y-5">
            <p className="text-midnight">
              <strong className="font-semibold">Draft.</strong> The public cannot see this meeting.
              Publishing records the date and time you posted, which is the proof the notice went up
              on time.
            </p>
            <MeetingActionForm
              action={publishNotice}
              hidden={{ id: m.id }}
              posters={posters}
              submitLabel="Publish notice"
              pendingLabel="Publishing…"
              confirmText={`Post this notice?\n\n${m.title}\n${formatMeetingDate(m.starts_at)}\n${formatMeetingTime(m.starts_at, m.ends_at)}\n\nCheck the date and time. This is what the public will see.`}
            />
            {canDiscard && (
              <div className="border-t border-ion pt-5">
                <p className="text-sm text-midnight-75 mb-3">
                  Entered by mistake? A draft that was never posted can be discarded.
                </p>
                <MeetingActionForm
                  action={discardDraft}
                  hidden={{ id: m.id }}
                  posters={posters}
                  submitLabel="Discard this draft"
                  tone="danger"
                  confirmText="Discard this draft? It was never public."
                />
              </div>
            )}
          </div>
        )}

        {m.status === "scheduled" && (
          <div className="space-y-6">
            <p className="text-midnight">
              <strong className="font-semibold">{eff === "held" ? "Held." : "Posted."}</strong>{" "}
              {m.notice_posted_at && <>Notice posted {formatStamp(m.notice_posted_at)}. </>}
              {m.agenda_posted_at && <>Agenda posted {formatStamp(m.agenda_posted_at)}.</>}
            </p>
            {eff !== "held" && (
              <ul className="space-y-2 rounded-xl border border-ion bg-ion-soft p-4 text-sm text-midnight list-disc pl-8">
                <li>
                  Open the{" "}
                  <a href={`/public-meetings/${m.slug}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-eventide underline">
                    public page
                  </a>{" "}
                  and check the date, time, place, and agenda link.
                </li>
                <li>
                  Print the agenda and post it at{" "}
                  {noticeLocation ? <strong className="font-semibold">{noticeLocation}</strong> : "the physical posting location (not set yet, see Site settings)"}.
                  The law needs both places.
                </li>
                {m.meeting_type === "emergency" && (
                  <li>
                    <strong className="font-semibold">Emergency meeting.</strong> Emergency meetings
                    follow a separate, shorter notice path. Check with the board&apos;s counsel.
                  </li>
                )}
                {activeOf("agenda").length === 0 && (
                  <li>
                    <strong className="font-semibold">No agenda yet.</strong> It is due at least 24
                    hours before the meeting. Upload it below.
                  </li>
                )}
              </ul>
            )}
            {eff !== "held" && (
              <div className="grid gap-8 md:grid-cols-2">
                <div>
                  <h3 className="text-sm font-semibold text-midnight mb-3">Cancel this meeting</h3>
                  <MeetingActionForm
                    action={cancelMeeting}
                    hidden={{ id: m.id }}
                    posters={posters}
                    submitLabel="Cancel meeting"
                    tone="danger"
                    confirmText="Cancel this meeting? The public page will show it as cancelled."
                  >
                    <div>
                      <label className={labelClass} htmlFor="cancel_reason">Reason (shown publicly)</label>
                      <input id="cancel_reason" name="reason" type="text" maxLength={300} className={inputClass} />
                    </div>
                  </MeetingActionForm>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-midnight mb-3">Move to a new date</h3>
                  {others.length === 0 ? (
                    <p className="text-sm text-midnight-75">
                      First create and publish the meeting for the new date, then come back and pick
                      it here.
                    </p>
                  ) : (
                    <MeetingActionForm
                      action={moveMeeting}
                      hidden={{ id: m.id }}
                      posters={posters}
                      submitLabel="Move meeting"
                      confirmText="Mark this meeting as moved to the one you picked?"
                    >
                      <div>
                        <label className={labelClass} htmlFor="new_id">It moved to</label>
                        <select id="new_id" name="new_id" defaultValue="" className={inputClass}>
                          <option value="" disabled>Pick the new meeting</option>
                          {others.map((o) => (
                            <option key={o.id} value={o.id}>
                              {formatMeetingDate(o.starts_at)}, {o.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    </MeetingActionForm>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {m.status === "cancelled" && (
          <p className="text-midnight">
            <strong className="font-semibold">Cancelled.</strong> Reason shown publicly: {m.status_reason}. It
            stays on the public page as a cancelled row. Take down the printed notice and post a
            cancellation notice.
          </p>
        )}
        {m.status === "rescheduled" && (
          <p className="text-midnight">
            <strong className="font-semibold">Moved</strong>
            {movedTo ? (
              <>
                {" "}to{" "}
                <Link href={`/admin/meetings/${movedTo.id}`} className="font-semibold text-eventide underline">
                  {formatMeetingDate(movedTo.starts_at)}
                </Link>
              </>
            ) : null}
            . Replace the printed notice with one for the new date.
          </p>
        )}
        {m.status === "held" && (
          <p className="text-midnight">
            <strong className="font-semibold">Held.</strong> This meeting is in the archive.
          </p>
        )}
      </Card>

      <Card title="Details">
        <MeetingForm values={formValues} posters={posters} mode="edit" />
      </Card>

      <Card title="Agenda">
        {activeOf("agenda").length > 0 ? (
          <p className="mb-4"><DocLink doc={activeOf("agenda")[0]} /></p>
        ) : (
          <p className="mb-4 text-midnight-75">No agenda yet.</p>
        )}
        <DocumentUploader
          meetingId={m.id}
          kind="agenda"
          fileBaseName={nextBase(docs, "agenda", dateKey)}
          posters={posters}
          submitLabel={activeOf("agenda").length > 0 ? "Replace agenda" : "Upload agenda"}
        />
      </Card>

      <Card title="Minutes">
        {activeOf("minutes").length > 0 ? (
          <p className="mb-4">
            <DocLink doc={activeOf("minutes")[0]} />{" "}
            <span className="text-sm text-midnight-75">
              {m.minutes_status === "approved"
                ? `Approved${m.minutes_approved_at ? ` ${formatMeetingDate(m.minutes_approved_at)}` : ""}`
                : "Draft, pending board approval"}
            </span>
          </p>
        ) : (
          <p className="mb-4 text-midnight-75">
            No minutes yet. They are due for public inspection within three working days of the
            meeting.
          </p>
        )}
        <DocumentUploader
          meetingId={m.id}
          kind="minutes"
          fileBaseName={nextBase(docs, "minutes", dateKey)}
          posters={posters}
          submitLabel={activeOf("minutes").length > 0 ? "Replace minutes" : "Upload minutes"}
        />
      </Card>

      <Card title="Board packet and other materials">
        {[...activeOf("packet"), ...activeOf("other")].length > 0 && (
          <ul className="mb-4 space-y-1">
            {[...activeOf("packet"), ...activeOf("other")].map((d) => (
              <li key={d.id}><DocLink doc={d} /></li>
            ))}
          </ul>
        )}
        <div className="space-y-8">
          <DocumentUploader
            meetingId={m.id}
            kind="packet"
            fileBaseName={nextBase(docs, "packet", dateKey)}
            posters={posters}
            submitLabel="Add board packet"
          />
          <div className="border-t border-ion pt-6">
            <DocumentUploader
              meetingId={m.id}
              kind="other"
              fileBaseName={nextBase(docs, "other", dateKey)}
              posters={posters}
              submitLabel="Add other document"
            />
          </div>
        </div>
      </Card>

      {docs.length > 0 && (
        <Card title="Files on record">
          <p className="text-sm text-midnight-75 mb-4">
            Nothing here is ever deleted. A replaced file stays in storage and in the log. A
            withdrawn file disappears from the public page, with your reason kept.
          </p>
          <ul className="divide-y divide-ion">
            {docs.map((d) => (
              <li key={d.id} className="py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <DocLink doc={d} />
                    <p className="text-xs text-midnight-75">
                      {DOC_KIND_LABELS[d.kind]}, version {d.version}, added {formatStamp(d.uploaded_at)}
                      {d.uploaded_by ? ` by ${d.uploaded_by}` : ""}.{" "}
                      {d.withdrawn_at
                        ? `Withdrawn ${formatStamp(d.withdrawn_at)}: ${d.withdrawn_reason}.`
                        : d.superseded_at
                          ? "Replaced by a newer version."
                          : "Live on the public page."}
                    </p>
                  </div>
                </div>
                {!d.withdrawn_at && !d.superseded_at && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm font-semibold text-red-700 min-h-11 inline-flex items-center">
                      Withdraw this file
                    </summary>
                    <div className="mt-3 max-w-md">
                      <MeetingActionForm
                        action={withdrawDocument}
                        hidden={{ doc_id: d.id }}
                        posters={posters}
                        submitLabel="Withdraw file"
                        tone="danger"
                        confirmText="Withdraw this file from the public page?"
                      >
                        <div>
                          <label className={labelClass} htmlFor={`withdraw_${d.id}`}>Reason</label>
                          <input id={`withdraw_${d.id}`} name="reason" type="text" maxLength={300} className={inputClass} />
                        </div>
                      </MeetingActionForm>
                    </div>
                  </details>
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card title="History">
        {audit.length === 0 ? (
          <p className="text-midnight-75">Nothing yet.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {audit.map((a) => (
              <li key={a.id} className="text-midnight">
                <span className="text-midnight-75">{formatStamp(a.at)}</span>{" "}
                <strong className="font-semibold">{ACTION_LABELS[a.action] ?? a.action}</strong> by {a.actor}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

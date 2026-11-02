import { ExternalLink, FileText, PlayCircle } from "lucide-react";
import type { DocRow, MeetingWithDocs } from "@/lib/meetings";
import { formatBytes } from "@/lib/meetings-shared";
import { cn } from "@/lib/cn";

const BUTTON =
  "inline-flex min-h-11 items-center gap-2 rounded-full border border-eventide px-4 py-2 text-sm font-semibold text-midnight hover:bg-ion-soft transition-colors";

/** "Agenda, PDF, 210 KB": every file names its type and size. */
export function DocButton({ doc, label, className }: { doc: DocRow; label?: string; className?: string }) {
  const size = formatBytes(doc.size_bytes);
  const text = `${label ?? doc.label}, PDF${size ? `, ${size}` : ""}`;
  return (
    <a
      href={doc.blob_url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${text} (opens in a new tab)`}
      className={cn(BUTTON, className)}
    >
      <FileText size={16} aria-hidden />
      {text}
      <ExternalLink size={13} aria-hidden className="opacity-70" />
    </a>
  );
}

/** Agenda, minutes, recording and materials for one meeting. */
export function MeetingDocs({ meeting }: { meeting: MeetingWithDocs }) {
  const agenda = meeting.docs.find((d) => d.kind === "agenda");
  const minutes = meeting.docs.find((d) => d.kind === "minutes");
  const materials = meeting.docs.filter((d) => d.kind === "packet" || d.kind === "other");

  return (
    <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-[7rem_1fr] text-sm">
      <dt className="font-semibold text-midnight">Agenda</dt>
      <dd>
        {agenda ? (
          <DocButton doc={agenda} label="Agenda" />
        ) : (
          <span className="text-midnight-75">Agenda not posted yet</span>
        )}
      </dd>

      <dt className="font-semibold text-midnight">Minutes</dt>
      <dd>
        {minutes ? (
          meeting.minutes_status === "approved" ? (
            <DocButton doc={minutes} label="Minutes" />
          ) : (
            <span className="flex flex-wrap items-center gap-3">
              <DocButton doc={minutes} label="Minutes (draft)" />
              <span className="text-midnight-75">Draft minutes, pending board approval</span>
            </span>
          )
        ) : (
          <span className="text-midnight-75">Minutes pending</span>
        )}
      </dd>

      {meeting.recording_url && (
        <>
          <dt className="font-semibold text-midnight">Recording</dt>
          <dd>
            <a
              href={meeting.recording_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Meeting recording (opens in a new tab)"
              className={BUTTON}
            >
              <PlayCircle size={16} aria-hidden /> Watch the recording
              <ExternalLink size={13} aria-hidden className="opacity-70" />
            </a>
          </dd>
        </>
      )}

      {materials.length > 0 && (
        <>
          <dt className="font-semibold text-midnight">Materials</dt>
          <dd className="flex flex-wrap gap-3">
            {materials.map((d) => (
              <DocButton key={d.id} doc={d} />
            ))}
          </dd>
        </>
      )}
    </dl>
  );
}

import Image from "next/image";
import { Award, GraduationCap, Sparkles } from "lucide-react";
import { MILESTONE_LABELS, type MilestoneType } from "@/lib/validators";
import { MentorConnectDialog } from "./MentorConnectDialog";
import { cn } from "@/lib/cn";

/**
 * The public shape of a Comet. Deliberately narrower than the database row —
 * nominator email, nominee contact details, and consent records never reach
 * the client.
 */
export type PublicComet = {
  id: number;
  status: "in_motion" | "landed";
  name: string;
  photo_url: string | null;
  grad_year: number | null;
  current_grade: number | null;
  milestone_type: MilestoneType;
  headline: string;
  full_story: string;
  certifications: string[];
  field_or_institution: string | null;
  current_role_or_program: string | null;
  mentor_opt_in: boolean;
  tags: string[];
};

function Initials({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <div
      aria-hidden
      className="h-16 w-16 flex-none rounded-full bg-eventide/15 text-eventide grid place-items-center text-lg font-semibold"
    >
      {initials || "★"}
    </div>
  );
}

export function CometCard({ comet }: { comet: PublicComet }) {
  const inMotion = comet.status === "in_motion";
  const contextLine = inMotion
    ? [comet.current_grade ? `${comet.current_grade}th grade` : null, comet.field_or_institution]
        .filter(Boolean)
        .join(" · ")
    : [comet.grad_year ? `Class of ${comet.grad_year}` : null, comet.current_role_or_program]
        .filter(Boolean)
        .join(" · ");

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-2xl bg-white border border-ion p-6 flex flex-col",
        inMotion && "comet-trail",
      )}
    >
      <div className="flex items-start gap-4">
        {comet.photo_url ? (
          <Image
            src={comet.photo_url}
            alt=""
            width={64}
            height={64}
            className="h-16 w-16 flex-none rounded-full object-cover border border-ion"
          />
        ) : (
          <Initials name={comet.name} />
        )}
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-midnight">{comet.name}</h3>
          {contextLine && <p className="mt-0.5 text-sm text-midnight-75">{contextLine}</p>}
          <span
            className={cn(
              "mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
              inMotion ? "bg-ion-soft text-eventide" : "bg-aurora-25 text-eventide",
            )}
          >
            {inMotion ? <Sparkles size={13} aria-hidden /> : <GraduationCap size={13} aria-hidden />}
            {inMotion ? "In Motion" : "Landed"}
          </span>
        </div>
      </div>

      <p className="mt-5 text-base leading-relaxed text-midnight">{comet.headline}</p>

      {comet.full_story && comet.full_story !== comet.headline && (
        <details className="mt-3 group">
          <summary className="cursor-pointer list-none text-sm font-semibold text-aurora hover:text-eventide">
            Read their story
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-midnight-75 whitespace-pre-wrap">
            {comet.full_story}
          </p>
        </details>
      )}

      {comet.certifications.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Certifications earned">
          {comet.certifications.map((c) => (
            <li
              key={c}
              className="inline-flex items-center gap-1.5 rounded-full border border-ion bg-ion-soft px-3 py-1 text-xs font-medium text-midnight"
            >
              <Award size={12} aria-hidden className="text-eventide" />
              {c}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto pt-5">
        <p className="text-xs uppercase tracking-[0.14em] text-eventide">
          {MILESTONE_LABELS[comet.milestone_type]}
        </p>
        {comet.mentor_opt_in && (
          <div className="mt-3">
            <MentorConnectDialog cometId={comet.id} cometName={comet.name} />
          </div>
        )}
      </div>
    </article>
  );
}

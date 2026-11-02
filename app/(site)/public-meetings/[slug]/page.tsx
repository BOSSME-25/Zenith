import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Section } from "@/components/Section";
import { JsonLd } from "@/components/JsonLd";
import { MeetingDocs } from "@/components/meetings/MeetingDocs";
import { StatusNote } from "@/components/meetings/MeetingRow";
import { meetingEventJsonLd } from "@/components/meetings/eventJsonLd";
import { getNoticeLocation, getPublicMeeting, listPublicMeetings } from "@/lib/meetings";
import {
  MEETING_TYPE_LABELS,
  formatMeetingDate,
  formatMeetingTime,
} from "@/lib/meetings-shared";

export const dynamic = "force-dynamic";

async function load(slug: string) {
  try {
    return await getPublicMeeting(slug);
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const m = await load(slug);
  if (!m) return { title: "Meeting not found", robots: { index: false } };
  return {
    title: `${m.title}, ${formatMeetingDate(m.starts_at)}`,
    description: `Agenda, minutes, and details for the ${MEETING_TYPE_LABELS[m.meeting_type]} meeting of Zenith's board on ${formatMeetingDate(m.starts_at)}.`,
    alternates: { canonical: `/public-meetings/${m.slug}` },
  };
}

export default async function MeetingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const m = await load(slug);
  if (!m) notFound();

  const movedTo = m.rescheduled_to
    ? ((await listPublicMeetings()).find((o) => o.id === m.rescheduled_to) ?? null)
    : null;
  const { location } = await getNoticeLocation();
  const physical = [m.location_name, m.location_address].filter(Boolean).join(", ");

  return (
    <>
      <JsonLd data={meetingEventJsonLd(m)} />
      <Section
        eyebrow={`${MEETING_TYPE_LABELS[m.meeting_type]} meeting${m.committee_name ? `, ${m.committee_name}` : ""}`}
        title={formatMeetingDate(m.starts_at)}
        titleAs="h1"
        bg="white"
      >
        <p className="-mt-6 mb-6">
          <Link href="/public-meetings#archive" className="text-sm font-semibold text-eventide underline underline-offset-2">
            Back to all meetings
          </Link>
        </p>

        <div className="max-w-3xl space-y-6">
          <div className="space-y-1 text-midnight">
            <p className="text-xl font-semibold">{m.title}</p>
            <p>{formatMeetingTime(m.starts_at, m.ends_at)}</p>
            {physical && <p>{physical}</p>}
            {m.virtual_url && (
              <p>
                <a
                  href={m.virtual_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-eventide underline underline-offset-2"
                >
                  Join online
                </a>
                {m.virtual_meeting_id && <span>, meeting ID {m.virtual_meeting_id}</span>}
                {m.virtual_passcode && <span>, passcode {m.virtual_passcode}</span>}
              </p>
            )}
            {m.dial_in && <p>Dial in: {m.dial_in}</p>}
          </div>

          <StatusNote meeting={m} movedTo={movedTo} />
          {m.meeting_type === "emergency" && m.emergency_reason && (
            <p className="rounded-xl border border-ion bg-ion-soft p-4 text-sm text-midnight">
              <span className="font-semibold">Emergency meeting.</span> {m.emergency_reason}
            </p>
          )}
          {m.public_note && <p className="text-midnight-75">{m.public_note}</p>}

          <div className="rounded-2xl border border-ion bg-white p-6">
            <h2 className="text-lg font-semibold text-midnight mb-4">Documents</h2>
            <MeetingDocs meeting={m} />
          </div>

          <p className="text-sm leading-relaxed text-midnight-75">
            Notices and agendas are posted at least 24 hours before each meeting on the{" "}
            <Link href="/public-meetings" className="font-semibold text-eventide underline underline-offset-2">
              Public Meetings page
            </Link>
            {location ? `, and at ${location}` : ""}.
          </p>
        </div>
      </Section>
    </>
  );
}

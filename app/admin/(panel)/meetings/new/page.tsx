import { MeetingForm } from "@/components/admin/MeetingForm";
import { requireSection } from "@/lib/auth";
import { NoticeLocationBanner } from "@/components/admin/NoticeLocationBanner";
import { ATTENDANCE, EMPTY_MEETING, MEETING_TYPES, type MeetingFormValues } from "@/lib/meetings-shared";

export const dynamic = "force-dynamic";
export const metadata = { title: "New meeting" };

const TEXT_KEYS = [
  "title",
  "committee_name",
  "starts_at",
  "ends_at",
  "location_name",
  "location_address",
  "virtual_url",
  "virtual_meeting_id",
  "virtual_passcode",
  "dial_in",
  "public_note",
] as const;

/**
 * A link can open this form already filled in (for example the next monthly
 * meeting), so the Secretary checks it and saves instead of typing it all. The
 * values only become the starting contents of the fields; nothing is saved
 * until the form is submitted.
 */
function prefill(params: Record<string, string | string[] | undefined>): MeetingFormValues {
  const one = (k: string) => {
    const v = params[k];
    return (Array.isArray(v) ? v[0] : v) ?? "";
  };
  const values: MeetingFormValues = { ...EMPTY_MEETING };
  for (const k of TEXT_KEYS) {
    const v = one(k).slice(0, 500);
    if (v) values[k] = v;
  }
  const type = one("type");
  if ((MEETING_TYPES as readonly string[]).includes(type)) {
    values.meeting_type = type as MeetingFormValues["meeting_type"];
  }
  const attendance = one("attendance");
  if ((ATTENDANCE as readonly string[]).includes(attendance)) {
    values.attendance = attendance as MeetingFormValues["attendance"];
  }
  return values;
}

export default async function NewMeetingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireSection("meetings");
  const values = prefill(await searchParams);
  return (
    <div>
      <header className="mb-6">
        <p className="eyebrow text-eventide">Meetings</p>
        <h1 className="mt-2 text-3xl font-semibold text-midnight">New meeting</h1>
        <p className="mt-2 text-midnight-75 max-w-2xl">
          Save the details first. The agenda, minutes and the Publish notice button appear on the
          next screen. Aim to post at least 72 hours ahead; 24 hours is the legal minimum, not the
          target.
        </p>
      </header>
      <NoticeLocationBanner />
      <div className="max-w-3xl rounded-2xl bg-white border border-ion p-6 md:p-8">
        <MeetingForm values={values} mode="create" />
      </div>
    </div>
  );
}

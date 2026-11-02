import { MeetingForm, EMPTY_MEETING } from "@/components/admin/MeetingForm";
import { NoticeLocationBanner } from "@/components/admin/NoticeLocationBanner";
import { getPosters } from "@/lib/meetings";

export const dynamic = "force-dynamic";
export const metadata = { title: "New meeting" };

export default async function NewMeetingPage() {
  const posters = await getPosters();
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
        <MeetingForm values={EMPTY_MEETING} posters={posters} mode="create" />
      </div>
    </div>
  );
}

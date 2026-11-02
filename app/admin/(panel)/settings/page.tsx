import {
  AccommodationForm,
  EnrollmentPopupForm,
  NondiscriminationForm,
  NoticeLocationForm,
  PostersForm,
  SchedulePdfForm,
  SchoolYearForm,
} from "@/components/admin/SettingsForms";
import {
  getAccommodation,
  getEnrollmentPopup,
  getNondiscrimination,
  getNoticeLocation,
  getPosters,
  getSchedulePdf,
  getSchoolYearStart,
} from "@/lib/meetings";
import { phoenixParts, toPhoenixInput } from "@/lib/meetings-shared";

export const dynamic = "force-dynamic";
export const metadata = { title: "Site settings" };

export default async function SiteSettingsPage() {
  const [posters, location, accommodation, schoolYear, schedule, nondiscrimination, popup] =
    await Promise.all([
      getPosters(),
      getNoticeLocation(),
      getAccommodation(),
      getSchoolYearStart(),
      getSchedulePdf(),
      getNondiscrimination(),
      getEnrollmentPopup(),
    ]);

  // The schedule PDF covers one school year; name the next one from today.
  const p = phoenixParts(new Date());
  const startYear = p.month > schoolYear.month || (p.month === schoolYear.month && p.day >= schoolYear.day)
    ? p.year
    : p.year - 1;
  const yearLabel = `${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}`;
  const replacing = schedule?.schoolYear === yearLabel;
  const scheduleBase = `zenith-board-schedule-${yearLabel}${replacing ? "-v2" : ""}`;

  return (
    <div className="max-w-3xl space-y-6">
      <header>
        <p className="eyebrow text-eventide">Site settings</p>
        <h1 className="mt-2 text-3xl font-semibold text-midnight">Meetings and pop-up settings</h1>
        <p className="mt-2 text-midnight-75">
          Start with the posting list. After that, each box saves on its own.
        </p>
      </header>

      <PostersForm names={posters} />
      <NoticeLocationForm value={location.location} posters={posters} />
      <AccommodationForm
        contact={accommodation.contact}
        reach={accommodation.reach}
        days={accommodation.days}
        posters={posters}
      />
      <SchedulePdfForm
        current={schedule ? { url: schedule.url, schoolYear: schedule.schoolYear } : null}
        nextBaseName={scheduleBase}
        posters={posters}
      />
      <SchoolYearForm month={schoolYear.month} day={schoolYear.day} posters={posters} />
      <NondiscriminationForm text={nondiscrimination.text} posters={posters} />
      <EnrollmentPopupForm
        posters={posters}
        values={{
          state: popup.state,
          eyebrow: popup.eyebrow,
          headline: popup.headline,
          body: popup.body,
          ctaLabel: popup.ctaLabel,
          ctaUrl: popup.ctaUrl ?? "",
          imageUrl: popup.imageUrl ?? "",
          imageAlt: popup.imageAlt,
          showFrom: popup.showFrom ? toPhoenixInput(new Date(popup.showFrom)) : "",
          showUntil: popup.showUntil ? toPhoenixInput(new Date(popup.showUntil)) : "",
          rememberDismissDays: popup.rememberDismissDays,
        }}
      />
    </div>
  );
}

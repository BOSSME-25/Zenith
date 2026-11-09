import Link from "next/link";
import { APPLICATION_URL } from "@/lib/enrollment";
import { Users, ClipboardList, Heart, Handshake } from "lucide-react";
import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { FamilyForm } from "@/components/forms/FamilyForm";
import { CommunityForm } from "@/components/forms/CommunityForm";
import { PartnerForm } from "@/components/forms/PartnerForm";

export const metadata = {
  title: "Get Involved",
  description:
    "Join the interest list, take the community survey, volunteer, or partner with Zenith College and Career Prep as we design Maryvale's early college STEAM high school.",
};

const AUDIENCES = [
  {
    href: "#family",
    icon: Users,
    label: "Future Families",
    line: APPLICATION_URL
      ? "Apply now, or join the interest list to stay in the loop."
      : "Join the interest list and be first to hear how to enroll.",
  },
  {
    href: "#survey",
    icon: ClipboardList,
    label: "Community Survey",
    line: "Shape the school by sharing what matters most to your family.",
  },
  {
    href: "#community",
    icon: Heart,
    label: "Community Supporters",
    line: "Show the Arizona board this community wants this school.",
  },
  {
    href: "#partner",
    icon: Handshake,
    label: "Partners",
    line: "Bring internships, mentorship, or resources to Zenith students.",
  },
];

export default function GetInvolvedPage() {
  return (
    <>
      <Section titleAs="h1"
        eyebrow="Get Involved"
        title="Help us open Zenith for Maryvale."
        description="Charter schools rise because communities show up. Pick the path that fits you below."
        bg="white"
      >
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {AUDIENCES.map(({ href, icon: Icon, label, line }, i) => (
            <Reveal
              key={href}
              delay={i * 80}
              as="div"
              className="h-full"
            >
              <Link
                href={href}
                className="group block h-full rounded-2xl bg-ion-soft border border-ion p-6 md:p-7 transition-all duration-200 hover:-translate-y-0.5 hover:bg-ion-50 hover:shadow-[0_10px_30px_rgba(6,36,63,0.08)] active:scale-[0.99]"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-aurora ring-1 ring-aurora/30 transition-transform group-hover:scale-105">
                  <Icon size={24} aria-hidden strokeWidth={2} />
                </span>
                <p className="mt-5 text-lg md:text-xl font-semibold text-midnight">{label}</p>
                <p className="mt-2 text-sm md:text-base text-midnight-75 leading-snug">{line}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-eventide group-hover:text-midnight">
                  Go to form <span aria-hidden>→</span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section bg="ion-soft">
        <div id="family" className="max-w-3xl mx-auto rounded-2xl bg-white border border-ion p-8 md:p-10">
          {APPLICATION_URL && (
            <div className="mb-10 rounded-2xl bg-midnight p-6 md:p-8 text-white">
              <p className="eyebrow text-ion">Enrolling now</p>
              <h2 className="mt-3 text-2xl md:text-3xl font-bold text-white">Ready to apply?</h2>
              <p className="mt-3 leading-relaxed text-white/90">
                Zenith is enrolling 9th graders for August 2027.
              </p>
              <a
                href={APPLICATION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-aurora px-7 py-3 text-sm md:text-base font-semibold text-midnight hover:bg-aurora-75 transition-colors"
              >
                Apply Now
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </div>
          )}
          <p className="eyebrow text-eventide">Family Interest List</p>
          <h2 className="mt-3 text-2xl md:text-3xl font-semibold text-midnight">
            {APPLICATION_URL ? "Not ready to apply yet?" : "Join the Zenith Interest List."}
          </h2>
          <p className="mt-3 text-midnight-75">
            {APPLICATION_URL
              ? "Join the interest list and we will keep you posted on open houses and key dates."
              : "Be the first to hear how to enroll. Zenith is enrolling 9th graders for August 2027."}
          </p>
          <div className="mt-8">
            <FamilyForm />
          </div>
        </div>
      </Section>

      <Section bg="white">
        <div id="survey" className="max-w-4xl mx-auto rounded-2xl bg-ion-soft border border-ion p-6 md:p-10">
          <p className="eyebrow text-eventide">Community Survey</p>
          <h2 className="mt-3 text-2xl md:text-3xl font-semibold text-midnight">
            Tell us what matters most.
          </h2>
          <p className="mt-3 text-midnight-75">
            Your answers shape Zenith&apos;s model as we get ready to open.
            Available in English and Spanish.
          </p>
          <div className="mt-8 rounded-xl overflow-hidden bg-white border border-ion">
            <iframe
              src="https://docs.google.com/forms/d/e/1FAIpQLSdMyr3TYkWq47QffUuYgRcwauK_tBTkQLJ-jbzYBQiza7T6EA/viewform?embedded=true"
              title="Zenith Community Survey"
              width="100%"
              height="1400"
              loading="lazy"
              className="block w-full"
            >
              Loading…
            </iframe>
          </div>
          <p className="mt-4 text-sm text-midnight-75">
            Having trouble?{" "}
            <a
              href="https://forms.gle/K8x9DnACTqf9NTc86"
              target="_blank"
              rel="noopener noreferrer"
              className="text-aurora-blue underline hover:no-underline"
            >
              Open the survey in a new tab
            </a>
            .
          </p>
        </div>
      </Section>

      <Section bg="ion-soft">
        <div id="community" className="max-w-3xl mx-auto rounded-2xl bg-white border border-ion p-8 md:p-10">
          <p className="eyebrow text-eventide">Community Supporter</p>
          <h2 className="mt-3 text-2xl md:text-3xl font-semibold text-midnight">
            Stand with Zenith.
          </h2>
          <p className="mt-3 text-midnight-75">
            Your name shows the Arizona board that Maryvale wants this school.
          </p>
          <div className="mt-8">
            <CommunityForm />
          </div>
        </div>
      </Section>

      <Section bg="white">
        <div id="partner" className="max-w-3xl mx-auto rounded-2xl bg-ion-soft border border-ion p-8 md:p-10">
          <p className="eyebrow text-eventide">Partner Inquiry</p>
          <h2 className="mt-3 text-2xl md:text-3xl font-semibold text-midnight">
            Partner with Zenith.
          </h2>
          <p className="mt-3 text-midnight-75">
            Let&apos;s talk about how your organization can help Zenith students go further.
          </p>
          <div className="mt-8">
            <PartnerForm />
          </div>
        </div>
      </Section>
    </>
  );
}

import { Section } from "@/components/Section";
import { BoardSilhouette } from "@/components/BoardSilhouette";

export const metadata = { title: "Our Board" };

const BOARD = [
  {
    name: "Robert Barlow, Ph.D.",
    title: "Market People Partner",
    org: "NAPA Auto Parts",
  },
  {
    name: "George Saad, Esq.",
    title: "Attorney and Founder",
    org: "PLATZ JURIS, PLLC",
  },
  {
    name: "Michael Finch, B.S.",
    title: "Former EVP and Principal Founder",
    org: "SVN",
  },
  {
    name: "Jade Nangah, B.A.",
    title: "Director of Content Marketing",
    org: "Jet Set Productions",
  },
  {
    name: "Lynn Palacios, M.Ed.",
    title: "Instructional Coach",
    org: "Barry Goldwater High School",
  },
  {
    name: "Tom Nevill, Ph.D.",
    title: "VP of Academic Affairs",
    org: "GateWay Community College",
  },
  {
    name: "Luis Cordova, B.S.",
    title: "SVP and COO",
    org: "Rounds Consulting Group",
  },
  {
    name: "Veronica Sas, B.S.",
    title: "Chief Financial Officer",
    org: "ACCEL",
  },
  {
    name: "Emily Belt, M.S.",
    title: "Regional Director of Operations",
    org: "Grand Canyon University",
  },
];

export default function OurBoardPage() {
  return (
    <>
      <Section
        eyebrow="Our Board"
        title="A founding board built for the work ahead."
        description="Nine community-rooted leaders bringing operational, legal, financial, instructional, and partnership expertise to Zenith&apos;s charter application and launch."
        bg="white"
      />

      <Section eyebrow="Founder Spotlight" title="Dr. Jay Samant" bg="ion-soft">
        <div className="grid gap-10 md:grid-cols-[260px_1fr] items-start">
          <BoardSilhouette className="w-full max-w-[220px] mx-auto md:mx-0 rounded-2xl" />
          <div>
            <p className="text-lg md:text-xl font-semibold text-midnight">Founder &amp; CEO</p>
            <p className="mt-4 text-base md:text-lg leading-relaxed text-midnight">
              Dr. Jay Samant is the Founder and CEO of Zenith College and Career Prep. A BES Fellow,
              Dr. Samant brings 16+ years of leadership across K-12 and higher education — including
              roles at STRIVE Prep and Community College of Denver — to the work of opening a tuition-free,
              college-ready high school that the Maryvale community helps design.
            </p>
            <p className="mt-4 text-base md:text-lg leading-relaxed text-midnight-75">
              Full founder bio coming soon.
            </p>
          </div>
        </div>
      </Section>

      <Section eyebrow="Founding Board" title="Meet the founding board." bg="white">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {BOARD.map((m) => (
            <article
              key={m.name}
              className="rounded-2xl bg-ion-soft border border-ion p-6 flex flex-col items-start"
            >
              <BoardSilhouette className="w-20 h-20 rounded-xl" />
              <p className="mt-5 text-lg font-semibold text-midnight leading-snug">{m.name}</p>
              <p className="mt-1 text-sm text-eventide font-medium">{m.title}</p>
              <p className="mt-1 text-sm text-midnight-75">{m.org}</p>
              <p className="mt-4 text-sm text-midnight-75 italic">Full bio coming soon.</p>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}

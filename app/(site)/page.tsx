import Link from "next/link";
import Image from "next/image";
import { ArrowRight, GraduationCap, Users, Briefcase, Compass, HandHeart, Flag, TrendingUp, BarChart2, Star } from "lucide-react";
import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { StatCounter } from "@/components/StatCounter";

const COMMUNITY = [
  { src: "/community/maryvale-planning-committee.jpg", caption: "Maryvale community planning session", span: "lg:col-span-2 lg:row-span-2", pos: "center 40%" },
  { src: "/community/hcc-tabling.jpg", caption: "Community outreach with the Zenith team", span: "", pos: "center 30%" },
  { src: "/community/just-schools.jpg", caption: "Just Schools advocacy event", span: "", pos: "center 25%" },
  { src: "/community/hvv-tabling.jpg", caption: "Tabling and talking with families", span: "lg:col-span-2", pos: "center top" },
  { src: "/community/hcc-with-lori.jpg", caption: "Partnering with Harvest Compassion Center", span: "", pos: "center 22%" },
  { src: "/community/aef.jpg", caption: "Visiting Arizona Education Forward", span: "", pos: "center 25%" },
  { src: "/community/azhcc.jpg", caption: "At the Arizona Hispanic Chamber of Commerce", span: "", pos: "center 22%" },
  { src: "/community/pcc.jpg", caption: "With the Phoenix Community Alliance", span: "", pos: "75% 35%" },
];

const OUTCOMES = [
  {
    icon: GraduationCap,
    title: "Earn College Credit",
    line: "Dual enrollment and AP coursework before graduation.",
  },
  {
    icon: Compass,
    title: "Explore STEAM Careers",
    line: "Science, Technology, Engineering, Arts, and Math pathways.",
  },
  {
    icon: Briefcase,
    title: "Real-World Experience",
    line: "Internships, mentorship, and community partnerships.",
  },
  {
    icon: TrendingUp,
    title: "Financial Literacy",
    line: "Life and money skills woven into every year.",
  },
  {
    icon: Star,
    title: "Bold Leadership",
    line: "Character, confidence, and community built in.",
  },
];

const DIFFERENTIATORS = [
  {
    icon: GraduationCap,
    title: "AP-First Model",
    body: "All students are prepared for advanced coursework and college-level expectations beginning in 9th grade through rigorous Pre-AP aligned instruction and academic support systems.",
  },
  {
    icon: Compass,
    title: "Personalized Pathways",
    body: "Every scholar develops individualized college, career, and leadership goals through advisory, mentorship, and postsecondary planning.",
  },
  {
    icon: Briefcase,
    title: "Career-Connected Learning",
    body: "Students engage in internships, work-based learning, career exploration, and industry-connected experiences aligned to high-demand Arizona careers.",
  },
  {
    icon: Users,
    title: "Small, Personalized Environment",
    body: "With no more than 100 students per grade, every student is known, supported, and challenged.",
  },
  {
    icon: TrendingUp,
    title: "Financial Literacy and Real-World Readiness",
    body: "Students develop practical life, financial, communication, and leadership skills alongside academic rigor.",
  },
  {
    icon: BarChart2,
    title: "Embedded Intervention and Support",
    body: "Daily Elevate intervention block provides targeted academic support, ELD support, enrichment, tutoring, and acceleration.",
  },
];

const PARTNERS = [
  "BES (Bush Education Strategies)",
  "Harvest Compassion Center",
  "AZ Leads",
  "Million Dollar Teacher Project",
  "Center for the Future of Arizona",
  "AZ Hispanic Chamber of Commerce",
  "Phoenix Community Alliance",
  "Grand Canyon University",
  "Maricopa Community Colleges",
  "Boys and Girls Club",
  "YMCA",
];

const VALUES = [
  {
    name: "Purpose",
    icon: Compass,
    body: "Students discover their strengths and pursue a future filled with opportunity.",
  },
  {
    name: "Service",
    icon: HandHeart,
    body: "Students give back and make a meaningful impact in their community.",
  },
  {
    name: "Bold Leaders",
    icon: Flag,
    body: "Students lead with integrity and shape the future.",
  },
];

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden bg-midnight text-white">
        <div className="container-prose relative py-20 md:py-28 lg:py-32 grid gap-12 lg:grid-cols-[1fr_1fr] items-center">
          <div className="max-w-2xl">
            <p className="eyebrow text-ion">A New Kind of High School Is Coming to Maryvale</p>
            <h1 className="mt-5 text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight text-white">
              AP-First. College &amp; Career Connected. Built for Maryvale.
            </h1>
            <p className="mt-6 text-xl md:text-2xl text-ion font-medium tracking-tight">
              Tuition-free. AP-first. Built for Maryvale.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/get-involved#family"
                className="inline-flex items-center gap-2 rounded-full bg-ion px-6 py-3 text-sm md:text-base font-semibold text-midnight hover:bg-white transition-colors"
              >
                Join Our Interest List
                <ArrowRight size={18} aria-hidden />
              </Link>
              <Link
                href="/school-model"
                className="inline-flex items-center gap-2 rounded-full border border-ion/60 px-6 py-3 text-sm md:text-base font-semibold text-ion hover:bg-ion hover:text-midnight transition-colors"
              >
                Learn More
              </Link>
              <Link
                href="/get-involved#partner"
                className="inline-flex items-center gap-2 rounded-full border border-ion/60 px-6 py-3 text-sm md:text-base font-semibold text-ion hover:bg-ion hover:text-midnight transition-colors"
              >
                Partner With Zenith
              </Link>
            </div>
          </div>
          <div className="relative hidden lg:flex justify-center">
            <Image
              src="/brand/zenith-shield-light.png"
              alt=""
              width={640}
              height={792}
              className="relative drop-shadow-[0_10px_60px_rgba(190,229,238,0.25)] w-full max-w-[28rem] h-auto"
              priority
            />
          </div>
        </div>
      </section>

      <Section
        eyebrow="Why Zenith"
        title="A high school built so every scholar can thrive."
        description="Zenith is being designed with Maryvale, for Maryvale — through student surveys, focus groups, and community conversations with families and local leaders."
        bg="white"
      >
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {OUTCOMES.map(({ icon: Icon, title, line }, i) => (
            <Reveal
              key={title}
              as="li"
              delay={i * 80}
              className="group rounded-2xl bg-ion-soft border border-ion p-6 md:p-7 flex flex-col items-start transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(6,36,63,0.08)] hover:bg-ion-50"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-aurora ring-1 ring-aurora/30 transition-transform group-hover:scale-105">
                <Icon size={24} aria-hidden strokeWidth={2} />
              </span>
              <p className="mt-5 text-lg font-semibold text-midnight">{title}</p>
              <p className="mt-2 text-sm leading-relaxed text-midnight-75">{line}</p>
            </Reveal>
          ))}
        </ul>
      </Section>

      <Section eyebrow="The Zenith Difference" title="What makes Zenith different?" bg="ion-soft">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {DIFFERENTIATORS.map(({ icon: Icon, title, body }, i) => (
            <Reveal
              key={title}
              as="article"
              delay={i * 80}
              className="rounded-2xl bg-white border border-ion p-7 md:p-8 flex flex-col"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-midnight text-ion">
                <Icon size={26} aria-hidden />
              </span>
              <p className="mt-5 text-xl font-semibold text-midnight leading-snug">{title}</p>
              <p className="mt-3 text-base leading-relaxed text-midnight-75">{body}</p>
            </Reveal>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/school-model"
            className="inline-flex items-center gap-2 rounded-full bg-midnight px-6 py-3 text-sm md:text-base font-semibold text-white hover:bg-midnight-75 transition-colors"
          >
            Explore the school model
            <ArrowRight size={18} aria-hidden />
          </Link>
        </div>
      </Section>

      <Section eyebrow="Core Values" bg="white">
        <div className="grid gap-8 md:grid-cols-3">
          {VALUES.map(({ name, body, icon: Icon }, i) => (
            <Reveal
              key={name}
              as="article"
              delay={i * 120}
              className="group relative rounded-3xl bg-ion-soft border border-ion p-8 md:p-10 flex flex-col items-center text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(6,36,63,0.08)]"
            >
              <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-midnight text-ion shadow-[0_8px_24px_rgba(6,36,63,0.18)] ring-[6px] ring-white transition-transform group-hover:scale-105">
                <Icon size={32} aria-hidden strokeWidth={1.75} />
              </span>
              <p className="mt-6 text-xl md:text-2xl font-semibold text-midnight">{name}</p>
              <div className="mx-auto mt-3 h-px w-10 bg-eventide/40" />
              <p className="mt-4 text-sm md:text-base text-eventide leading-snug">{body}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section eyebrow="In the Community" title="Designed with Maryvale, for Maryvale." bg="ion-soft">
        <p className="text-base md:text-lg leading-relaxed text-midnight max-w-3xl">
          Zenith was designed through direct feedback from Maryvale students, families, educators,
          nonprofit leaders, and community stakeholders.
        </p>
        <div className="mt-10 rounded-3xl bg-white border border-ion p-8 md:p-10">
          <StatCounter
            variant="light"
            stats={[
              { value: 200, suffix: "+", label: "Community surveys completed" },
              { value: 100, suffix: "+", label: "One-on-one family conversations" },
              { value: 6, suffix: "+", label: "Community organizations engaged" },
            ]}
          />
        </div>
        <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 auto-rows-[150px] md:auto-rows-[200px] gap-3 md:gap-4">
          {COMMUNITY.map(({ src, caption, span, pos }, i) => (
            <Reveal
              key={src}
              delay={i * 60}
              as="div"
              className={`group relative overflow-hidden rounded-2xl bg-ion-soft ${span}`}
            >
              <Image
                src={src}
                alt={caption}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                style={{ objectPosition: pos }}
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-midnight/85 via-midnight/40 to-transparent p-3 md:p-4">
                <p className="text-xs md:text-sm font-medium text-white leading-snug">{caption}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="mt-12 rounded-3xl bg-midnight text-white p-8 md:p-10 border-l-4 border-ion max-w-4xl">
          <p className="text-2xl md:text-3xl font-semibold leading-snug">
            &ldquo;This school was built with the community, not simply placed into the community.&rdquo;
          </p>
        </div>
      </Section>

      <Section eyebrow="Partners" title="Community and strategic partnerships." bg="white">
        <ul className="flex flex-wrap gap-3">
          {PARTNERS.map((name) => (
            <li
              key={name}
              className="inline-flex items-center rounded-full bg-ion-soft border border-ion px-4 py-2 text-sm md:text-base font-medium text-midnight"
            >
              {name}
            </li>
          ))}
        </ul>
        <p className="mt-8 text-sm md:text-base text-midnight-75 max-w-3xl">
          Partnerships include community collaboration, strategic advising, outreach, higher education
          engagement, and ongoing partnership development.
        </p>
      </Section>

      <Section bg="midnight">
        <Reveal className="max-w-4xl mx-auto text-center py-6 md:py-10">
          <p className="text-4xl md:text-6xl font-bold leading-[1.05] tracking-tight text-white">
            This is not an ability gap.
          </p>
          <p className="mt-3 text-4xl md:text-6xl font-bold leading-[1.05] tracking-tight text-ion">
            It is an access gap.
          </p>
          <p className="mt-6 text-sm md:text-base font-medium tracking-wide text-aurora">
            &mdash; Shaped by 200+ conversations with Maryvale families
          </p>
        </Reveal>
        <div className="mt-14 grid gap-8 md:grid-cols-2">
          <div className="rounded-2xl bg-midnight-75/30 border border-ion/20 p-8">
            <p className="eyebrow text-ion">Mission</p>
            <p className="mt-4 text-lg leading-relaxed text-white/90">
              Zenith prepares students to excel through early college pathways, STEAM learning, and
              real-world career experiences &mdash; graduating with college credit, credentials, and
              the skills to thrive.
            </p>
          </div>
          <div className="rounded-2xl bg-midnight-75/30 border border-ion/20 p-8">
            <p className="eyebrow text-ion">Vision</p>
            <p className="mt-4 text-lg leading-relaxed text-white/90">
              Graduates who are skilled, ethical, and community-minded leaders &mdash; ready for
              college, career, and Arizona&apos;s future.
            </p>
          </div>
        </div>
        <div className="mt-12 flex flex-wrap items-center gap-4">
          <Link
            href="/our-story"
            className="inline-flex items-center gap-2 rounded-full bg-ion px-6 py-3 text-sm md:text-base font-semibold text-midnight hover:bg-white transition-colors"
          >
            Read our story
            <ArrowRight size={18} aria-hidden />
          </Link>
          <Link
            href="/our-board"
            className="inline-flex items-center gap-2 rounded-full border border-ion/60 px-6 py-3 text-sm md:text-base font-semibold text-ion hover:bg-ion hover:text-midnight transition-colors"
          >
            Meet the founding board
          </Link>
        </div>
      </Section>

      <Section bg="ion">
        <div className="rounded-2xl bg-white border border-ion p-8 md:p-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="eyebrow text-eventide">Be part of Zenith from the start</p>
            <h3 className="mt-3 text-2xl md:text-3xl font-semibold text-midnight">
              Charter schools rise because communities show up.
            </h3>
            <p className="mt-3 text-midnight-75 max-w-2xl">
              Add your name to the Interest List or share what matters most to your family. Every voice
              strengthens our application to the Arizona State Board for Charter Schools.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/get-involved#family"
              className="inline-flex items-center justify-center rounded-full bg-midnight px-6 py-3 text-sm md:text-base font-semibold text-white hover:bg-midnight-75 transition-colors"
            >
              Join the Interest List
            </Link>
            <Link
              href="/get-involved#survey"
              className="inline-flex items-center justify-center rounded-full border border-midnight px-6 py-3 text-sm md:text-base font-semibold text-midnight hover:bg-midnight hover:text-white transition-colors"
            >
              Take the Survey
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}

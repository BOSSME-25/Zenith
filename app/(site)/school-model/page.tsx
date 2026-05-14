import Link from "next/link";
import {
  ArrowRight,
  ArrowDown,
  GraduationCap,
  BookOpen,
  School,
  Microscope,
  Wrench,
  Users,
  Heart,
  Compass,
  Target,
  HandHeart,
  Sparkles,
  Trophy,
  UserCheck,
  Languages,
  Lightbulb,
  Award,
  Briefcase,
  MicVocal,
  Building2,
  Plane,
  Hammer,
  Shield,
  Stethoscope,
  Cog,
  Coins,
  Rocket,
  MessageSquare,
  Flag,
  CheckCircle2,
  Music,
  HeartHandshake,
} from "lucide-react";
import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";

export const metadata = {
  title: "School Model",
  description:
    "A day in the life of a Zenith scholar — rigorous academics, advisory, Elevate, career-connected learning, financial literacy, and student life.",
};

const ACADEMICS = [
  { icon: BookOpen, label: "Pre-AP Foundations" },
  { icon: GraduationCap, label: "AP Coursework" },
  { icon: School, label: "Dual Enrollment" },
  { icon: Microscope, label: "STEAM Learning" },
  { icon: Wrench, label: "Real-World Projects" },
];

const COLLEGE_PATH = [
  "9th Grade Foundations",
  "AP Coursework",
  "Dual Enrollment",
  "Postsecondary Success",
];

const ADVISORY = [
  { icon: Users, label: "Grade-level community meetings" },
  { icon: Heart, label: "Character education lessons" },
  { icon: Target, label: "Goal-setting and reflection" },
  { icon: Compass, label: "College and career readiness planning" },
  { icon: UserCheck, label: "Mentorship and relationship-building" },
  { icon: Flag, label: "Leadership development" },
  { icon: HandHeart, label: "Social-emotional support" },
  { icon: Sparkles, label: "Community circles and celebrations" },
];

const ELEVATE = [
  { icon: Target, label: "Targeted academic intervention" },
  { icon: Users, label: "Small-group instruction" },
  { icon: Lightbulb, label: "Tutoring and acceleration" },
  { icon: Languages, label: "ELD support" },
  { icon: Sparkles, label: "Enrichment opportunities" },
  { icon: Award, label: "AP preparation support" },
];

const CAREER = [
  { icon: MicVocal, label: "Career speakers and industry panels" },
  { icon: Briefcase, label: "Work-based learning experiences" },
  { icon: Building2, label: "Internships and externships" },
  { icon: Compass, label: "Career exploration activities" },
  { icon: Plane, label: "College visits and tours" },
  { icon: Hammer, label: "Hands-on projects" },
  { icon: HandHeart, label: "Leadership and service opportunities" },
];

const PATHWAYS = [
  {
    icon: Shield,
    title: "IT and Cybersecurity",
    body: "Defending networks, building secure systems, and supporting Arizona’s growing tech and data infrastructure.",
  },
  {
    icon: Stethoscope,
    title: "Health Sciences",
    body: "Patient care, allied health, and the clinical pathways feeding Arizona’s rapidly expanding healthcare workforce.",
  },
  {
    icon: Cog,
    title: "Advanced Manufacturing",
    body: "Robotics, precision fabrication, and the modern manufacturing skills Arizona employers are hiring for today.",
  },
];

const CAREER_FLOW = ["Explore", "Experience", "Apply", "Lead"];

const FINANCIAL_LITERACY = [
  { icon: Coins, label: "Budgeting and money management" },
  { icon: Rocket, label: "Entrepreneurship" },
  { icon: MessageSquare, label: "Communication and professionalism" },
  { icon: Flag, label: "Leadership" },
  { icon: Target, label: "Goal setting" },
  { icon: Briefcase, label: "Workplace readiness" },
  { icon: CheckCircle2, label: "Self-advocacy and decision-making" },
];

const STUDENT_LIFE = [
  { icon: Sparkles, label: "Scholar special interest clubs" },
  { icon: Flag, label: "Leadership opportunities" },
  { icon: HeartHandshake, label: "Cultural and affinity groups" },
  { icon: HandHeart, label: "Service learning" },
  { icon: Music, label: "Extracurricular activities" },
  { icon: Trophy, label: "Advisory competitions and events" },
  { icon: Users, label: "Future athletics programming" },
];

export default function SchoolModelPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-midnight text-white">
        <div className="container-prose relative py-20 md:py-24 lg:py-28">
          <div className="max-w-3xl">
            <p className="eyebrow text-ion">The Zenith Model</p>
            <h1 className="mt-5 text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight text-white">
              A Day in the Life of a Zenith Scholar
            </h1>
            <p className="mt-6 text-lg md:text-xl text-white/85 leading-relaxed">
              Zenith combines rigorous academics, personalized support, real-world career experiences,
              and strong relationships in a small school environment built for Maryvale students.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 1: CORE ACADEMICS */}
      <Section
        eyebrow="Core Academics"
        title="Rigorous, relevant, and real-world learning."
        bg="white"
      >
        <p className="text-base md:text-lg leading-relaxed text-midnight max-w-3xl">
          At Zenith, students engage in rigorous, college-preparatory academics designed to prepare
          them for both college and career success. All students begin with strong foundational
          coursework in 9th grade through Pre-AP aligned instruction that emphasizes critical thinking,
          collaboration, writing, problem-solving, and real-world application. As students progress,
          they transition into Advanced Placement (AP) coursework and early college opportunities
          designed to increase college readiness and expand access to college credit before graduation.
          Instruction is designed to be engaging, student-centered, and connected to real-world
          challenges and career pathways.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {ACADEMICS.map(({ icon: Icon, label }, i) => (
            <Reveal
              key={label}
              delay={i * 80}
              as="div"
              className="rounded-2xl bg-ion-soft border border-ion p-6 flex flex-col items-start"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-midnight text-ion">
                <Icon size={22} aria-hidden />
              </span>
              <p className="mt-4 text-base md:text-lg font-semibold text-midnight">{label}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* SECTION 2: COLLEGE CREDIT PATHWAY */}
      <Section
        eyebrow="College Credit Pathway"
        title="College credit before graduation."
        bg="ion-soft"
      >
        <p className="text-base md:text-lg leading-relaxed text-midnight max-w-3xl">
          Zenith students will have opportunities to earn college credit while in high school through
          Advanced Placement coursework and dual enrollment partnerships. Beginning in the upper
          grades, eligible students may enroll in college courses aligned to their academic and career
          goals, helping students build confidence, reduce future college costs, and accelerate
          postsecondary pathways.
        </p>
        <ol className="mt-10 flex flex-col md:flex-row md:items-stretch md:gap-3 gap-4">
          {COLLEGE_PATH.map((step, i) => (
            <li key={step} className="flex-1 flex md:flex-col items-stretch gap-3">
              <div className="flex-1 rounded-2xl bg-white border border-ion p-5 md:p-6 flex items-center">
                <div>
                  <p className="text-xs font-semibold tracking-[0.18em] text-eventide">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <p className="mt-2 text-base md:text-lg font-semibold text-midnight leading-snug">
                    {step}
                  </p>
                </div>
              </div>
              {i < COLLEGE_PATH.length - 1 && (
                <div className="flex items-center justify-center text-eventide self-center md:self-auto">
                  <ArrowRight size={22} className="hidden md:block" aria-hidden />
                  <ArrowDown size={22} className="md:hidden" aria-hidden />
                </div>
              )}
            </li>
          ))}
        </ol>
      </Section>

      {/* SECTION 3: ADVISORY */}
      <Section eyebrow="Advisory" title="Every scholar is known." bg="white">
        <p className="text-base md:text-lg leading-relaxed text-midnight max-w-3xl">
          At Zenith, advisory is the foundation of our relationship-centered school culture. Students
          meet regularly in advisory with a consistent adult mentor who supports their academic
          progress, personal growth, leadership development, and postsecondary planning throughout
          high school.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ADVISORY.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-start gap-3 rounded-2xl bg-ion-soft border border-ion p-5"
            >
              <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-midnight text-ion">
                <Icon size={18} aria-hidden />
              </span>
              <p className="text-sm md:text-base leading-snug text-midnight">{label}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 rounded-3xl bg-midnight text-white p-8 md:p-10 border-l-4 border-ion max-w-4xl">
          <p className="text-xl md:text-2xl font-semibold leading-snug">
            &ldquo;Small school. Strong relationships. Every student known.&rdquo;
          </p>
        </div>
      </Section>

      {/* SECTION 4: ELEVATE BLOCK */}
      <Section eyebrow="Elevate Block" title="Built-in support and acceleration." bg="ion-soft">
        <p className="text-base md:text-lg leading-relaxed text-midnight max-w-3xl">
          The Elevate Block is a dedicated daily intervention and enrichment period built directly
          into the school day to ensure students receive personalized support and opportunities for
          growth. During Elevate, students may receive:
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ELEVATE.map(({ icon: Icon, label }, i) => (
            <Reveal
              key={label}
              delay={i * 70}
              as="div"
              className="rounded-2xl bg-white border border-ion p-6 flex items-start gap-4"
            >
              <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-midnight text-ion">
                <Icon size={22} aria-hidden />
              </span>
              <p className="text-base md:text-lg font-semibold text-midnight leading-snug">{label}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* SECTION 5: CAREER-CONNECTED LEARNING */}
      <Section
        eyebrow="Career-Connected Learning"
        title="Learning connected to the real world."
        bg="white"
      >
        <p className="text-base md:text-lg leading-relaxed text-midnight max-w-3xl">
          At Zenith, students engage in career-connected and experiential learning opportunities
          designed to help them explore future pathways and connect learning to real-world
          application. Students participate in:
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CAREER.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-start gap-3 rounded-2xl bg-ion-soft border border-ion p-5"
            >
              <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-midnight text-ion">
                <Icon size={18} aria-hidden />
              </span>
              <p className="text-sm md:text-base leading-snug text-midnight">{label}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-10 border-t border-ion/40">
          <p className="eyebrow text-eventide">Featured Pathways</p>
          <h3 className="mt-3 text-2xl md:text-3xl font-semibold text-midnight">
            Three high-demand Arizona pathways.
          </h3>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {PATHWAYS.map(({ icon: Icon, title, body }, i) => (
              <Reveal
                key={title}
                delay={i * 100}
                as="article"
                className="rounded-2xl bg-midnight text-white p-8 flex flex-col"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ion text-midnight">
                  <Icon size={26} aria-hidden />
                </span>
                <p className="mt-5 text-xl font-semibold">{title}</p>
                <p className="mt-3 text-sm leading-relaxed text-white/85">{body}</p>
              </Reveal>
            ))}
          </div>

          <ol className="mt-10 flex flex-col md:flex-row md:items-stretch md:gap-3 gap-4">
            {CAREER_FLOW.map((step, i) => (
              <li key={step} className="flex-1 flex md:flex-col items-stretch gap-3">
                <div className="flex-1 rounded-2xl bg-ion-soft border border-ion p-5 flex items-center">
                  <div>
                    <p className="text-xs font-semibold tracking-[0.18em] text-eventide">
                      Step {i + 1}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-midnight">{step}</p>
                  </div>
                </div>
                {i < CAREER_FLOW.length - 1 && (
                  <div className="flex items-center justify-center text-eventide self-center md:self-auto">
                    <ArrowRight size={22} className="hidden md:block" aria-hidden />
                    <ArrowDown size={22} className="md:hidden" aria-hidden />
                  </div>
                )}
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* SECTION 6: FINANCIAL LITERACY */}
      <Section
        eyebrow="Financial Literacy"
        title="Preparing students for life beyond high school."
        bg="ion-soft"
      >
        <p className="text-base md:text-lg leading-relaxed text-midnight max-w-3xl">
          Zenith believes students need more than academic preparation alone. Students engage in
          financial literacy and real-world readiness learning experiences to ensure they graduate
          prepared not only for college, but also for life.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FINANCIAL_LITERACY.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-start gap-3 rounded-2xl bg-white border border-ion p-5"
            >
              <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-midnight text-ion">
                <Icon size={18} aria-hidden />
              </span>
              <p className="text-sm md:text-base leading-snug text-midnight">{label}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* SECTION 7: STUDENT LIFE */}
      <Section
        eyebrow="Student Life"
        title="Belonging beyond the classroom."
        bg="white"
      >
        <p className="text-base md:text-lg leading-relaxed text-midnight max-w-3xl">
          Zenith is committed to building a vibrant student experience that extends beyond academics.
          We want students to feel connected, engaged, and inspired both inside and outside the
          classroom. Students will have opportunities to participate in:
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STUDENT_LIFE.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-start gap-3 rounded-2xl bg-ion-soft border border-ion p-5"
            >
              <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-midnight text-ion">
                <Icon size={18} aria-hidden />
              </span>
              <p className="text-sm md:text-base leading-snug text-midnight">{label}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* CLOSING CTA */}
      <Section bg="midnight">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-2xl">
            <p className="eyebrow text-ion">Be part of Zenith from the start</p>
            <h3 className="mt-3 text-2xl md:text-3xl font-semibold text-white">
              Ready to be part of Zenith from the start?
            </h3>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/get-involved#family"
              className="inline-flex items-center justify-center rounded-full bg-ion px-6 py-3 text-sm md:text-base font-semibold text-midnight hover:bg-white transition-colors"
            >
              Join the Interest List
            </Link>
            <Link
              href="/get-involved#partner"
              className="inline-flex items-center justify-center rounded-full border border-ion/60 px-6 py-3 text-sm md:text-base font-semibold text-ion hover:bg-ion hover:text-midnight transition-colors"
            >
              Partner With Zenith
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}

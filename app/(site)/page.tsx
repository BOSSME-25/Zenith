import Link from "next/link";
import Image from "next/image";
import { ArrowRight, GraduationCap, Lightbulb, Users, Wallet, Briefcase } from "lucide-react";
import { Section } from "@/components/Section";
import { CometBackdrop } from "@/components/CometBackdrop";

const WHY_POINTS = [
  {
    icon: GraduationCap,
    text: "Earn college credit while still in high school through dual enrollment and advanced coursework.",
  },
  {
    icon: Lightbulb,
    text: "Explore careers through pathways in Science, Technology, Engineering, Arts, and Mathematics (STEAM).",
  },
  {
    icon: Briefcase,
    text: "Gain real-world experience through internships, mentorship, and community partnerships.",
  },
  {
    icon: Wallet,
    text: "Develop financial literacy and life skills to confidently manage money, plan for their future, and build economic independence.",
  },
  {
    icon: Users,
    text: "Build the confidence, character, and leadership skills to shape their future.",
  },
];

const VALUES = [
  {
    name: "Purpose",
    body: "Students discover their strengths, set ambitious goals, and pursue a future filled with opportunity.",
  },
  {
    name: "Service",
    body: "Students learn the importance of giving back and making a meaningful impact in their community.",
  },
  {
    name: "Bold Leaders",
    body: "Students develop the confidence, character, and leadership skills to lead with integrity and shape the future.",
  },
];

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden bg-midnight text-white">
        <CometBackdrop className="absolute inset-0 h-full w-full opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-b from-midnight/30 via-midnight/40 to-midnight" />
        <div className="container-prose relative py-20 md:py-28 lg:py-32 grid gap-12 lg:grid-cols-[1.1fr_1fr] items-center">
          <div className="max-w-2xl">
            <p className="eyebrow text-ion">A New Kind of High School Is Coming to Maryvale</p>
            <h1 className="mt-5 text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight">
              Elevating Every Future
            </h1>
            <p className="mt-6 text-lg md:text-xl text-white/85 leading-relaxed">
              Zenith College and Career Prep is an early college STEAM high school designed to prepare
              students in the Maryvale community of Phoenix for success in college, career, and life.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/get-involved#family"
                className="inline-flex items-center gap-2 rounded-full bg-ion px-6 py-3 text-sm md:text-base font-semibold text-midnight hover:bg-white transition-colors"
              >
                Join the Interest List
                <ArrowRight size={18} aria-hidden />
              </Link>
              <Link
                href="/get-involved#survey"
                className="inline-flex items-center gap-2 rounded-full border border-ion/60 px-6 py-3 text-sm md:text-base font-semibold text-ion hover:bg-ion hover:text-midnight transition-colors"
              >
                Take the Community Survey
              </Link>
            </div>
          </div>
          <div className="relative hidden lg:flex justify-center">
            <Image
              src="/brand/zenith-shield-light.png"
              alt=""
              width={420}
              height={520}
              className="relative drop-shadow-[0_10px_60px_rgba(190,229,238,0.25)] h-auto w-auto max-h-[28rem]"
              priority
            />
          </div>
        </div>
      </section>

      <Section
        eyebrow="Why Zenith"
        title="Our community deserves a high school that prepares students not just to graduate, but to thrive."
        bg="white"
      >
        <ul className="grid gap-5 md:grid-cols-2">
          {WHY_POINTS.map(({ icon: Icon, text }) => (
            <li
              key={text}
              className="flex items-start gap-4 rounded-2xl bg-ion-soft border border-ion p-6"
            >
              <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-midnight text-ion">
                <Icon size={20} aria-hidden />
              </span>
              <p className="text-base md:text-lg leading-relaxed text-midnight">{text}</p>
            </li>
          ))}
        </ul>
        <p className="mt-10 text-lg leading-relaxed text-midnight-75 max-w-3xl">
          Zenith is being designed with Maryvale, for Maryvale, through student surveys, focus groups,
          and community conversations with families and local leaders.
        </p>
      </Section>

      <Section eyebrow="Core Values" title="Three commitments that shape the Zenith experience." bg="ion-soft">
        <div className="grid gap-6 md:grid-cols-3">
          {VALUES.map((v) => (
            <article
              key={v.name}
              className="rounded-2xl bg-white border border-ion p-8 flex flex-col"
            >
              <p className="eyebrow text-eventide">{v.name}</p>
              <p className="mt-5 text-lg leading-relaxed text-midnight">{v.body}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section bg="midnight" eyebrow="Mission &amp; Vision" title="What we&apos;re building, and who we&apos;re building it for.">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-2xl bg-midnight-75/30 border border-ion/20 p-8">
            <p className="eyebrow text-ion">Mission</p>
            <p className="mt-4 text-lg leading-relaxed text-white/90">
              Zenith prepares students to excel through early college pathways, STEAM learning, and
              real-world career experiences, ensuring they graduate with college credit, industry
              credentials, and the skills to thrive.
            </p>
          </div>
          <div className="rounded-2xl bg-midnight-75/30 border border-ion/20 p-8">
            <p className="eyebrow text-ion">Vision</p>
            <p className="mt-4 text-lg leading-relaxed text-white/90">
              Zenith College and Career Prep envisions graduates who are skilled, ethical, and
              community-minded leaders prepared to thrive in college, career, and Arizona&apos;s
              rapidly evolving economy.
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

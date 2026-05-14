import Link from "next/link";
import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { StatCounter } from "@/components/StatCounter";

export const metadata = { title: "Our Story" };

export default function OurStoryPage() {
  return (
    <>
      <Section
        eyebrow="Our Story"
        title="A high school designed with Maryvale, for Maryvale."
        description="Zenith College and Career Prep is being built with the community it will serve — through student surveys, focus groups, and conversations with families and local leaders. We&apos;re currently in the application phase with the Arizona State Board for Charter Schools."
        bg="white"
      />

      <Section eyebrow="Mission" title="What we&apos;re here to do." bg="ion-soft">
        <p className="text-lg md:text-xl leading-relaxed text-midnight max-w-3xl">
          Zenith prepares students to excel through early college pathways, STEAM learning, and
          real-world career experiences, ensuring they graduate with college credit, industry
          credentials, and the skills to thrive.
        </p>
      </Section>

      <Section eyebrow="Vision" title="The graduates we&apos;re preparing." bg="white">
        <p className="text-lg md:text-xl leading-relaxed text-midnight max-w-3xl">
          Zenith College and Career Prep envisions graduates who are skilled, ethical, and
          community-minded leaders prepared to thrive in college, career, and Arizona&apos;s rapidly
          evolving economy.
        </p>
      </Section>

      <Section eyebrow="Why Maryvale" title="Built where the need is greatest, and the potential is largest." bg="ion-soft">
        <div className="grid gap-6 md:grid-cols-2 max-w-5xl">
          <p className="text-base md:text-lg leading-relaxed text-midnight">
            Maryvale is one of the most dynamic, family-rich communities in Phoenix. Families here
            deserve a tuition-free public high school that helps every student earn college credit
            before they graduate, build industry credentials, and step confidently into Arizona&apos;s
            growing economy.
          </p>
          <p className="text-base md:text-lg leading-relaxed text-midnight">
            Zenith is being designed to meet that bar — through dual enrollment, STEAM pathways,
            real-world internships, mentorship, and the financial literacy and life skills that turn
            a diploma into long-term opportunity.
          </p>
        </div>
      </Section>

      <Section eyebrow="Why Now" title="Why Maryvale? Why Now?" bg="white">
        <div className="max-w-4xl">
          <p className="text-base md:text-lg leading-relaxed text-midnight">
            Maryvale students do not lack talent. They lack access to personalized, college and
            career-connected opportunities. Many local high schools are extremely large and often
            provide limited access to advanced coursework, individualized support, and career-connected
            learning experiences. Zenith was designed to bridge those gaps through rigorous academics,
            strong relationships, early college opportunities, and real-world readiness.
          </p>
        </div>
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
        <div className="mt-12 rounded-3xl bg-midnight-75/30 border border-ion/20 p-8 md:p-10">
          <StatCounter
            variant="dark"
            stats={[
              { value: 200, suffix: "+", label: "Community surveys completed" },
              { value: 100, suffix: "+", label: "One-on-one family conversations" },
              { value: 6, suffix: "+", label: "Community organizations engaged" },
            ]}
          />
        </div>
      </Section>

      <Section bg="ion-soft">
        <p className="eyebrow text-eventide">What We Heard From Maryvale Families</p>
        <h2 className="mt-4 text-3xl md:text-4xl font-semibold leading-tight text-midnight max-w-3xl">
          The same five things, in conversation after conversation.
        </h2>
        <ul className="mt-10 grid gap-4 md:grid-cols-2 max-w-5xl">
          {[
            "Smaller schools where students are known",
            "Stronger academic support",
            "Real access to college credit",
            "Career-connected learning",
            "Safer, more personalized environments",
          ].map((item, i) => (
            <Reveal
              key={item}
              as="li"
              delay={i * 70}
              className="rounded-2xl bg-white border-l-4 border-aurora border-y border-r border-y-ion border-r-ion p-5 md:p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(6,36,63,0.06)]"
            >
              <p className="text-base md:text-lg font-semibold text-midnight leading-snug">{item}</p>
            </Reveal>
          ))}
        </ul>
        <p className="mt-8 text-base md:text-lg text-midnight-75 max-w-3xl">
          Zenith&apos;s model was directly shaped by this feedback.
        </p>
      </Section>

      <Section eyebrow="Designed With Community" title="The Zenith design process." bg="white">
        <ol className="grid gap-6 md:grid-cols-3">
          {[
            {
              n: "01",
              t: "Listen",
              b: "Student surveys, family focus groups, and community conversations to surface what Maryvale wants in a high school.",
            },
            {
              n: "02",
              t: "Design",
              b: "Pathways, schedule, and partnerships shaped by what we hear — anchored by college credit, STEAM, and real-world experience.",
            },
            {
              n: "03",
              t: "Open",
              b: "Pending charter authorization, Zenith opens in Maryvale with 9th grade in Fall 2027 and grows one grade per year.",
            },
          ].map((s) => (
            <li key={s.n} className="rounded-2xl bg-ion-soft border border-ion p-7">
              <p className="text-sm font-semibold tracking-[0.18em] text-eventide">{s.n}</p>
              <p className="mt-3 text-xl font-semibold text-midnight">{s.t}</p>
              <p className="mt-3 text-base leading-relaxed text-midnight-75">{s.b}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section bg="midnight">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-2xl">
            <p className="eyebrow text-ion">Help shape Zenith</p>
            <h3 className="mt-3 text-2xl md:text-3xl font-semibold text-white">
              Add your voice to the design.
            </h3>
            <p className="mt-3 text-white/85">
              Take the community survey, join the interest list, or reach out about partnering with
              us. Every voice strengthens our charter application and the school we build.
            </p>
          </div>
          <Link
            href="/get-involved"
            className="inline-flex items-center rounded-full bg-ion px-6 py-3 text-sm md:text-base font-semibold text-midnight hover:bg-white transition-colors"
          >
            Get Involved
          </Link>
        </div>
      </Section>
    </>
  );
}

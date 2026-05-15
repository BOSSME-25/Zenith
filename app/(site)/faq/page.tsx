import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Section } from "@/components/Section";

export const metadata = { title: "Frequently Asked Questions" };

type Faq = {
  q: string;
  a: string;
  learnMore?: string;
};

const FAQS: Faq[] = [
  {
    q: "When will Zenith open?",
    a: "Target opening Fall 2027, pending charter authorization from the Arizona State Board for Charter Schools.",
  },
  {
    q: "Is Zenith a tuition-free public school?",
    a: "Yes. Zenith is a tuition-free public charter high school opening in 2027 with its founding 9th grade class. There is no cost to attend, and all Arizona families with students eligible for 9th grade are welcome to apply.",
  },
  {
    q: "What grades will Zenith serve?",
    a: "9th through 12th grade, adding one grade per year starting with 9th grade in Fall 2027.",
  },
  {
    q: "Where will Zenith be located?",
    a: "In the Maryvale community of Phoenix. Specific site to be confirmed after authorization.",
  },
  {
    q: "How do I enroll my child?",
    a: "Join the Interest List now — you'll be the first notified when enrollment opens after authorization.",
  },
  {
    q: "How can I support Zenith?",
    a: "Take the survey, join the interest list, or reach out about partnering. Every action helps our charter application.",
  },
  {
    q: "Who is leading Zenith?",
    a: "Dr. Jay Samant, BES Fellow and 16-year education leader, with a nine-member founding board. See Our Board.",
  },
  {
    q: "What does STEAM mean?",
    a: "Science, Technology, Engineering, Arts, and Mathematics — integrating the arts into STEM develops creative problem-solvers.",
  },
  {
    q: "What makes Zenith different?",
    a: "AP-first academics, personalized advisory, early college credit, career pathways, and a small school environment — all in one school designed for Maryvale.",
    learnMore: "/school-model",
  },
  {
    q: "What does AP-first mean?",
    a: "AP-first means Zenith is designed to prepare all students for rigorous college-level coursework and postsecondary success. Students begin with Pre-AP aligned instruction in 9th grade and have access to Advanced Placement (AP) courses, college credit opportunities, and dual enrollment as they progress through high school.",
    learnMore: "/school-model",
  },
  {
    q: "Will students earn college credit?",
    a: "Yes, through AP coursework and dual enrollment partnerships aligned to student readiness and goals.",
    learnMore: "/school-model",
  },
  {
    q: "What career pathways will Zenith offer?",
    a: "IT and Cybersecurity, Health Sciences, and Advanced Manufacturing — aligned to high-demand Arizona industries.",
    learnMore: "/school-model",
  },
  {
    q: "What is the Elevate Block?",
    a: "A daily built-in period for personalized intervention, tutoring, enrichment, ELD support, and AP prep.",
    learnMore: "/school-model",
  },
  {
    q: "How does advisory work?",
    a: "Every student has a consistent adult mentor supporting academic progress, college and career planning, and leadership throughout high school.",
    learnMore: "/school-model",
  },
  {
    q: "Will Zenith have extracurriculars and athletics?",
    a: "Yes — clubs, leadership activities, affinity groups, and future athletics programming.",
  },
  {
    q: "How large will Zenith be?",
    a: "No more than 100 students per grade — intentionally small so every student is known by name.",
  },
];

export default function FaqPage() {
  return (
    <>
      <Section
        eyebrow="FAQ"
        title="Answers for families and community."
        description="Questions families and neighbors ask most often as Zenith moves through charter authorization. Don&apos;t see your question? Reach out — we read every message."
        bg="white"
      />

      <Section bg="ion-soft">
        <div className="max-w-3xl mx-auto">
          <ul className="space-y-3">
            {FAQS.map((item, i) => (
              <li key={item.q}>
                <details
                  className="group rounded-2xl bg-white border border-ion open:border-eventide/50 open:shadow-sm transition-shadow"
                  {...(i === 0 ? { open: true } : {})}
                >
                  <summary className="flex items-center justify-between gap-4 cursor-pointer list-none px-6 py-5 text-lg font-semibold text-midnight">
                    <span>{item.q}</span>
                    <ChevronDown
                      size={20}
                      aria-hidden
                      className="text-eventide transition-transform group-open:rotate-180 flex-none"
                    />
                  </summary>
                  <div className="px-6 pb-5 -mt-1 text-base leading-relaxed text-midnight-75">
                    {item.a}
                    {item.learnMore && (
                      <>
                        {" "}
                        <Link
                          href={item.learnMore}
                          className="inline-flex items-center gap-1 font-semibold text-aurora hover:text-eventide transition-colors"
                        >
                          Learn more <span aria-hidden>→</span>
                        </Link>
                      </>
                    )}
                  </div>
                </details>
              </li>
            ))}
          </ul>
          <div className="mt-12 rounded-2xl bg-midnight text-white p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="eyebrow text-ion">Still have a question?</p>
              <p className="mt-2 text-lg font-semibold">We&apos;d love to hear from you.</p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full bg-ion px-6 py-3 text-sm md:text-base font-semibold text-midnight hover:bg-white transition-colors active:scale-95"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}

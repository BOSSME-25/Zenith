import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Section } from "@/components/Section";

export const metadata = { title: "Frequently Asked Questions" };

const FAQS = [
  {
    q: "When will Zenith open?",
    a: "Pending charter authorization. Target opening: Fall 2027.",
  },
  {
    q: "Is Zenith a tuition-free public school?",
    a: "Yes. Zenith will be a tuition-free public charter school open to all Arizona students.",
  },
  {
    q: "What grades will Zenith serve?",
    a: "Grades 9-12, growing one grade per year starting with 9th grade.",
  },
  {
    q: "Where will Zenith be located?",
    a: "In the Maryvale community of Phoenix. Specific location to be confirmed.",
  },
  {
    q: "How do I enroll my child?",
    a: "Enrollment opens after charter authorization. Join the Interest List to be notified the moment enrollment opens.",
  },
  {
    q: "How can I support Zenith?",
    a: "Take the survey, share with families, partner with us, or attend a community forum. See Get Involved.",
  },
  {
    q: "Who is leading Zenith?",
    a: "Founded by Dr. Jay Samant, a BES Fellow with 16+ years of K-12 and higher education leadership. Governed by a nine-member founding board.",
  },
  {
    q: "What does STEAM mean?",
    a: "Science, Technology, Engineering, Arts, and Mathematics. Zenith integrates the arts into traditional STEM to develop creative problem-solvers.",
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
              className="inline-flex items-center justify-center rounded-full bg-ion px-6 py-3 text-sm md:text-base font-semibold text-midnight hover:bg-white transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}

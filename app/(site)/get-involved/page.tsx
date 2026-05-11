import { Section } from "@/components/Section";
import { FamilyForm } from "@/components/forms/FamilyForm";
import { CommunityForm } from "@/components/forms/CommunityForm";
import { PartnerForm } from "@/components/forms/PartnerForm";
import { SurveyForm } from "@/components/forms/SurveyForm";

export const metadata = { title: "Get Involved" };

export default function GetInvolvedPage() {
  return (
    <>
      <Section
        eyebrow="Get Involved"
        title="Help us open Zenith for Maryvale."
        description="Charter schools rise because communities show up. Add your family to the Interest List, share what matters most through the survey, stand with us as a supporter, or partner with us as we build."
        bg="white"
      >
        <nav aria-label="Form sections" className="flex flex-wrap gap-2 mt-4">
          {[
            { href: "#family", label: "Family Interest" },
            { href: "#survey", label: "Community Survey" },
            { href: "#community", label: "Community Supporter" },
            { href: "#partner", label: "Partner Inquiry" },
          ].map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="inline-flex items-center rounded-full bg-ion-soft border border-ion px-4 py-2 text-sm font-semibold text-midnight hover:bg-ion"
            >
              {l.label}
            </a>
          ))}
        </nav>
      </Section>

      <Section bg="ion-soft">
        <div id="family" className="scroll-mt-24 max-w-3xl mx-auto rounded-2xl bg-white border border-ion p-8 md:p-10">
          <p className="eyebrow text-eventide">Family Interest List</p>
          <h2 className="mt-3 text-2xl md:text-3xl font-semibold text-midnight">
            Join the Zenith Interest List.
          </h2>
          <p className="mt-3 text-midnight-75">
            Get notified the moment enrollment opens, plus updates on community forums, open houses, and
            major milestones along the way.
          </p>
          <div className="mt-8">
            <FamilyForm />
          </div>
        </div>
      </Section>

      <Section bg="white">
        <div id="survey" className="scroll-mt-24 max-w-3xl mx-auto rounded-2xl bg-ion-soft border border-ion p-8 md:p-10">
          <p className="eyebrow text-eventide">Community Survey</p>
          <h2 className="mt-3 text-2xl md:text-3xl font-semibold text-midnight">
            Tell us what matters most.
          </h2>
          <p className="mt-3 text-midnight-75">
            We&apos;re designing Zenith with the community. Your answers help shape pathways, schedule, and
            partnerships — and strengthen our charter application.
          </p>
          <div className="mt-8">
            <SurveyForm />
          </div>
        </div>
      </Section>

      <Section bg="ion-soft">
        <div id="community" className="scroll-mt-24 max-w-3xl mx-auto rounded-2xl bg-white border border-ion p-8 md:p-10">
          <p className="eyebrow text-eventide">Community Supporter</p>
          <h2 className="mt-3 text-2xl md:text-3xl font-semibold text-midnight">
            Stand with Zenith.
          </h2>
          <p className="mt-3 text-midnight-75">
            Educators, neighbors, business owners, alumni, and faith leaders — your support shows the
            Arizona State Board for Charter Schools that this community wants this school.
          </p>
          <div className="mt-8">
            <CommunityForm />
          </div>
        </div>
      </Section>

      <Section bg="white">
        <div id="partner" className="scroll-mt-24 max-w-3xl mx-auto rounded-2xl bg-ion-soft border border-ion p-8 md:p-10">
          <p className="eyebrow text-eventide">Partner Inquiry</p>
          <h2 className="mt-3 text-2xl md:text-3xl font-semibold text-midnight">
            Partner with Zenith.
          </h2>
          <p className="mt-3 text-midnight-75">
            Internship hosts, mentors, dual enrollment partners, donors, sponsors, vendors — let&apos;s
            talk about how your organization can help Zenith students go further.
          </p>
          <div className="mt-8">
            <PartnerForm />
          </div>
        </div>
      </Section>
    </>
  );
}

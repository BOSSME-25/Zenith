import { Section } from "@/components/Section";
import { ContactForm } from "@/components/forms/ContactForm";

export const metadata = {
  title: "Contact",
  description:
    "Contact Zenith College and Career Prep — questions from families, partnership inquiries, and community feedback. We read every message.",
};

export default function ContactPage() {
  return (
    <>
      <Section
        eyebrow="Contact"
        title="We&apos;d love to hear from you."
        description="Questions about Zenith, the charter application, partnership ideas, or anything else — drop us a note and we&apos;ll get back to you."
        bg="white"
      />
      <Section bg="ion-soft">
        <div className="max-w-2xl mx-auto rounded-2xl bg-white border border-ion p-8 md:p-10">
          <ContactForm />
        </div>
      </Section>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/Section";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "How Zenith College and Career Prep collects, uses and protects the information families and community members share on this website.",
  alternates: { canonical: "/privacy" },
};

const UPDATED = "November 2026";

const linkClass =
  "font-semibold text-eventide underline underline-offset-2 hover:text-midnight";

function Block({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="border-t border-eventide-25 pt-8 first:border-t-0 first:pt-0">
      <h2 id={id} className="text-xl md:text-2xl font-semibold text-midnight">
        {title}
      </h2>
      <div className="mt-4 space-y-4 leading-relaxed text-midnight">{children}</div>
    </section>
  );
}

const list = "list-disc space-y-2 pl-5";

/**
 * Plain-language privacy page. Every statement here matches what the site
 * actually does (the forms, the database, the sign-in cookie), so change this
 * page whenever a form or a service changes. Have the school's counsel review
 * it before it is treated as final.
 */
export default function PrivacyPage() {
  return (
    <>
      <Section
        titleAs="h1"
        eyebrow="Privacy"
        title="How we handle your information."
        description="Zenith College and Career Prep is a public charter school opening in Maryvale in August 2027. This page explains what this website collects, why, who sees it, and what you can ask us to do."
        bg="white"
        className="pb-8 md:pb-10"
      >
        <p className="text-sm text-midnight-75">Last updated {UPDATED}</p>
      </Section>

      <Section bg="ion-soft" className="pt-10 md:pt-14">
        <div className="max-w-3xl space-y-8">
          <Block id="summary" title="The short version">
            <ul className={list}>
              <li>We collect only what you choose to send us through our forms.</li>
              <li>We use it to run enrollment, answer you, and keep you informed about the school.</li>
              <li>We do not sell your information, and we do not run advertising or tracking cookies on this site.</li>
              <li>You can ask us what we have, to correct it, or to delete it.</li>
            </ul>
          </Block>

          <Block id="apply" title="The application">
            <p>
              The application at <Link href="/apply" className={linkClass}>zenithccprep.org/apply</Link> is
              a form from <strong className="font-semibold">Cognito Forms</strong>, a third-party service.
              What you enter goes to Cognito Forms and is received by Zenith. It is not stored in this
              website&apos;s own database. Cognito Forms handles it under its own privacy policy.
            </p>
            <p>
              Notifications about new applications may pass through an automation service so the right
              people at the school are told promptly. We use what you share to process enrollment at Zenith
              College and Career Prep. Please share only what the form asks for.
            </p>
          </Block>

          <Block id="forms" title="What our other forms collect">
            <p>These forms store what you type in the site&apos;s own database:</p>
            <ul className={list}>
              <li>
                <strong className="font-semibold">Interest list for families:</strong> a parent or guardian&apos;s
                name, email and optional phone number, the student&apos;s name, current and expected grade,
                ZIP code, how you prefer to be contacted, and how you heard about us.
              </li>
              <li>
                <strong className="font-semibold">Community sign-up:</strong> your name, email, ZIP code, how you
                relate to the school, and what you would like to hear about.
              </li>
              <li>
                <strong className="font-semibold">Partners:</strong> your organization, a contact name, email,
                optional phone, your interests, and a short description.
              </li>
              <li>
                <strong className="font-semibold">Community survey:</strong> your answers about career
                pathways and what matters to your family. Your name and email are optional.
              </li>
              <li>
                <strong className="font-semibold">Contact and newsletter:</strong> your name, email, and your
                message or subscription.
              </li>
              <li>
                <strong className="font-semibold">Comets nominations and mentor requests:</strong> the
                nominator&apos;s name, relationship and email, the nominee&apos;s name and grade or graduation year,
                a short description, and any contact details you add for the nominee. Nominations are
                reviewed by staff first. Nothing is published without the person&apos;s consent on file, and for
                students under 18, a parent or guardian&apos;s consent.
              </li>
            </ul>
            <p>
              Our forms are meant for parents, guardians and other adults. Please do not use them to send
              us information directly from a child.
            </p>
          </Block>

          <Block id="use" title="How we use it">
            <ul className={list}>
              <li>To process enrollment and answer questions about the school.</li>
              <li>To send the updates, newsletter or meeting notices you asked for.</li>
              <li>To plan the school with the community, for example which career pathways families want.</li>
              <li>To keep the website safe from spam and abuse.</li>
            </ul>
            <p>We do not sell your information or use it for advertising.</p>
          </Block>

          <Block id="who" title="Who sees it">
            <ul className={list}>
              <li>
                <strong className="font-semibold">School staff and board members</strong> who need it to do their
                work. Each person signs in to the website&apos;s administration area with their own login.
              </li>
              <li>
                <strong className="font-semibold">Service providers that run this website:</strong> a web host, a
                database service, a file-storage service for board meeting documents, and an email delivery
                service for notifications and replies. They handle information only to provide those services.
              </li>
              <li>
                <strong className="font-semibold">Cognito Forms</strong> for the application, as described above.
              </li>
              <li>
                <strong className="font-semibold">The public</strong>, for anything we are required or choose to
                publish: board meeting notices, agendas and minutes, and Comets profiles that have consent.
                We never publish nominator emails or contact details.
              </li>
              <li>Anyone the law requires us to share it with.</li>
            </ul>
          </Block>

          <Block id="cookies" title="Cookies, tracking and bot protection">
            <ul className={list}>
              <li>This site does not use advertising or analytics cookies or trackers.</li>
              <li>
                If we open the enrollment pop-up and you close it, your browser remembers that for a few days
                so it does not keep reappearing. That choice stays in your browser and is not sent to us.
              </li>
              <li>
                Staff who sign in to the administration area receive a sign-in cookie. Visitors do not.
              </li>
              <li>
                To limit spam, some forms use Cloudflare Turnstile and keep a scrambled (hashed) version of
                your network address for about a day. We do not store the address itself.
              </li>
              <li>
                Our welcome video and Instagram link are served from other services. If you follow the
                Instagram link or watch media hosted elsewhere, that service&apos;s own policies apply.
              </li>
              <li>
                If we advertise elsewhere, the advertising platforms have their own policies. Clicking an ad
                brings you to this site, but nothing on this site passes your details to them.
              </li>
            </ul>
          </Block>

          <Block id="keep" title="How long we keep it and how we protect it">
            <p>
              We keep information for as long as we need it for the purposes above, then delete it. Records
              the school must keep by law, such as meeting minutes, are kept as the law requires. Information
              is stored with reputable service providers behind secured logins, and only the people who need
              it can open it.
            </p>
          </Block>

          <Block id="rights" title="Your choices">
            <p>
              You can ask us what information we hold about you or your child, ask us to correct it, or ask
              us to delete it. You can unsubscribe from any email we send. For anything you sent through
              the application, we will work with Cognito Forms to act on your request.
            </p>
            <p>
              To make a request, use our <Link href="/contact" className={linkClass}>contact form</Link> and
              say what you need. We will reply as soon as we can.
            </p>
          </Block>

          <Block id="changes" title="Changes to this page">
            <p>
              If we change how this website handles information, we will update this page and the date at
              the top.
            </p>
          </Block>
        </div>
      </Section>
    </>
  );
}

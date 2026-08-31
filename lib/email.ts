import "server-only";
import { Resend } from "resend";

const MIDNIGHT = "#06243F";
const ION = "#BEE5EE";
const ION_SOFT = "#EFF8FB";
const EVENTIDE = "#42778C";

function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

function getResendClient(): Resend | null {
  if (!isEmailConfigured()) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

function fromAddress(): string {
  return process.env.EMAIL_FROM || "Zenith College and Career Prep <noreply@zenithccprep.org>";
}

function teamRecipient(): string | null {
  return process.env.NOTIFICATION_EMAIL || null;
}

type SendArgs = {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
};

async function send({ to, subject, html, replyTo }: SendArgs): Promise<{ ok: boolean; reason?: string }> {
  const client = getResendClient();
  if (!client) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[zenith][email-noop] would send "${subject}" to ${Array.isArray(to) ? to.join(", ") : to}`,
      );
    }
    return { ok: false, reason: "email-not-configured" };
  }
  try {
    const { error } = await client.emails.send({
      from: fromAddress(),
      to,
      subject,
      html,
      replyTo,
    });
    if (error) return { ok: false, reason: error.message };
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : "send-failed" };
  }
}

function shell(title: string, inner: string): string {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8" /><title>${title}</title></head>
<body style="margin:0;background:${ION_SOFT};font-family:'Helvetica Neue',Arial,sans-serif;color:${MIDNIGHT};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${ION_SOFT};padding:32px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid ${ION};">
        <tr><td style="background:${MIDNIGHT};padding:24px 32px;color:#ffffff;">
          <div style="font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:${ION};">Zenith College and Career Prep</div>
          <div style="font-size:22px;font-weight:600;margin-top:6px;">${title}</div>
        </td></tr>
        <tr><td style="padding:32px;font-size:15px;line-height:1.6;color:${MIDNIGHT};">${inner}</td></tr>
        <tr><td style="padding:20px 32px;background:${ION_SOFT};border-top:1px solid ${ION};font-size:12px;color:${EVENTIDE};letter-spacing:.16em;text-transform:uppercase;text-align:center;">
          Elevating Every Future
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function row(label: string, value: string | null | undefined): string {
  if (!value) return "";
  return `<tr><td style="padding:6px 0;font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:${EVENTIDE};width:200px;vertical-align:top;">${label}</td><td style="padding:6px 0;font-size:15px;color:${MIDNIGHT};">${escapeHtml(value)}</td></tr>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function fieldsTable(fields: Record<string, string | string[] | null | undefined>): string {
  const rows = Object.entries(fields)
    .map(([k, v]) => {
      if (v == null) return "";
      const val = Array.isArray(v) ? v.join(", ") : v;
      return row(k, val);
    })
    .filter(Boolean)
    .join("");
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">${rows}</table>`;
}

const closingSignature = `
  <p style="margin-top:28px;">With gratitude,<br/><strong>The Zenith Founding Team</strong></p>
  <p style="margin-top:12px;font-size:13px;color:${EVENTIDE};">Zenith College and Career Prep · Maryvale, Phoenix, AZ</p>
`;

export type FamilyEmail = {
  parent_name: string;
  email: string;
  phone?: string | null;
  student_name: string;
  current_grade: string;
  expected_grade: string;
  zip_code: string;
  preferred_contact: string;
  how_heard?: string | null;
};

export async function sendFamilyEmails(data: FamilyEmail) {
  const team = teamRecipient();
  const teamHtml = shell(
    `New family interest: ${escapeHtml(data.parent_name)}`,
    `<p>A new family submitted the Interest List form.</p>${fieldsTable({
      "Parent/Guardian": data.parent_name,
      "Email": data.email,
      "Phone": data.phone || "—",
      "Student": data.student_name,
      "Current Grade": data.current_grade,
      "Expected Grade at Opening": data.expected_grade,
      "Zip Code": data.zip_code,
      "Preferred Contact": data.preferred_contact,
      "How They Heard": data.how_heard || "—",
    })}`,
  );

  const confirmHtml = shell(
    "Thank you for joining the interest list",
    `<p>Hi ${escapeHtml(data.parent_name.split(" ")[0] || data.parent_name)},</p>
     <p>Thank you for adding your family to the Zenith Interest List. We're honored that you're considering Zenith for ${escapeHtml(data.student_name)}.</p>
     <p>Zenith College and Career Prep is currently in the application phase with the Arizona State Board for Charter Schools. As our charter application progresses, we'll keep you informed about open houses, community forums, the enrollment timeline, and other milestones — by your preferred contact method (${escapeHtml(data.preferred_contact)}).</p>
     <p>In the meantime, share Zenith with a friend or visit our website to take the Community Survey and help us design a school worthy of Maryvale.</p>
     ${closingSignature}`,
  );

  const results = await Promise.all([
    team
      ? send({ to: team, subject: `New family interest: ${data.parent_name}`, html: teamHtml, replyTo: data.email })
      : Promise.resolve({ ok: false, reason: "no-team-recipient" }),
    send({ to: data.email, subject: "Welcome to the Zenith Interest List", html: confirmHtml }),
  ]);
  return { team: results[0], confirmation: results[1] };
}

export type CommunityEmail = {
  name: string;
  email: string;
  zip_code: string;
  roles: string[];
  other_role?: string | null;
  interests: string[];
};

export async function sendCommunityEmails(data: CommunityEmail) {
  const team = teamRecipient();
  const teamHtml = shell(
    `New community supporter: ${escapeHtml(data.name)}`,
    `<p>A new community supporter signed up.</p>${fieldsTable({
      "Name": data.name,
      "Email": data.email,
      "Zip Code": data.zip_code,
      "Roles": data.roles,
      "Other Role": data.other_role || "—",
      "Interested In": data.interests,
    })}`,
  );
  const confirmHtml = shell(
    "Thank you for standing with Zenith",
    `<p>Hi ${escapeHtml(data.name.split(" ")[0] || data.name)},</p>
     <p>Thank you for joining the Zenith community of supporters. Charter schools rise because communities show up, and your name on this list is part of how we demonstrate demand to the Arizona State Board for Charter Schools.</p>
     <p>We'll be in touch with the kinds of updates you asked for. If you'd like to do more — share Zenith with a neighbor, invite us to a community gathering, or simply reply to this email with ideas.</p>
     ${closingSignature}`,
  );
  const results = await Promise.all([
    team
      ? send({ to: team, subject: `New community supporter: ${data.name}`, html: teamHtml, replyTo: data.email })
      : Promise.resolve({ ok: false, reason: "no-team-recipient" }),
    send({ to: data.email, subject: "Welcome to the Zenith community", html: confirmHtml }),
  ]);
  return { team: results[0], confirmation: results[1] };
}

export type PartnerEmail = {
  organization: string;
  contact_name: string;
  email: string;
  phone?: string | null;
  interests: string[];
  description: string;
};

export async function sendPartnerEmails(data: PartnerEmail) {
  const team = teamRecipient();
  const teamHtml = shell(
    `New partner inquiry: ${escapeHtml(data.organization)}`,
    `<p>A new partner inquiry was submitted.</p>${fieldsTable({
      "Organization": data.organization,
      "Contact": data.contact_name,
      "Email": data.email,
      "Phone": data.phone || "—",
      "Partnership Interests": data.interests,
      "Description": data.description,
    })}`,
  );
  const confirmHtml = shell(
    "Thank you for reaching out about partnership",
    `<p>Hi ${escapeHtml(data.contact_name.split(" ")[0] || data.contact_name)},</p>
     <p>Thank you for your interest in partnering with Zenith College and Career Prep. Real-world experience — through internships, mentorship, and community partnerships — is one of the pillars of what we're building. Partners like ${escapeHtml(data.organization)} make that possible.</p>
     <p>Our team will review your inquiry and follow up to schedule a conversation about how we might work together as Zenith progresses through charter authorization.</p>
     ${closingSignature}`,
  );
  const results = await Promise.all([
    team
      ? send({ to: team, subject: `New partner inquiry: ${data.organization}`, html: teamHtml, replyTo: data.email })
      : Promise.resolve({ ok: false, reason: "no-team-recipient" }),
    send({ to: data.email, subject: "Thank you for your interest in partnering with Zenith", html: confirmHtml }),
  ]);
  return { team: results[0], confirmation: results[1] };
}

export type SurveyEmail = {
  is_resident: boolean | null;
  has_child: boolean | null;
  career_pathways: string[];
  important_to_family?: string | null;
  name?: string | null;
  email?: string | null;
};

export async function sendSurveyEmails(data: SurveyEmail) {
  const team = teamRecipient();
  const teamHtml = shell(
    `New community survey response${data.name ? `: ${escapeHtml(data.name)}` : ""}`,
    `<p>A new community survey response was submitted.</p>${fieldsTable({
      "Maryvale Resident": data.is_resident == null ? "—" : data.is_resident ? "Yes" : "No",
      "Has Child Who Could Attend": data.has_child == null ? "—" : data.has_child ? "Yes" : "No",
      "Career Pathways": data.career_pathways,
      "Most Important in a High School": data.important_to_family || "—",
      "Name": data.name || "—",
      "Email": data.email || "—",
    })}`,
  );
  const tasks: Promise<{ ok: boolean; reason?: string }>[] = [
    team
      ? send({
          to: team,
          subject: `New community survey response${data.name ? `: ${data.name}` : ""}`,
          html: teamHtml,
          replyTo: data.email || undefined,
        })
      : Promise.resolve({ ok: false, reason: "no-team-recipient" }),
  ];
  if (data.email) {
    const confirmHtml = shell(
      "Thank you for your input",
      `<p>Hi${data.name ? ` ${escapeHtml(data.name.split(" ")[0] || data.name)}` : ""},</p>
       <p>Thank you for taking the Zenith Community Survey. Your answers help us design a high school that reflects what Maryvale families actually want and need.</p>
       <p>We'll share what we hear back with the community as we move through charter authorization.</p>
       ${closingSignature}`,
    );
    tasks.push(send({ to: data.email, subject: "Thank you for your input on Zenith", html: confirmHtml }));
  }
  const results = await Promise.all(tasks);
  return { team: results[0], confirmation: results[1] ?? null };
}

export type ContactEmail = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export async function sendContactEmails(data: ContactEmail) {
  const team = teamRecipient();
  const teamHtml = shell(
    `New contact message: ${escapeHtml(data.subject)}`,
    `<p>A new message was submitted through the contact form.</p>${fieldsTable({
      "Name": data.name,
      "Email": data.email,
      "Subject": data.subject,
    })}
     <p style="margin-top:20px;font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:${EVENTIDE};">Message</p>
     <p style="white-space:pre-wrap;background:${ION_SOFT};padding:16px;border-radius:8px;">${escapeHtml(data.message)}</p>`,
  );
  const confirmHtml = shell(
    "We received your message",
    `<p>Hi ${escapeHtml(data.name.split(" ")[0] || data.name)},</p>
     <p>Thank you for reaching out to Zenith College and Career Prep. We've received your message about "${escapeHtml(data.subject)}" and a member of our team will respond soon.</p>
     ${closingSignature}`,
  );
  const results = await Promise.all([
    team
      ? send({ to: team, subject: `New contact message: ${data.subject}`, html: teamHtml, replyTo: data.email })
      : Promise.resolve({ ok: false, reason: "no-team-recipient" }),
    send({ to: data.email, subject: "We received your message", html: confirmHtml }),
  ]);
  return { team: results[0], confirmation: results[1] };
}

export type NominationEmail = {
  nominee_name: string;
  nominee_grade_or_grad_year: string;
  nominator_name: string;
  nominator_relationship: string;
  nominator_email: string;
  milestone_label: string;
  description: string;
  nominee_contact_info?: string | null;
};

export async function sendNominationEmails(data: NominationEmail) {
  const team = teamRecipient();
  const teamHtml = shell(
    `New Comet nomination: ${escapeHtml(data.nominee_name)}`,
    `<p>A new nomination is waiting in the moderation queue. Nothing is published until a staff member approves it and consent is on file.</p>${fieldsTable(
      {
        "Nominee": data.nominee_name,
        "Grade / grad year": data.nominee_grade_or_grad_year,
        "Milestone": data.milestone_label,
        "Nominated by": data.nominator_name,
        "Relationship": data.nominator_relationship,
        "Nominator email": data.nominator_email,
        "Nominee contact": data.nominee_contact_info || null,
      },
    )}
     <p style="margin-top:20px;font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:${EVENTIDE};">Their story</p>
     <p style="white-space:pre-wrap;background:${ION_SOFT};padding:16px;border-radius:8px;">${escapeHtml(data.description)}</p>
     <p style="margin-top:20px;">Review it in the admin under <strong>Nominations</strong>.</p>`,
  );
  const confirmHtml = shell(
    "Thank you for your nomination",
    `<p>Hi ${escapeHtml(data.nominator_name.split(" ")[0] || data.nominator_name)},</p>
     <p>Thank you for nominating <strong>${escapeHtml(data.nominee_name)}</strong>. Our team reviews every nomination by hand.</p>
     <p>If we move forward, we'll reach out before anything is published — we always confirm consent first, and for current students that means a parent or guardian signs off.</p>
     ${closingSignature}`,
  );
  const results = await Promise.all([
    team
      ? send({
          to: team,
          subject: `New Comet nomination: ${data.nominee_name}`,
          html: teamHtml,
          replyTo: data.nominator_email,
        })
      : Promise.resolve({ ok: false, reason: "no-team-recipient" }),
    send({ to: data.nominator_email, subject: "Thank you for your nomination", html: confirmHtml }),
  ]);
  return { team: results[0], confirmation: results[1] };
}

export type MentorConnectEmail = {
  comet_name: string;
  sender_name: string;
  sender_email: string;
  message: string;
};

/**
 * Routes a mentor request to the school inbox. The Comet's own contact details
 * are deliberately never used here — staff forward the message themselves.
 */
export async function sendMentorConnectEmail(data: MentorConnectEmail) {
  const team = teamRecipient();
  const teamHtml = shell(
    `Mentor request for ${escapeHtml(data.comet_name)}`,
    `<p>Someone asked to connect with a Comet through the mentor network. Please review and forward it if appropriate.</p>${fieldsTable(
      {
        "Comet": data.comet_name,
        "From": data.sender_name,
        "Reply to": data.sender_email,
      },
    )}
     <p style="margin-top:20px;font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:${EVENTIDE};">Message</p>
     <p style="white-space:pre-wrap;background:${ION_SOFT};padding:16px;border-radius:8px;">${escapeHtml(data.message)}</p>`,
  );
  const confirmHtml = shell(
    "We received your request",
    `<p>Hi ${escapeHtml(data.sender_name.split(" ")[0] || data.sender_name)},</p>
     <p>Thanks for reaching out. Your message is with the Zenith team, and we'll pass it along to ${escapeHtml(data.comet_name)} if they're available to connect.</p>
     ${closingSignature}`,
  );
  const results = await Promise.all([
    team
      ? send({
          to: team,
          subject: `Mentor request for ${data.comet_name}`,
          html: teamHtml,
          replyTo: data.sender_email,
        })
      : Promise.resolve({ ok: false, reason: "no-team-recipient" }),
    send({ to: data.sender_email, subject: "We received your request", html: confirmHtml }),
  ]);
  return { team: results[0], confirmation: results[1] };
}

import { z } from "zod";

export const familySchema = z.object({
  parent_name: z.string().trim().min(2, "Please enter the parent or guardian's name."),
  email: z.string().trim().email("Please enter a valid email."),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  student_name: z.string().trim().min(2, "Please enter the student's name."),
  current_grade: z.enum(["6", "7", "8", "9", "10", "11"], {
    message: "Please choose the student's current grade.",
  }),
  expected_grade: z.enum(["9", "10", "11", "12"], {
    message: "Please choose the expected grade at Zenith opening.",
  }),
  zip_code: z
    .string()
    .trim()
    .regex(/^\d{5}$/, "Zip code must be five digits."),
  preferred_contact: z.enum(["email", "phone", "text"], {
    message: "Please choose a preferred contact method.",
  }),
  how_heard: z.string().trim().max(2000).optional().or(z.literal("")),
});
export type FamilyInput = z.infer<typeof familySchema>;

export const COMMUNITY_ROLES = [
  "Educator",
  "Neighbor",
  "Business Owner",
  "Alumni",
  "Faith Leader",
  "Other",
] as const;

export const COMMUNITY_INTERESTS = [
  "Newsletter",
  "Board meeting invites",
  "Volunteer opportunities",
  "Advocacy moments",
] as const;

export const communitySchema = z.object({
  name: z.string().trim().min(2, "Please enter your name."),
  email: z.string().trim().email("Please enter a valid email."),
  zip_code: z
    .string()
    .trim()
    .regex(/^\d{5}$/, "Zip code must be five digits."),
  roles: z.array(z.enum(COMMUNITY_ROLES)).min(1, "Choose at least one role."),
  other_role: z.string().trim().max(500).optional().or(z.literal("")),
  interests: z.array(z.enum(COMMUNITY_INTERESTS)).default([]),
});
export type CommunityInput = z.infer<typeof communitySchema>;

export const PARTNER_INTERESTS = [
  "Internship host",
  "Mentor",
  "Dual enrollment partner",
  "Donor/Sponsor",
  "Vendor",
  "Other",
] as const;

export const partnerSchema = z.object({
  organization: z.string().trim().min(2, "Please enter your organization."),
  contact_name: z.string().trim().min(2, "Please enter a contact name."),
  email: z.string().trim().email("Please enter a valid email."),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  interests: z.array(z.enum(PARTNER_INTERESTS)).min(1, "Choose at least one partnership interest."),
  description: z.string().trim().min(10, "Please share a brief description (10+ characters)."),
});
export type PartnerInput = z.infer<typeof partnerSchema>;

export const CAREER_PATHWAYS = [
  "Healthcare",
  "Technology",
  "Engineering",
  "Arts",
  "Business",
  "Education",
  "Skilled Trades",
] as const;

export const surveySchema = z.object({
  is_resident: z.enum(["yes", "no"]).optional(),
  has_child: z.enum(["yes", "no"]).optional(),
  career_pathways: z.array(z.enum(CAREER_PATHWAYS)).default([]),
  important_to_family: z.string().trim().max(4000).optional().or(z.literal("")),
  name: z.string().trim().max(120).optional().or(z.literal("")),
  email: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || /[^\s@]+@[^\s@]+\.[^\s@]+/.test(v), "Please enter a valid email or leave it blank."),
});
export type SurveyInput = z.infer<typeof surveySchema>;

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name."),
  email: z.string().trim().email("Please enter a valid email."),
  subject: z.string().trim().min(2, "Please add a subject."),
  message: z.string().trim().min(10, "Please share at least a sentence or two."),
});
export type ContactInput = z.infer<typeof contactSchema>;

export const newsletterSchema = z.object({
  email: z.string().trim().email("Please enter a valid email."),
  name: z.string().trim().max(120).optional().or(z.literal("")),
});
export type NewsletterInput = z.infer<typeof newsletterSchema>;

export const issueEventSchema = z.object({
  month: z.string().trim().max(12),
  day: z.string().trim().max(8),
  title: z.string().trim().max(200),
  detail: z.string().trim().max(400).optional().or(z.literal("")),
  url: z.string().trim().max(500).optional().or(z.literal("")),
});
export type IssueEvent = z.infer<typeof issueEventSchema>;

const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));

export const newsletterIssueSchema = z.object({
  issue_number: z.coerce.number().int("Issue number must be a whole number.").min(1, "Issue number is required."),
  month_label: z.string().trim().min(2, "Add the month/year label, e.g. September 2027."),
  published: z.boolean().default(false),
  hero_image_url: optionalText(800),
  hero_title: z.string().trim().min(2, "The headline is required."),
  hero_text: optionalText(1000),
  hero_cta_label: optionalText(80),
  hero_cta_url: optionalText(500),
  founder_note: optionalText(2000),
  spotlight_image_url: optionalText(800),
  spotlight_name: optionalText(160),
  spotlight_text: optionalText(2000),
  events: z.array(issueEventSchema).default([]),
  classroom_title: optionalText(200),
  classroom_text: optionalText(2000),
  stat_value: optionalText(40),
  stat_text: optionalText(400),
});
export type NewsletterIssueInput = z.infer<typeof newsletterIssueSchema>;

export const updateSchema = z.object({
  title: z.string().trim().min(2, "Title is required."),
  slug: z
    .string()
    .trim()
    .min(2, "Slug is required.")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and dashes only."),
  body: z.string().trim().min(10, "Body is required."),
  published: z.boolean().default(true),
  publish_date: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v && v.length > 0 ? v : undefined)),
});
export type UpdateInput = z.infer<typeof updateSchema>;

export const MILESTONE_TYPES = [
  "dual_enrollment",
  "cte_certification",
  "ap_score",
  "general_story",
] as const;
export type MilestoneType = (typeof MILESTONE_TYPES)[number];

export const MILESTONE_LABELS: Record<MilestoneType, string> = {
  dual_enrollment: "Dual enrollment",
  cte_certification: "CTE or vocational certification",
  ap_score: "AP achievement",
  general_story: "General story",
};

export const NOMINATOR_RELATIONSHIPS = ["self", "staff", "family", "community"] as const;
export type NominatorRelationship = (typeof NOMINATOR_RELATIONSHIPS)[number];

export const RELATIONSHIP_LABELS: Record<NominatorRelationship, string> = {
  self: "Self",
  staff: "Staff",
  family: "Family member",
  community: "Community member",
};

export const COMET_STATUSES = ["in_motion", "landed"] as const;
export type CometStatus = (typeof COMET_STATUSES)[number];

export const NOMINATION_STATUSES = ["pending", "approved", "rejected"] as const;
export type NominationStatus = (typeof NOMINATION_STATUSES)[number];

/**
 * Public nomination submission. `website` is the honeypot — it is rendered
 * off-screen and must arrive empty. `form_loaded_at` backs the time trap.
 */
export const nominationSchema = z.object({
  nominee_name: z.string().trim().min(2, "Please enter the nominee's name."),
  nominee_grade_or_grad_year: z
    .string()
    .trim()
    .min(1, "Add their current grade or graduation year.")
    .max(60),
  nominator_name: z.string().trim().min(2, "Please enter your name."),
  nominator_relationship: z.enum(NOMINATOR_RELATIONSHIPS, {
    message: "Please choose your relationship to the nominee.",
  }),
  nominator_email: z.string().trim().email("Please enter a valid email."),
  milestone_type: z.enum(MILESTONE_TYPES, {
    message: "Please choose the kind of milestone.",
  }),
  description: z
    .string()
    .trim()
    .min(20, "Please share two or three sentences.")
    .max(500, "Please keep this under 500 characters."),
  nominee_contact_info: z.string().trim().max(1000).optional().or(z.literal("")),
});
export type NominationInput = z.infer<typeof nominationSchema>;

export const mentorConnectSchema = z.object({
  comet_id: z.coerce.number().int().min(1),
  sender_name: z.string().trim().min(2, "Please enter your name."),
  sender_email: z.string().trim().email("Please enter a valid email."),
  message: z
    .string()
    .trim()
    .min(20, "Please share at least a sentence or two.")
    .max(2000, "Please keep this under 2000 characters."),
});
export type MentorConnectInput = z.infer<typeof mentorConnectSchema>;

const optionalNumber = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((v) => (v && v.length > 0 ? Number(v) : null))
  .refine((v) => v === null || Number.isFinite(v), "Please enter a number.");

export const cometProfileSchema = z.object({
  status: z.enum(COMET_STATUSES),
  name: z.string().trim().min(2, "Name is required."),
  photo_url: optionalText(800),
  grad_year: optionalNumber,
  current_grade: optionalNumber,
  milestone_type: z.enum(MILESTONE_TYPES),
  headline: z.string().trim().min(2, "Add a short headline for the card.").max(240),
  full_story: optionalText(6000),
  certifications: z.array(z.string().trim().max(80)).default([]),
  field_or_institution: optionalText(240),
  current_role_or_program: optionalText(240),
  mentor_opt_in: z.boolean().default(false),
  tags: z.array(z.string().trim().max(60)).default([]),
  consent_on_file: z.boolean().default(false),
  consent_recorded_by: optionalText(240),
  featured_quarter: optionalText(20),
});
export type CometProfileInput = z.infer<typeof cometProfileSchema>;

/** Splits a comma-separated admin input into a clean string array. */
export function parseList(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 25);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-")
    .slice(0, 80);
}

export type ActionState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string; fieldErrors?: Record<string, string> };

export const idleState: ActionState = { status: "idle" };

export function fieldErrorsFromZod(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

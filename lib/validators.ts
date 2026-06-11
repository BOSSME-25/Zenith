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

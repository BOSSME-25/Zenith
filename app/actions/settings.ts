"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isDbConfigured } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";
import { type ActionState, fieldErrorsFromZod } from "@/lib/validators";
import {
  accommodationSchema,
  enrollmentPopupSchema,
  getPosters,
  noticeLocationSchema,
  nondiscriminationSchema,
  postersSchema,
  saveSetting,
  schoolYearSchema,
  schedulePdfSchema,
  writeAudit,
} from "@/lib/meetings";
import {
  MAX_PDF_BYTES,
  MEETING_FILE_RE,
  blobPathname,
  isBlobUrl,
} from "@/lib/meetings-shared";

async function assertAdmin() {
  if (!(await isAuthenticated())) redirect("/admin/login");
}

const NO_DB: ActionState = {
  status: "error",
  message: "The database is not configured, so settings cannot be saved.",
};

/**
 * Settings change what the public sees, so each save names a person from the
 * posting list. The list itself is the one exception: it has to be set before
 * anyone can be named.
 */
async function requireActor(formData: FormData): Promise<{ actor: string } | ActionState> {
  const actor = String(formData.get("posted_by") ?? "").trim();
  const posters = await getPosters();
  if (!actor || !posters.includes(actor)) {
    return {
      status: "error",
      message: "Choose your name under Posted by. If the list is empty, add names in the first box on this page.",
    };
  }
  return { actor };
}

function refresh() {
  revalidatePath("/public-meetings");
  revalidatePath("/admin/settings");
  revalidatePath("/admin/meetings");
}

const isState = (v: { actor: string } | ActionState): v is ActionState => "status" in v;

export async function savePosters(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await assertAdmin();
  if (!isDbConfigured()) return NO_DB;
  const names = String(formData.get("names") ?? "")
    .split("\n")
    .map((n) => n.trim())
    .filter(Boolean);
  const unique = Array.from(new Set(names));
  const parsed = postersSchema.safeParse(unique);
  if (!parsed.success) {
    return { status: "error", message: "Use up to 20 names, each under 80 characters." };
  }
  await saveSetting("posters", parsed.data, null);
  await writeAudit(null, "settings_posters", "settings", { count: parsed.data.length });
  refresh();
  return {
    status: "success",
    message:
      parsed.data.length >= 2
        ? "Saved."
        : "Saved. Name at least two people, so a notice never depends on one person being available.",
  };
}

export async function saveNoticeLocation(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();
  if (!isDbConfigured()) return NO_DB;
  const who = await requireActor(formData);
  if (isState(who)) return who;
  const parsed = noticeLocationSchema.safeParse({ location: String(formData.get("location") ?? "") });
  if (!parsed.success) {
    return { status: "error", message: "Keep the location under 300 characters." };
  }
  await saveSetting("notice_location", parsed.data, who.actor);
  await writeAudit(null, "settings_notice_location", who.actor, { location: parsed.data.location });
  refresh();
  return {
    status: "success",
    message: parsed.data.location
      ? "Saved. The public notice now names this physical location."
      : "Cleared. The public notice names the website only until a location is set.",
  };
}

export async function saveAccommodation(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();
  if (!isDbConfigured()) return NO_DB;
  const who = await requireActor(formData);
  if (isState(who)) return who;
  const rawDays = String(formData.get("days") ?? "").trim();
  const parsed = accommodationSchema.safeParse({
    contact: String(formData.get("contact") ?? ""),
    reach: String(formData.get("reach") ?? ""),
    days: rawDays === "" ? null : Number(rawDays),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please correct the highlighted fields.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }
  const a = parsed.data;
  const filled = [a.contact, a.reach, a.days].filter((v) => v !== "" && v !== null).length;
  if (filled > 0 && filled < 3) {
    return {
      status: "error",
      message: "Fill in all three, or clear all three. The public line needs every part.",
    };
  }
  await saveSetting("accommodation_contact", a, who.actor);
  refresh();
  return { status: "success", message: filled ? "Saved." : "Cleared. The accommodation line is hidden." };
}

export async function saveSchoolYear(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await assertAdmin();
  if (!isDbConfigured()) return NO_DB;
  const who = await requireActor(formData);
  if (isState(who)) return who;
  const parsed = schoolYearSchema.safeParse({
    month: Number(formData.get("month")),
    day: Number(formData.get("day")),
  });
  if (!parsed.success) return { status: "error", message: "Choose a valid month and day." };
  await saveSetting("school_year_start", parsed.data, who.actor);
  refresh();
  return { status: "success", message: "Saved. The archive regroups itself." };
}

export async function saveNondiscrimination(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();
  if (!isDbConfigured()) return NO_DB;
  const who = await requireActor(formData);
  if (isState(who)) return who;
  const parsed = nondiscriminationSchema.safeParse({ text: String(formData.get("text") ?? "") });
  if (!parsed.success) return { status: "error", message: "Keep it under 1,200 characters." };
  await saveSetting("nondiscrimination", parsed.data, who.actor);
  refresh();
  return {
    status: "success",
    message: parsed.data.text
      ? "Saved. It shows at the bottom of the Public Meetings page."
      : "Cleared. Nothing shows at the bottom of the page.",
  };
}

export async function saveSchedulePdf(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await assertAdmin();
  if (!isDbConfigured()) return NO_DB;
  const who = await requireActor(formData);
  if (isState(who)) return who;
  const url = String(formData.get("blob_url") ?? "");
  const pathname = blobPathname(url);
  const parsed = schedulePdfSchema.safeParse({
    url,
    size: Number(formData.get("size_bytes") ?? 0) || null,
    schoolYear: String(formData.get("school_year") ?? ""),
  });
  if (
    !parsed.success ||
    !isBlobUrl(url) ||
    !MEETING_FILE_RE.test(pathname) ||
    !pathname.startsWith("meetings/zenith-board-schedule-") ||
    (parsed.data.size ?? 0) > MAX_PDF_BYTES
  ) {
    return { status: "error", message: "That file did not upload the expected way. Try again." };
  }
  await saveSetting("schedule_pdf", parsed.data, who.actor);
  await writeAudit(null, "settings_schedule_pdf", who.actor, { file: pathname });
  refresh();
  return { status: "success", message: "Saved. The schedule link on the page now points to this file." };
}

export async function saveEnrollmentPopup(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();
  if (!isDbConfigured()) return NO_DB;
  const who = await requireActor(formData);
  if (isState(who)) return who;

  const s = (k: string) => String(formData.get(k) ?? "").trim();
  const optional = (k: string) => (s(k) === "" ? undefined : s(k));
  const phoenixToIso = (k: string) => {
    const v = s(k);
    if (!v) return undefined;
    const d = new Date(`${v}:00-07:00`);
    return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
  };

  const parsed = enrollmentPopupSchema.safeParse({
    state: s("state"),
    eyebrow: s("eyebrow"),
    headline: s("headline"),
    body: s("body"),
    ctaLabel: s("ctaLabel"),
    ctaUrl: optional("ctaUrl"),
    imageUrl: optional("imageUrl"),
    imageAlt: s("imageAlt"),
    showFrom: phoenixToIso("showFrom"),
    showUntil: phoenixToIso("showUntil"),
    rememberDismissDays: Number(s("rememberDismissDays") || 7),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please correct the highlighted fields.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }
  const p = parsed.data;

  if (p.state === "open" && !p.ctaUrl) {
    return {
      status: "error",
      message: "A pop-up that says enrollment is open needs an application link.",
      fieldErrors: { ctaUrl: "Add the application link before turning this on." },
    };
  }
  if ((p.state === "open" || p.state === "coming_soon") && (!p.headline || !p.body || !p.ctaLabel)) {
    return {
      status: "error",
      message: "Fill in the headline, the text, and the button label before turning this on.",
    };
  }
  if (p.imageUrl && !p.imageAlt) {
    return {
      status: "error",
      message: "Describe the photo for people who cannot see it.",
      fieldErrors: { imageAlt: "Add a short description of the photo." },
    };
  }
  if (p.showFrom && p.showUntil && p.showUntil <= p.showFrom) {
    return {
      status: "error",
      message: "The end date must be after the start date.",
      fieldErrors: { showUntil: "Pick a date after the start." },
    };
  }
  await saveSetting("enrollment_popup", p, who.actor);
  await writeAudit(null, "settings_enrollment_popup", who.actor, { state: p.state });
  refresh();
  return {
    status: "success",
    message:
      p.state === "hidden" || p.state === "closed"
        ? "Saved. The pop-up is off."
        : "Saved. The pop-up appears for visitors within a minute.",
  };
}

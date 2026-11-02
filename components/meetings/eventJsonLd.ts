import type { MeetingRow } from "@/lib/meetings";
import { MEETING_TYPE_LABELS, phoenixParts } from "@/lib/meetings-shared";
import { SITE_URL } from "@/lib/site";

const pad = (n: number) => String(n).padStart(2, "0");

/** ISO 8601 with Arizona's fixed -07:00 offset. */
function phoenixIso(d: Date): string {
  const p = phoenixParts(d);
  return `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}:00-07:00`;
}

export function meetingEventJsonLd(m: MeetingRow): Record<string, unknown> {
  const physical = m.location_name || m.location_address;
  const locations: Record<string, unknown>[] = [];
  if (physical) {
    locations.push({
      "@type": "Place",
      name: m.location_name || m.location_address,
      ...(m.location_address ? { address: m.location_address } : {}),
    });
  }
  if (m.virtual_url) locations.push({ "@type": "VirtualLocation", url: m.virtual_url });

  const mode =
    physical && m.virtual_url
      ? "https://schema.org/MixedEventAttendanceMode"
      : m.virtual_url
        ? "https://schema.org/OnlineEventAttendanceMode"
        : "https://schema.org/OfflineEventAttendanceMode";

  const status =
    m.status === "cancelled"
      ? "https://schema.org/EventCancelled"
      : m.status === "rescheduled"
        ? "https://schema.org/EventRescheduled"
        : "https://schema.org/EventScheduled";

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: m.title || `${MEETING_TYPE_LABELS[m.meeting_type]} Board Meeting`,
    startDate: phoenixIso(m.starts_at),
    ...(m.ends_at ? { endDate: phoenixIso(m.ends_at) } : {}),
    eventStatus: status,
    eventAttendanceMode: mode,
    ...(locations.length ? { location: locations.length === 1 ? locations[0] : locations } : {}),
    organizer: { "@type": "Organization", name: "Zenith Community Schools, Inc.", url: SITE_URL },
    url: `${SITE_URL}/public-meetings/${m.slug}`,
    isAccessibleForFree: true,
  };
}

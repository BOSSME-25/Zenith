import type { MetadataRoute } from "next";
import { safeSql } from "@/lib/db";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

const STATIC_ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/our-story", changeFrequency: "monthly", priority: 0.8 },
  { path: "/school-model", changeFrequency: "monthly", priority: 0.9 },
  { path: "/our-board", changeFrequency: "monthly", priority: 0.6 },
  { path: "/get-involved", changeFrequency: "monthly", priority: 0.9 },
  { path: "/faq", changeFrequency: "monthly", priority: 0.7 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.5 },
  { path: "/updates", changeFrequency: "weekly", priority: 0.8 },
  { path: "/newsletter", changeFrequency: "monthly", priority: 0.7 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  try {
    const { rows: updates } = await safeSql<{ slug: string; updated_at: Date }>`
      SELECT slug, updated_at FROM updates WHERE published = TRUE ORDER BY publish_date DESC
    `;
    for (const update of updates) {
      entries.push({
        url: `${SITE_URL}/updates/${update.slug}`,
        lastModified: update.updated_at,
        changeFrequency: "yearly",
        priority: 0.6,
      });
    }

    const { rows: issues } = await safeSql<{ id: number; updated_at: Date }>`
      SELECT id, updated_at FROM newsletter_issues WHERE published = TRUE ORDER BY issue_number DESC
    `;
    for (const issue of issues) {
      entries.push({
        url: `${SITE_URL}/newsletter/${issue.id}`,
        lastModified: issue.updated_at,
        changeFrequency: "yearly",
        priority: 0.5,
      });
    }
  } catch {
    // If the database is unreachable, still serve the static routes.
  }

  return entries;
}

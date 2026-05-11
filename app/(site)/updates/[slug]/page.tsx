import Link from "next/link";
import { notFound } from "next/navigation";
import { safeSql } from "@/lib/db";
import { Section } from "@/components/Section";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

type UpdateRow = {
  id: number;
  title: string;
  slug: string;
  body: string;
  publish_date: string;
  published: boolean;
};

function formatDate(d: string | Date): string {
  try {
    return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return "";
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { rows } = await safeSql<UpdateRow>`
    SELECT title FROM updates WHERE slug = ${slug} AND published = TRUE LIMIT 1
  `;
  return { title: rows[0]?.title || "Update" };
}

export default async function UpdatePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { rows } = await safeSql<UpdateRow>`
    SELECT id, title, slug, body, publish_date, published FROM updates
    WHERE slug = ${slug} AND published = TRUE LIMIT 1
  `;
  const post = rows[0];
  if (!post) notFound();

  const paragraphs = post.body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  return (
    <>
      <Section bg="white">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/updates"
            className="inline-flex items-center gap-2 text-sm font-semibold text-eventide hover:text-midnight"
          >
            <ArrowLeft size={16} aria-hidden /> All updates
          </Link>
          <p className="mt-8 eyebrow text-eventide">{formatDate(post.publish_date)}</p>
          <h1 className="mt-4 text-3xl md:text-4xl font-bold leading-tight text-midnight">{post.title}</h1>
          <div className="mt-10 space-y-5 text-lg leading-relaxed text-midnight">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}

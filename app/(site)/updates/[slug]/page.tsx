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

  const blocks = post.body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const IMAGE_RE = /^!\[([^\]]*)\]\(([^)\s]+)\)$/;

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
            {blocks.map((block, i) => {
              const img = block.match(IMAGE_RE);
              if (img) {
                const [, alt, src] = img;
                return (
                  <figure key={i} className="my-8">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={alt}
                      loading="lazy"
                      className="w-full rounded-2xl border border-ion"
                    />
                    {alt && (
                      <figcaption className="mt-2 text-sm text-midnight-75 text-center">{alt}</figcaption>
                    )}
                  </figure>
                );
              }
              return <p key={i}>{block}</p>;
            })}
          </div>
        </div>
      </Section>
    </>
  );
}

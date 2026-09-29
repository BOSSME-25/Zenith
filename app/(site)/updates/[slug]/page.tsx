import Link from "next/link";
import { notFound } from "next/navigation";
import { safeSql } from "@/lib/db";
import { Section } from "@/components/Section";
import { JsonLd } from "@/components/JsonLd";
import { SITE_NAME, SITE_URL } from "@/lib/site";
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

function excerptFromBody(body: string, maxLength = 160): string {
  const text = body
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "") // drop markdown images
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).replace(/\s+\S*$/, "")}…`;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { rows } = await safeSql<UpdateRow>`
    SELECT title, body, publish_date FROM updates WHERE slug = ${slug} AND published = TRUE LIMIT 1
  `;
  const post = rows[0];
  if (!post) return { title: "Update" };
  const description = excerptFromBody(post.body);
  return {
    title: post.title,
    description,
    alternates: { canonical: `/updates/${slug}` },
    openGraph: {
      title: post.title,
      description,
      type: "article",
      publishedTime: new Date(post.publish_date).toISOString(),
      url: `/updates/${slug}`,
    },
  };
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

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: excerptFromBody(post.body),
    datePublished: new Date(post.publish_date).toISOString(),
    url: `${SITE_URL}/updates/${post.slug}`,
    mainEntityOfPage: `${SITE_URL}/updates/${post.slug}`,
    author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/brand/zenith-mark.png` },
    },
  };

  return (
    <>
      <JsonLd data={articleSchema} />
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

"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { BoardSilhouette } from "@/components/BoardSilhouette";
import { cn } from "@/lib/cn";

export type BoardMember = {
  name: string;
  focus: string;
  photo?: string;
  tags?: string[];
  paragraphs: string[];
};

function splitPreview(paragraphs: string[]): { preview: string; rest: string[] } {
  // Preview = first two sentences of paragraph 1
  const first = paragraphs[0] || "";
  const sentences = first.match(/[^.!?]+[.!?]+(\s|$)/g) || [first];
  const preview = sentences.slice(0, 2).join("").trim();
  const remainderOfFirst = sentences.slice(2).join("").trim();
  const rest = [
    ...(remainderOfFirst ? [remainderOfFirst] : []),
    ...paragraphs.slice(1),
  ];
  return { preview, rest };
}

export function BoardMemberCard({ member }: { member: BoardMember }) {
  const [open, setOpen] = useState(false);
  const restRef = useRef<HTMLDivElement | null>(null);
  const { preview, rest } = splitPreview(member.paragraphs);
  const hasMore = rest.length > 0;

  return (
    <article className="rounded-2xl bg-white border border-ion p-6 md:p-8 flex flex-col transition-shadow hover:shadow-[0_8px_28px_rgba(6,36,63,0.08)]">
      <div className="flex items-start gap-4">
        {member.photo ? (
          <Image
            src={member.photo}
            alt={`Portrait of ${member.name}`}
            width={160}
            height={160}
            className="w-16 h-16 rounded-xl shrink-0 object-cover bg-midnight"
          />
        ) : (
          <BoardSilhouette className="w-16 h-16 rounded-xl shrink-0" />
        )}
        <div className="min-w-0">
          <p className="text-lg md:text-xl font-semibold text-midnight leading-snug">
            {member.name}
          </p>
          <p className="mt-1 text-sm text-eventide font-medium">
            Board Member &middot; {member.focus}
          </p>
        </div>
      </div>

      {member.tags && member.tags.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {member.tags.map((tag) => (
            <li
              key={tag}
              className="inline-flex items-center rounded-full bg-ion-soft border border-ion px-2.5 py-1 text-xs font-medium text-eventide"
            >
              {tag}
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4 text-sm md:text-base leading-relaxed text-midnight-75">{preview}</p>

      {hasMore && (
        <>
          <div
            ref={restRef}
            className={cn(
              "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
              open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
            )}
            aria-hidden={!open}
          >
            <div className="overflow-hidden">
              <div className="mt-4 space-y-3">
                {rest.map((p, i) => (
                  <p key={i} className="text-sm md:text-base leading-relaxed text-midnight-75">
                    {p}
                  </p>
                ))}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="mt-4 inline-flex items-center gap-1.5 self-start text-sm font-semibold text-eventide hover:text-midnight transition-colors active:scale-95"
          >
            {open ? "Read less" : "Read more"}
            <ChevronDown
              size={16}
              aria-hidden
              className={cn("transition-transform", open && "rotate-180")}
            />
          </button>
        </>
      )}
    </article>
  );
}

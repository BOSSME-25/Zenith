"use client";

import { useMemo, useState, useTransition } from "react";
import { Download, Search, Trash2 } from "lucide-react";
import { deleteSubmission } from "@/app/actions/update";
import { cn } from "@/lib/cn";

export type SubmissionRow = {
  id: number;
  submittedAt: string;
  cells: string[];
  searchBlob: string;
};

export type ColumnHeader = {
  label: string;
  className?: string;
};

type Props = {
  table: "families" | "community" | "partners" | "surveys" | "contacts";
  headers: ColumnHeader[];
  rows: SubmissionRow[];
  emptyLabel?: string;
};

export function SubmissionTable({ table, headers, rows, emptyLabel }: Props) {
  const [query, setQuery] = useState("");
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => row.searchBlob.includes(q));
  }, [rows, query]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <label className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-midnight-50" aria-hidden />
          <input
            type="search"
            placeholder="Search by name or email"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-ion bg-white pl-9 pr-3 py-2.5 text-sm text-midnight focus:border-eventide focus:outline-none focus:ring-2 focus:ring-eventide/40"
          />
        </label>
        <a
          href={`/api/admin/export/${table}`}
          className="inline-flex items-center gap-2 rounded-full bg-midnight px-5 py-2.5 text-sm font-semibold text-white hover:bg-midnight-75"
        >
          <Download size={16} aria-hidden /> Export CSV
        </a>
      </div>

      <div className="rounded-2xl bg-white border border-ion overflow-x-auto">
        {filtered.length === 0 ? (
          <p className="px-6 py-12 text-center text-midnight-75">
            {emptyLabel || (query ? "No matches for that search." : "No submissions yet.")}
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-ion-soft text-eventide">
              <tr>
                <th className="px-5 py-3 text-left font-semibold whitespace-nowrap">Submitted</th>
                {headers.map((h) => (
                  <th key={h.label} className={cn("px-5 py-3 text-left font-semibold", h.className)}>
                    {h.label}
                  </th>
                ))}
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="border-t border-ion/60 align-top">
                  <td className="px-5 py-3 text-midnight-75 whitespace-nowrap">{row.submittedAt}</td>
                  {row.cells.map((cell, i) => (
                    <td key={i} className={cn("px-5 py-3 text-midnight", headers[i]?.className)}>
                      {cell}
                    </td>
                  ))}
                  <td className="px-5 py-3 text-right">
                    <button
                      type="button"
                      disabled={isPending && pendingId === row.id}
                      onClick={() => {
                        if (!confirm("Delete this submission? This cannot be undone.")) return;
                        setPendingId(row.id);
                        startTransition(async () => {
                          await deleteSubmission(table, row.id);
                          setPendingId(null);
                        });
                      }}
                      className="inline-flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
                    >
                      <Trash2 size={14} aria-hidden /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <p className="mt-3 text-xs text-midnight-75">
        Showing {filtered.length} of {rows.length} {rows.length === 1 ? "submission" : "submissions"}.
      </p>
    </div>
  );
}

export function formatSubmittedAt(value: string | Date): string {
  try {
    return new Date(value).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return String(value);
  }
}

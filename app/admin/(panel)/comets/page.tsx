import Link from "next/link";
import { Pencil, ShieldAlert } from "lucide-react";
import { safeSql, isDbConfigured } from "@/lib/db";
import { CometPublishActions } from "@/components/admin/CometPublishActions";
import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";
export const metadata = { title: "Comets" };

type Row = {
  id: number;
  name: string;
  status: string;
  headline: string;
  consent_on_file: boolean;
  mentor_opt_in: boolean;
  published_at: string | null;
  updated_at: string;
};

export default async function AdminCometsPage() {
  const { rows } = await safeSql<Row>`
    SELECT id, name, status, headline, consent_on_file, mentor_opt_in, published_at, updated_at
    FROM comet_profiles
    ORDER BY published_at DESC NULLS FIRST, updated_at DESC
    LIMIT 500
  `;

  const awaitingConsent = rows.filter((r) => !r.consent_on_file).length;

  return (
    <div>
      <header className="mb-6">
        <p className="eyebrow text-eventide">Comets</p>
        <h1 className="mt-2 text-3xl font-semibold text-midnight">Comet Profiles</h1>
        <p className="mt-2 text-midnight-75 max-w-2xl">
          Profiles created from approved nominations. Add a photo, tags, and the consent record,
          then publish. Profiles appear on the public page at <code>/alumni</code>.
        </p>
      </header>

      {!isDbConfigured() && (
        <div className="rounded-xl bg-white border border-ion p-5 text-sm text-midnight mb-6">
          Database is not configured — profiles cannot be listed until <code>POSTGRES_URL</code> is set.
        </div>
      )}

      {awaitingConsent > 0 && (
        <div className="rounded-xl bg-white border border-eventide/40 p-4 mb-6 flex items-start gap-3">
          <ShieldAlert size={18} aria-hidden className="mt-0.5 flex-none text-eventide" />
          <p className="text-sm text-midnight">
            {awaitingConsent} {awaitingConsent === 1 ? "profile is" : "profiles are"} waiting on a
            signed consent release and cannot be published yet. For students under 18 this means
            parent or guardian sign-off.
          </p>
        </div>
      )}

      <div className="rounded-2xl bg-white border border-ion overflow-x-auto">
        {rows.length === 0 ? (
          <p className="px-6 py-12 text-center text-midnight-75">
            No Comet profiles yet. Approve a nomination to create one.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-ion-soft text-eventide">
              <tr>
                <th className="px-5 py-3 text-left font-semibold">Name</th>
                <th className="px-5 py-3 text-left font-semibold">Section</th>
                <th className="px-5 py-3 text-left font-semibold">Consent</th>
                <th className="px-5 py-3 text-left font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-ion/60 align-top">
                  <td className="px-5 py-3">
                    <span className="font-medium text-midnight">{row.name}</span>
                    {row.mentor_opt_in && (
                      <span className="ml-2 inline-flex items-center rounded-full bg-ion-soft px-2 py-0.5 text-[11px] font-semibold text-eventide">
                        Mentor
                      </span>
                    )}
                    <p className="mt-0.5 text-xs text-midnight-75 line-clamp-1 max-w-xs">
                      {row.headline}
                    </p>
                  </td>
                  <td className="px-5 py-3 text-midnight-75 whitespace-nowrap">
                    {row.status === "in_motion" ? "In Motion" : "Landed"}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
                        row.consent_on_file
                          ? "bg-aurora-25 text-eventide"
                          : "bg-red-50 text-red-600",
                      )}
                    >
                      {row.consent_on_file ? "On file" : "Missing"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={
                        row.published_at
                          ? "inline-flex items-center rounded-full bg-aurora-25 text-eventide px-3 py-1 text-xs font-semibold"
                          : "inline-flex items-center rounded-full bg-ion-soft text-midnight-75 px-3 py-1 text-xs font-semibold"
                      }
                    >
                      {row.published_at ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/comets/${row.id}/edit`}
                        className="inline-flex items-center gap-1.5 rounded-md border border-ion px-3 py-1.5 text-xs font-semibold text-midnight hover:bg-ion-soft"
                      >
                        <Pencil size={14} aria-hidden /> Edit
                      </Link>
                      <CometPublishActions
                        id={row.id}
                        published={Boolean(row.published_at)}
                        consentOnFile={row.consent_on_file}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

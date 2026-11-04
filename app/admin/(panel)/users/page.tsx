import { requireSection } from "@/lib/auth";
import { listAdminUsers, type AdminUser } from "@/lib/admin-users";
import { ROLE_DESCRIPTIONS, ROLE_LABELS } from "@/lib/admin-access";
import { CreateUserForm, UserActions } from "@/components/admin/UsersPanel";
import { formatSubmittedAt } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Logins" };

export default async function UsersPage() {
  await requireSection("users");

  let users: AdminUser[] = [];
  let loadError = false;
  try {
    users = await listAdminUsers();
  } catch (err) {
    loadError = true;
    console.error(
      "[zenith][users] Could not load logins. Has /api/init been run on this deployment?",
      err instanceof Error ? err.message : err,
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <header>
        <p className="eyebrow text-eventide">Developer</p>
        <h1 className="mt-2 text-3xl font-semibold text-midnight">Logins</h1>
        <p className="mt-2 text-midnight-75 max-w-2xl">
          Each person signs in with their own email and password, and their name goes into the log
          next to what they post. You sign in with the developer password and are the only one who
          sees this page.
        </p>
      </header>

      <section className="rounded-2xl bg-white border border-ion p-6 md:p-8">
        <h2 className="text-lg font-semibold text-midnight">Roles</h2>
        <dl className="mt-3 grid gap-3 sm:grid-cols-2 text-sm">
          {(["school", "board"] as const).map((r) => (
            <div key={r} className="rounded-xl border border-ion bg-ion-soft p-4">
              <dt className="font-semibold text-midnight">{ROLE_LABELS[r]}</dt>
              <dd className="mt-1 text-midnight-75">{ROLE_DESCRIPTIONS[r]}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="rounded-2xl bg-white border border-ion p-6 md:p-8">
        <h2 className="text-lg font-semibold text-midnight">Add a login</h2>
        <div className="mt-5">
          <CreateUserForm />
        </div>
      </section>

      <section className="rounded-2xl bg-white border border-ion p-6 md:p-8">
        <h2 className="text-lg font-semibold text-midnight">People with a login</h2>
        {loadError ? (
          <p className="mt-3 text-sm text-midnight">
            The logins could not be loaded. If this is a new deployment, run /api/init once to
            create the login table.
          </p>
        ) : users.length === 0 ? (
          <p className="mt-3 text-midnight-75">Nobody yet. Add the first login above.</p>
        ) : (
          <ul className="mt-4 divide-y divide-ion">
            {users.map((u) => {
              const locked = Boolean(u.locked_until && u.locked_until.getTime() > Date.now());
              return (
                <li key={u.id} className="py-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                    <p className="text-base font-semibold text-midnight">
                      {u.name}
                      {u.title ? <span className="font-normal text-midnight-75">, {u.title}</span> : null}
                    </p>
                    <p className="text-sm uppercase tracking-[0.12em] text-eventide font-medium">
                      {ROLE_LABELS[u.role]}
                    </p>
                  </div>
                  <p className="text-sm text-midnight-75">{u.email}</p>
                  <p className="mt-1 text-sm text-midnight">
                    {!u.active
                      ? "Switched off"
                      : locked
                        ? "Locked after too many wrong passwords"
                        : u.must_change_password
                          ? "Has not chosen a password yet"
                          : "Active"}
                    <span className="text-midnight-75">
                      {u.last_login_at ? `, last signed in ${formatSubmittedAt(u.last_login_at)}` : ", never signed in"}
                    </span>
                  </p>
                  <div className="mt-2">
                    <UserActions id={u.id} name={u.name} role={u.role} active={u.active} locked={locked} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

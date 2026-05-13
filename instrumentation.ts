export async function register() {
  // Neon marketplace integration prefixes its env vars with "ZenStore_".
  // Mirror them to the unprefixed names @vercel/postgres expects.
  const map: Array<[string, string]> = [
    ["POSTGRES_URL", "ZenStore_POSTGRES_URL"],
    ["POSTGRES_URL_NON_POOLING", "ZenStore_POSTGRES_URL_NON_POOLING"],
    ["DATABASE_URL", "ZenStore_DATABASE_URL"],
    ["PRISMA_DATABASE_URL", "ZenStore_PRISMA_DATABASE_URL"],
  ];
  for (const [target, source] of map) {
    if (!process.env[target] && process.env[source]) {
      process.env[target] = process.env[source];
    }
  }
}

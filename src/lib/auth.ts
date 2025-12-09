import { betterAuth } from "better-auth";

let _auth: ReturnType<typeof betterAuth> | null = null;

async function createAuth() {
  // Dynamic import to avoid blocking module initialization
  const { LibsqlDialect } = await import("@libsql/kysely-libsql");

  const dialect = new LibsqlDialect({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  return betterAuth({
    database: {
      dialect,
      type: "sqlite",
    },
    baseURL: process.env.BASE_URL ?? "https://punt.sh",
    socialProviders: {
      github: {
        clientId: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      },
    },
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 60 * 5, // 5 minutes
      },
    },
  });
}

export async function getAuth() {
  if (!_auth) {
    _auth = await createAuth();
  }
  return _auth;
}

// For backwards compatibility - but now async
export const auth = {
  get handler() {
    // This needs to return a handler that initializes on first call
    return async (request: Request) => {
      const authInstance = await getAuth();
      return authInstance.handler(request);
    };
  },
  get api() {
    // Return a proxy that handles async initialization
    return new Proxy({} as ReturnType<typeof betterAuth>["api"], {
      get(_, prop) {
        return async (...args: unknown[]) => {
          const authInstance = await getAuth();
          // @ts-ignore
          return authInstance.api[prop](...args);
        };
      },
    });
  },
};

// Helper to check if user is admin
export function isAdmin(user: { id: string } | null | undefined): boolean {
  if (!user) return false;
  const adminIds = (process.env.ADMIN_GITHUB_IDS ?? "").split(",").map((id) => id.trim());
  return adminIds.includes(user.id);
}

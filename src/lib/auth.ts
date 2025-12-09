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

// Create auth instance synchronously but defer the heavy initialization
let _authPromise: Promise<ReturnType<typeof betterAuth>> | null = null;

function getAuthPromise() {
  if (!_authPromise) {
    _authPromise = createAuth();
  }
  return _authPromise;
}

// For backwards compatibility - but now with deferred initialization
export const auth = {
  get handler() {
    // This needs to return a handler that initializes on first call
    return async (request: Request) => {
      const authInstance = await getAuthPromise();
      return authInstance.handler(request);
    };
  },
  api: {
    async getSession(options: { headers: Headers }) {
      const authInstance = await getAuthPromise();
      return authInstance.api.getSession(options);
    },
    async listUserAccounts(options: { headers: Headers }) {
      const authInstance = await getAuthPromise();
      return authInstance.api.listUserAccounts(options);
    },
    async signInSocial(options: { body: { provider: string; callbackURL?: string }; asResponse?: boolean; returnHeaders?: boolean }) {
      const authInstance = await getAuthPromise();
      return authInstance.api.signInSocial(options);
    },
  },
};

// Helper to check if user is admin
export function isAdmin(user: { id: string } | null | undefined): boolean {
  if (!user) return false;
  const adminIds = (process.env.ADMIN_GITHUB_IDS ?? "").split(",").map((id) => id.trim());
  return adminIds.includes(user.id);
}

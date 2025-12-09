import { betterAuth } from "better-auth";
import { LibsqlDialect } from "@libsql/kysely-libsql";

let _auth: ReturnType<typeof betterAuth> | null = null;

function createAuth() {
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

export function getAuth() {
  if (!_auth) {
    _auth = createAuth();
  }
  return _auth;
}

// For backwards compatibility - lazy getter
export const auth = {
  get handler() {
    return getAuth().handler;
  },
  get api() {
    return getAuth().api;
  },
};

// Helper to check if user is admin
export function isAdmin(user: { id: string } | null | undefined): boolean {
  if (!user) return false;
  const adminIds = (process.env.ADMIN_GITHUB_IDS ?? "").split(",").map((id) => id.trim());
  return adminIds.includes(user.id);
}

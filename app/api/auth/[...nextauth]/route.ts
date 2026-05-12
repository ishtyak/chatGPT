import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

/** Fetch an active API key/client secret for a provider from the backend DB.
 * Returns an empty string if not found or backend is unreachable.
 */
async function getApiKey(provider: string): Promise<string> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/admin/api-key/${provider}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      if (data.key) return data.key as string;
    }
  } catch {
    // backend unreachable – return empty so we don't fall back to env
  }
  return "";
}

async function buildAuthOptions(): Promise<NextAuthOptions> {
  const googleClientId = await getApiKey("google");
  const googleClientSecret = await getApiKey("google-secret");

  return {
    providers: [
      GoogleProvider({
        clientId: googleClientId,
        clientSecret: googleClientSecret,
      }),
      CredentialsProvider({
        name: "Credentials",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) return null;
          try {
            const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
            });
            if (!res.ok) return null;
            const data = await res.json();
            if (data?.message == "Feature not availiable in demo mode") {
              throw new Error("Feature not available in demo mode")
              return
            }
            if (!data.user) return null;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return { id: String(data.user.id),is_admin: data.user.is_admin, name: data.user.name ?? null, email: data.user.email, accessToken: data.token } as any;
          } catch {
            return null;
          }
        },
      }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    session: { strategy: "jwt" },
    callbacks: {
      async signIn({ user, account }) {
        if (account?.provider === "google") {
          try {
            const res = await fetch(`${BACKEND_URL}/api/auth/google-upsert`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: user.email, name: user.name }),
            });

            if (res.ok) {
              const data = await res.json();
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (user as any).accessToken = data.token;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (user as any).dbId = String(data.user.id);
            }
          } catch { /* user can still log in, just won't have a backend JWT */ }
        }
        return true;
      },
      async jwt({ token, user }) {
        if (user) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          token.id = (user as any).dbId ?? user.id;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          token.accessToken = (user as any).accessToken;
          token.is_admin = (user as any).is_admin; // add this
        }
        return token;
      },
      async session({ session, token }) {
        if (session.user) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (session.user as any).id = token.id;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (session as any).accessToken = token.accessToken;
          (session.user as any).is_admin = token.is_admin; // add this
        }
        return session;
      },
    },
    pages: { signIn: "/" },
  };
}

async function handler(
  req: Request,
  ctx: { params: Promise<{ nextauth: string[] }> },
) {
  const options = await buildAuthOptions();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (NextAuth as any)(req, ctx, options);
}

export { handler as GET, handler as POST };

import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./db";

const SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "tigerfix-dev-secret-change-in-production"
);
const COOKIE = "tigerfix_session";
const ROLE_HIERARCHY = ["CLIENT", "TECHNICIAN", "RECEPTION", "ADMIN"] as const;
export type Role = (typeof ROLE_HIERARCHY)[number];

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  tenantId: string;
  branchId: string | null;
};

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string) {
  if (!hash) return false;
  return bcrypt.compare(plain, hash);
}

export function hasRole(user: SessionUser, min: Role) {
  return ROLE_HIERARCHY.indexOf(user.role) >= ROLE_HIERARCHY.indexOf(min);
}

export async function createSession(userId: string) {
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(SECRET);

  cookies().set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function destroySession() {
  cookies().delete(COOKIE);
}

export async function getSession(): Promise<SessionUser | null> {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    const userId = payload.sub as string;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tenantId: true,
        branchId: true,
      },
    });
    if (!user) return null;
    return user as SessionUser;
  } catch {
    return null;
  }
}

export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHORIZED");
  return session;
}

export async function requireRole(min: Role): Promise<SessionUser> {
  const session = await requireSession();
  if (!hasRole(session, min)) throw new Error("FORBIDDEN");
  return session;
}

export { ROLE_HIERARCHY };

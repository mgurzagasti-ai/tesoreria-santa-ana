import "server-only";

import { randomBytes, createHash } from "node:crypto";
import { cookies } from "next/headers";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME ?? "tesoreria_session";
const SESSION_TTL_HOURS = Number(process.env.SESSION_TTL_HOURS ?? "12");

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

async function shouldUseSecureCookie() {
  const configuredValue = process.env.SESSION_COOKIE_SECURE;

  if (configuredValue === "true") {
    return true;
  }

  if (configuredValue === "false") {
    return false;
  }

  const requestHeaders = await headers();
  const forwardedProto = requestHeaders.get("x-forwarded-proto");

  return forwardedProto === "https";
}

export async function createSession(userId: string) {
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_TTL_HOURS * 60 * 60 * 1000);
  const secureCookie = await shouldUseSecureCookie();

  await prisma.session.create({
    data: {
      tokenHash,
      expiresAt,
      userId,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, rawToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: secureCookie,
    expires: expiresAt,
    path: "/",
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (rawToken) {
    await prisma.session.deleteMany({
      where: {
        tokenHash: hashToken(rawToken),
      },
    });
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!rawToken) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: {
      tokenHash: hashToken(rawToken),
    },
    include: {
      user: true,
    },
  });

  if (!session || session.expiresAt < new Date()) {
    cookieStore.delete(SESSION_COOKIE_NAME);

    if (session) {
      await prisma.session.delete({
        where: { id: session.id },
      });
    }

    return null;
  }

  return session.user;
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

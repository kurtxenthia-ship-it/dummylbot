import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { db, usersTable, sessionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { RegisterBody, LoginBody } from "@workspace/api-zod";

const router = Router();

const ADMIN_EMAIL = "kenzohaizen@gmail.com";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

async function getUserFromSession(req: any) {
  const token = req.cookies?.session_token;
  if (!token) return null;
  const [session] = await db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.sessionToken, token))
    .limit(1);
  if (!session || session.expiresAt < new Date()) return null;
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, session.userId))
    .limit(1);
  return user || null;
}

router.post("/auth/register", async (req, res) => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input" });
  }
  const { username, email, password } = parsed.data;

  const existing = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  if (existing.length > 0) {
    return res.status(409).json({ error: "Email already in use" });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const isAdmin = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const [user] = await db
    .insert(usersTable)
    .values({ username, email, passwordHash, isAdmin })
    .returning();

  const token = generateToken();
  await db.insert(sessionsTable).values({
    userId: user.id,
    sessionToken: token,
    expiresAt: new Date(Date.now() + SESSION_DURATION_MS),
  });

  res.cookie("session_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_DURATION_MS,
    sameSite: "lax",
  });

  return res.status(201).json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
      isBanned: user.isBanned,
      createdAt: user.createdAt,
      lastActiveAt: user.lastActiveAt,
    },
    message: "Account created successfully",
  });
});

router.post("/auth/login", async (req, res) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input" });
  }
  const { email, password } = parsed.data;

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  if (user.isBanned) {
    return res.status(403).json({ error: "Your account has been banned" });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  await db
    .update(usersTable)
    .set({ lastActiveAt: new Date() })
    .where(eq(usersTable.id, user.id));

  const token = generateToken();
  await db.insert(sessionsTable).values({
    userId: user.id,
    sessionToken: token,
    expiresAt: new Date(Date.now() + SESSION_DURATION_MS),
  });

  res.cookie("session_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_DURATION_MS,
    sameSite: "lax",
  });

  return res.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
      isBanned: user.isBanned,
      createdAt: user.createdAt,
      lastActiveAt: user.lastActiveAt,
    },
    message: "Login successful",
  });
});

router.post("/auth/logout", async (req, res) => {
  const token = req.cookies?.session_token;
  if (token) {
    await db
      .delete(sessionsTable)
      .where(eq(sessionsTable.sessionToken, token))
      .catch(() => {});
  }
  res.clearCookie("session_token");
  return res.json({ message: "Logged out successfully" });
});

router.get("/auth/me", async (req, res) => {
  const user = await getUserFromSession(req);
  if (!user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  return res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    isAdmin: user.isAdmin,
    isBanned: user.isBanned,
    createdAt: user.createdAt,
    lastActiveAt: user.lastActiveAt,
  });
});

export { getUserFromSession };
export default router;

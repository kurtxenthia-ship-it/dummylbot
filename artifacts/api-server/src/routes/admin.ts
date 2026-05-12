import { Router } from "express";
import { db, usersTable, sessionsTable } from "@workspace/db";
import { eq, count, sql } from "drizzle-orm";
import { getUserFromSession } from "./auth";

const router = Router();

async function requireAdmin(req: any, res: any) {
  const user = await getUserFromSession(req);
  if (!user) {
    res.status(401).json({ error: "Not authenticated" });
    return null;
  }
  if (!user.isAdmin) {
    res.status(403).json({ error: "Admin access required" });
    return null;
  }
  return user;
}

router.get("/admin/users", async (req, res) => {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const users = await db.select().from(usersTable).orderBy(usersTable.createdAt);

  const sessionCounts = await db
    .select({ userId: sessionsTable.userId, cnt: count() })
    .from(sessionsTable)
    .groupBy(sessionsTable.userId);

  const sessionMap = new Map(sessionCounts.map((s) => [s.userId, Number(s.cnt)]));
  const timeMap = new Map<number, number>();

  const result = users.map((u) => ({
    id: u.id,
    username: u.username,
    email: u.email,
    isAdmin: u.isAdmin,
    isBanned: u.isBanned,
    createdAt: u.createdAt,
    lastActiveAt: u.lastActiveAt,
    sessionCount: sessionMap.get(u.id) ?? 0,
    totalTimeOnSiteMinutes: timeMap.get(u.id) ?? 0,
  }));

  return res.json(result);
});

router.get("/admin/users/:userId", async (req, res) => {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const userId = parseInt(req.params.userId);
  if (isNaN(userId)) return res.status(400).json({ error: "Invalid user ID" });

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  if (!user) return res.status(404).json({ error: "User not found" });

  const [sessionData] = await db
    .select({ cnt: count() })
    .from(sessionsTable)
    .where(eq(sessionsTable.userId, userId));

  return res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    isAdmin: user.isAdmin,
    isBanned: user.isBanned,
    createdAt: user.createdAt,
    lastActiveAt: user.lastActiveAt,
    sessionCount: Number(sessionData?.cnt ?? 0),
    totalTimeOnSiteMinutes: 0,
  });
});

router.delete("/admin/users/:userId", async (req, res) => {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const userId = parseInt(req.params.userId);
  if (isNaN(userId)) return res.status(400).json({ error: "Invalid user ID" });

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  if (!user) return res.status(404).json({ error: "User not found" });
  if (user.isAdmin) return res.status(400).json({ error: "Cannot delete admin user" });

  await db.delete(usersTable).where(eq(usersTable.id, userId));
  return res.json({ message: "User deleted successfully" });
});

router.post("/admin/users/:userId/ban", async (req, res) => {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const userId = parseInt(req.params.userId);
  if (isNaN(userId)) return res.status(400).json({ error: "Invalid user ID" });

  await db
    .update(usersTable)
    .set({ isBanned: true })
    .where(eq(usersTable.id, userId));

  await db
    .delete(sessionsTable)
    .where(eq(sessionsTable.userId, userId));

  return res.json({ message: "User banned successfully" });
});

router.post("/admin/users/:userId/unban", async (req, res) => {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const userId = parseInt(req.params.userId);
  if (isNaN(userId)) return res.status(400).json({ error: "Invalid user ID" });

  await db
    .update(usersTable)
    .set({ isBanned: false })
    .where(eq(usersTable.id, userId));

  return res.json({ message: "User unbanned successfully" });
});

router.get("/admin/stats", async (req, res) => {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const [totalRow] = await db.select({ cnt: count() }).from(usersTable);
  const [bannedRow] = await db
    .select({ cnt: count() })
    .from(usersTable)
    .where(eq(usersTable.isBanned, true));

  const recentCutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [activeRow] = await db
    .select({ cnt: count() })
    .from(usersTable)
    .where(sql`${usersTable.lastActiveAt} > ${recentCutoff}`);

  const [sessionRow] = await db.select({ cnt: count() }).from(sessionsTable);

  return res.json({
    totalUsers: Number(totalRow?.cnt ?? 0),
    activeUsers: Number(activeRow?.cnt ?? 0),
    bannedUsers: Number(bannedRow?.cnt ?? 0),
    totalSessions: Number(sessionRow?.cnt ?? 0),
  });
});

export default router;

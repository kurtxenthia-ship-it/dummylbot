import { Router } from "express";
import { getUserFromSession } from "./auth";

const router = Router();

const BOT_COMMANDS = [
  { name: "!on", description: "Enable auto-respond in the current thread", usage: "!on", category: "Auto-Respond" },
  { name: "!off", description: "Disable auto-respond in the current thread", usage: "!off", category: "Auto-Respond" },
  { name: "!loop", description: "Start loop mode — bot sends replies continuously", usage: "!loop", category: "Loop" },
  { name: "!stop", description: "Stop loop mode", usage: "!stop", category: "Loop" },
  { name: "!mute", description: "Mute the bot in the current thread", usage: "!mute", category: "Control" },
  { name: "!unmute", description: "Unmute the bot in the current thread", usage: "!unmute", category: "Control" },
  { name: "!vm", description: "Send a voice message with text-to-speech", usage: "!vm <text>", category: "Voice" },
  { name: "!vmpm", description: "Send a voice TTS to a specific user", usage: "!vmpm <uid> <text>", category: "Voice" },
  { name: "!p", description: "Play a song as a voice message (any PH/US song, Spotify/YT link)", usage: "!p <song name or URL>", category: "Music" },
  { name: "!kick", description: "Kick a member from the group", usage: "!kick <uid>", category: "Group Admin" },
  { name: "!add", description: "Add a member to the group", usage: "!add <uid>", category: "Group Admin" },
  { name: "!promote", description: "Promote a member to admin", usage: "!promote <uid>", category: "Group Admin" },
  { name: "!demote", description: "Demote an admin to member", usage: "!demote <uid>", category: "Group Admin" },
  { name: "!emoji", description: "Change group emoji", usage: "!emoji <emoji>", category: "Group Admin" },
  { name: "!color", description: "Change group color theme", usage: "!color <name>", category: "Group Admin" },
  { name: "!freeze", description: "Freeze the group (no new messages)", usage: "!freeze", category: "Group Admin" },
  { name: "!unfreeze", description: "Unfreeze the group", usage: "!unfreeze", category: "Group Admin" },
  { name: "!say", description: "Bot says a message", usage: "!say <text>", category: "Tools" },
  { name: "!spam", description: "Spam a message multiple times", usage: "!spam <count> <text>", category: "Tools" },
  { name: "!react", description: "React to the last message", usage: "!react <emoji>", category: "Tools" },
  { name: "!seen", description: "Mark messages as seen", usage: "!seen", category: "Tools" },
  { name: "!id", description: "Get the current thread ID", usage: "!id", category: "Info" },
  { name: "!myid", description: "Get your own user ID", usage: "!myid", category: "Info" },
  { name: "!info", description: "Get bot info and status", usage: "!info", category: "Info" },
  { name: "!status", description: "Show bot status summary", usage: "!status", category: "Info" },
  { name: "!members", description: "List all group members", usage: "!members", category: "Info" },
  { name: "!gp", description: "Change or lock group photo", usage: "!gp [url/off]", category: "Group Admin" },
  { name: "!antirestrict", description: "Toggle anti-restrict mode", usage: "!antirestrict", category: "Control" },
  { name: "!lock", description: "Lock the group name/banner", usage: "!lock", category: "Group Admin" },
  { name: "!perms", description: "Grant temporary permissions to a user", usage: "!perms <uid> <time>", category: "Group Admin" },
  { name: "!revoke", description: "Revoke temporary permissions", usage: "!revoke [uid]", category: "Group Admin" },
  { name: "!forward", description: "Forward a message to another thread", usage: "!forward <tid> <msg>", category: "Tools" },
];

router.get("/bot/status", async (req, res) => {
  const user = await getUserFromSession(req);
  if (!user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  return res.json({
    name: "COZY BOT",
    bio: "Automated Facebook Messenger bot by Kyle Gaspari",
    relationshipStatus: "Single",
    profileId: "61585831139336",
    totalFriends: 0,
    totalGc: 0,
    notifCenter: 0,
    accountHealth: "Good",
    isOnline: false,
    uptime: "0s",
  });
});

router.get("/bot/commands", async (_req, res) => {
  return res.json(BOT_COMMANDS);
});

router.post("/bot/play", async (req, res) => {
  const user = await getUserFromSession(req);
  if (!user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { query } = req.body;
  if (!query || typeof query !== "string" || query.trim().length === 0) {
    return res.status(400).json({ error: "Song query is required" });
  }

  req.log.info({ query }, "Play music command received");
  return res.json({
    message: `Play command queued: ${query.trim()}. The bot will send a voice message with this song.`,
  });
});

export default router;

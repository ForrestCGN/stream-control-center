#!/usr/bin/env node
"use strict";

/**
 * LWG Evening Tool:
 * Setzt aktive Entries der Gewinn-Ausschlussliste fuer ein Giveaway auf ticket_weight = 0.
 *
 * Wichtig:
 * - Teilnehmer bleiben sichtbar.
 * - Ziehung nutzt bestehend nur Entries mit ticket_weight > 0.
 * - Deshalb koennen diese User teilnehmen, aber nicht gewinnen.
 * - Direkt vor "Teilnahme schließen" / "Draw" erneut ausführen, falls spaeter noch jemand joined.
 */

const fs = require("fs");
const path = require("path");

function arg(name, fallback = "") {
  const prefix = `--${name}=`;
  const found = process.argv.find(v => String(v).startsWith(prefix));
  return found ? String(found).slice(prefix.length) : fallback;
}

function hasArg(name) {
  return process.argv.includes(`--${name}`);
}

const repoRoot = process.cwd();
const dbPath = arg("db", "D:\\Streaming\\stramAssets\\data\\sqlite\\app.sqlite");
const giveawayUid = arg("giveaway", "").trim();
const listFile = arg("list", "").trim();
const dryRun = hasArg("dry-run");

if (!giveawayUid) {
  console.error("FEHLER: --giveaway=<giveawayUid> fehlt.");
  process.exit(2);
}
if (!listFile) {
  console.error("FEHLER: --list=<resolved-json> fehlt.");
  process.exit(2);
}
if (!fs.existsSync(listFile)) {
  console.error("FEHLER: Liste nicht gefunden:", listFile);
  process.exit(2);
}
if (!fs.existsSync(dbPath)) {
  console.error("FEHLER: SQLite DB nicht gefunden:", dbPath);
  process.exit(2);
}

let Database;
try {
  Database = require("better-sqlite3");
} catch (err) {
  console.error("FEHLER: better-sqlite3 nicht gefunden. Bitte im Repo-Root ausfuehren, wo node_modules vorhanden ist.");
  console.error(err.message || String(err));
  process.exit(2);
}

const input = JSON.parse(fs.readFileSync(listFile, "utf8"));
const rawItems = Array.isArray(input.items) ? input.items : (Array.isArray(input) ? input : []);
const excluded = rawItems
  .map(item => ({
    login: String(item.login || item.userLogin || item.input || "").replace(/^@/, "").trim().toLowerCase(),
    displayName: String(item.displayName || item.display_name || item.login || "").trim(),
    twitchUserId: String(item.twitchUserId || item.userId || item.id || "").trim()
  }))
  .filter(item => item.login);

if (!excluded.length) {
  console.error("FEHLER: Ausschlussliste enthaelt keine Logins.");
  process.exit(2);
}

const excludedLogins = [...new Set(excluded.map(item => item.login))];

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

const giveaway = db.prepare(`
  SELECT giveaway_uid, title, status
  FROM loyalty_giveaways
  WHERE giveaway_uid = ?
    AND deleted_at = ''
`).get(giveawayUid);

if (!giveaway) {
  console.error("FEHLER: Giveaway nicht gefunden oder geloescht:", giveawayUid);
  process.exit(2);
}

const placeholders = excludedLogins.map(() => "?").join(", ");
const entries = db.prepare(`
  SELECT *
  FROM loyalty_giveaway_entries
  WHERE giveaway_uid = ?
    AND status = 'active'
    AND lower(user_login) IN (${placeholders})
  ORDER BY id ASC
`).all(giveawayUid, ...excludedLogins);

const now = new Date().toISOString();

function safeJson(value) {
  if (!value) return {};
  try { return JSON.parse(String(value)); } catch (_) { return {}; }
}

const updateEntry = db.prepare(`
  UPDATE loyalty_giveaway_entries
  SET ticket_weight = 0,
      updated_at = ?,
      metadata_json = ?
  WHERE entry_uid = ?
`);

const insertEvent = db.prepare(`
  INSERT INTO loyalty_giveaway_events (
    event_uid, giveaway_uid, round_uid, preset_uid, spin_uid, event_type,
    actor_type, actor_login, old_status, new_status, message, created_at, metadata_json
  ) VALUES (
    ?, ?, '', '', '', 'loyalty.giveaway.winner_exclusion_applied',
    'tool', 'dashboard', '', '', ?, ?, ?
  )
`);

const tx = db.transaction(() => {
  for (const entry of entries) {
    const meta = safeJson(entry.metadata_json);
    const matched = excluded.find(item => item.login === String(entry.user_login || "").toLowerCase()) || {};
    const nextMeta = {
      ...meta,
      winnerExcluded: true,
      winnerExcludedAt: now,
      winnerExcludedBy: "lwg_evening_apply_winner_exclusion",
      winnerExclusion: {
        login: matched.login || entry.user_login,
        displayName: matched.displayName || entry.user_display_name || entry.user_login,
        twitchUserId: matched.twitchUserId || "",
        reason: "manual_winner_exclusion",
        note: "Teilnahme bleibt sichtbar, Gewinnchance wird durch ticket_weight=0 entfernt."
      },
      previousTicketWeight: Number(entry.ticket_weight || 0)
    };
    updateEntry.run(now, JSON.stringify(nextMeta), entry.entry_uid);
  }

  insertEvent.run(
    `gev_exclude_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    giveawayUid,
    `Gewinn-Ausschluss auf ${entries.length} aktive Entries angewendet.`,
    now,
    JSON.stringify({
      giveawayUid,
      giveawayTitle: giveaway.title || "",
      status: giveaway.status || "",
      excludedLogins,
      matchedEntries: entries.map(e => ({
        entryUid: e.entry_uid,
        userLogin: e.user_login,
        userDisplayName: e.user_display_name,
        previousTicketWeight: Number(e.ticket_weight || 0)
      })),
      dryRun: false
    })
  );
});

console.log("Giveaway:", giveaway.title, `(${giveaway.giveaway_uid})`, "Status:", giveaway.status);
console.log("Ausschluss-Logins:", excludedLogins.join(", "));
console.log("Gefundene aktive Entries:", entries.length);

if (entries.length) {
  console.table(entries.map(e => ({
    entryUid: e.entry_uid,
    userLogin: e.user_login,
    displayName: e.user_display_name,
    ticketCount: e.ticket_count,
    oldTicketWeight: e.ticket_weight
  })));
}

if (dryRun) {
  console.log("DRY-RUN: Keine DB-Aenderung geschrieben.");
  process.exit(0);
}

tx();

console.log("OK: Gewinn-Ausschluss angewendet. Diese Entries haben jetzt ticket_weight=0.");
console.log("Hinweis: Direkt vor Draw erneut ausfuehren, wenn seitdem neue Teilnehmer hinzugekommen sind.");

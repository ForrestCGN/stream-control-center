"use strict";

/**
 * Hug text admin API.
 *
 * STEP017:
 * - sichere Bearbeitung der bestehenden hug_texts Tabelle
 * - kein echtes Loeschen, nur aktiv/inaktiv
 * - nutzt zentrale Core-Datenbank-Schicht
 * - bewusst eigenes Modul, damit das finale hug.js nicht unnoetig riskant angefasst wird
 */

const db = require("../core/database");
const routes = require("./helpers/helper_routes");

const MODULE_NAME = "hug_text_admin";
const ALLOWED_KINDS = new Set(["hug", "rehug", "hug_all", "response", "top_title"]);

function nowIso() {
  return db.nowIso ? db.nowIso() : new Date().toISOString();
}

function clean(value) {
  return String(value ?? "").trim();
}

function asInt(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

function asNullableInt(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function normalizeKind(value) {
  const kind = clean(value).toLowerCase();
  if (!ALLOWED_KINDS.has(kind)) return "";
  return kind;
}

function ensureReady(ctx) {
  db.init(ctx);
}

function rowToText(row) {
  return {
    id: Number(row.id),
    textKey: row.text_key || "",
    typeId: row.type_id === null || row.type_id === undefined ? null : Number(row.type_id),
    typeName: row.type_name || "",
    kind: row.kind || "",
    text: row.text || "",
    enabled: Number(row.enabled) === 1,
    weight: Math.max(1, Number(row.weight || 1)),
    sortOrder: Number(row.sort_order || 0),
    createdAt: row.created_at || null,
    updatedAt: row.updated_at || null
  };
}

function listTexts(req, res) {
  try {
    const kind = normalizeKind(req.query.kind || "");
    const includeDisabled = String(req.query.includeDisabled || "1") !== "0";
    const typeId = asNullableInt(req.query.typeId);

    const where = [];
    const params = {};

    if (kind) {
      where.push("t.kind = :kind");
      params.kind = kind;
    }
    if (!includeDisabled) where.push("t.enabled = 1");
    if (typeId !== null) {
      where.push("t.type_id = :typeId");
      params.typeId = typeId;
    }

    const sql = `
      SELECT
        t.id, t.text_key, t.type_id, ht.name AS type_name, t.kind, t.text,
        t.enabled, t.weight, t.sort_order, t.created_at, t.updated_at
      FROM hug_texts t
      LEFT JOIN hug_types ht ON ht.id = t.type_id
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ORDER BY t.kind ASC, COALESCE(t.type_id, 0) ASC, t.sort_order ASC, t.id ASC
    `;

    const rows = db.all(sql, params).map(rowToText);
    const kinds = db.all(`SELECT kind, COUNT(*) AS count FROM hug_texts GROUP BY kind ORDER BY kind ASC`)
      .map(r => ({ kind: r.kind, count: Number(r.count || 0) }));
    const types = db.all(`SELECT id, name, weight, enabled, sort_order FROM hug_types ORDER BY sort_order ASC, id ASC`)
      .map(r => ({ id: Number(r.id), name: r.name, weight: Number(r.weight || 1), enabled: Number(r.enabled) === 1, sortOrder: Number(r.sort_order || 0) }));

    res.json({ ok: true, module: MODULE_NAME, rows, kinds, types, allowedKinds: Array.from(ALLOWED_KINDS) });
  } catch (err) {
    console.error("[hug_text_admin] list failed:", err);
    res.status(500).json({ ok: false, error: "hug_text_list_failed", message: err.message || String(err) });
  }
}

function getTextById(id) {
  return db.get(`
    SELECT
      t.id, t.text_key, t.type_id, ht.name AS type_name, t.kind, t.text,
      t.enabled, t.weight, t.sort_order, t.created_at, t.updated_at
    FROM hug_texts t
    LEFT JOIN hug_types ht ON ht.id = t.type_id
    WHERE t.id = :id
  `, { id });
}

function updateText(req, res) {
  try {
    const id = asInt(req.params.id || req.body?.id, 0);
    if (id <= 0) return res.status(400).json({ ok: false, error: "invalid_text_id" });

    const existing = getTextById(id);
    if (!existing) return res.status(404).json({ ok: false, error: "text_not_found" });

    const text = clean(req.body?.text);
    if (!text) return res.status(400).json({ ok: false, error: "text_required" });

    const weight = Math.max(1, asInt(req.body?.weight, Number(existing.weight || 1)));
    const sortOrder = asInt(req.body?.sortOrder, Number(existing.sort_order || 0));
    const textKey = req.body?.textKey === undefined ? existing.text_key : clean(req.body.textKey);

    db.run(`
      UPDATE hug_texts
      SET text = :text,
          text_key = :textKey,
          weight = :weight,
          sort_order = :sortOrder,
          updated_at = :now
      WHERE id = :id
    `, { id, text, textKey, weight, sortOrder, now: nowIso() });

    const updated = rowToText(getTextById(id));
    res.json({
      ok: true,
      module: MODULE_NAME,
      action: "update_text",
      old: rowToText(existing),
      row: updated,
      audit: {
        planned: true,
        action: "hug_text_update",
        targetId: id,
        note: "Finale Dashboard-Audit-Anbindung folgt ueber dashboard_audit.sqlite."
      }
    });
  } catch (err) {
    console.error("[hug_text_admin] update failed:", err);
    res.status(500).json({ ok: false, error: "hug_text_update_failed", message: err.message || String(err) });
  }
}

function toggleText(req, res) {
  try {
    const id = asInt(req.params.id || req.body?.id, 0);
    if (id <= 0) return res.status(400).json({ ok: false, error: "invalid_text_id" });

    const existing = getTextById(id);
    if (!existing) return res.status(404).json({ ok: false, error: "text_not_found" });

    const enabled = req.body?.enabled === true || req.body?.enabled === 1 || req.body?.enabled === "1" || String(req.body?.enabled).toLowerCase() === "true" ? 1 : 0;
    db.run(`UPDATE hug_texts SET enabled = :enabled, updated_at = :now WHERE id = :id`, { id, enabled, now: nowIso() });

    res.json({
      ok: true,
      module: MODULE_NAME,
      action: "toggle_text",
      old: rowToText(existing),
      row: rowToText(getTextById(id)),
      audit: { planned: true, action: "hug_text_toggle", targetId: id }
    });
  } catch (err) {
    console.error("[hug_text_admin] toggle failed:", err);
    res.status(500).json({ ok: false, error: "hug_text_toggle_failed", message: err.message || String(err) });
  }
}

function createText(req, res) {
  try {
    const kind = normalizeKind(req.body?.kind);
    if (!kind) return res.status(400).json({ ok: false, error: "invalid_kind", allowedKinds: Array.from(ALLOWED_KINDS) });

    const text = clean(req.body?.text);
    if (!text) return res.status(400).json({ ok: false, error: "text_required" });

    const typeId = asNullableInt(req.body?.typeId);
    if ((kind === "hug" || kind === "rehug") && typeId === null) {
      return res.status(400).json({ ok: false, error: "type_id_required_for_kind" });
    }

    const textKey = clean(req.body?.textKey || (kind === "hug_all" ? "hug_all" : ""));
    const weight = Math.max(1, asInt(req.body?.weight, 1));
    const sortOrder = asInt(req.body?.sortOrder, 999);
    const now = nowIso();

    const result = db.run(`
      INSERT INTO hug_texts (text_key, type_id, kind, text, enabled, weight, sort_order, created_at, updated_at)
      VALUES (:textKey, :typeId, :kind, :text, 1, :weight, :sortOrder, :now, :now)
    `, { textKey, typeId, kind, text, weight, sortOrder, now });

    const id = Number(result?.lastInsertRowid || result?.lastID || db.get(`SELECT MAX(id) AS id FROM hug_texts`)?.id || 0);
    res.json({
      ok: true,
      module: MODULE_NAME,
      action: "create_text",
      row: id ? rowToText(getTextById(id)) : null,
      audit: { planned: true, action: "hug_text_create", targetId: id || null }
    });
  } catch (err) {
    console.error("[hug_text_admin] create failed:", err);
    const message = err.message || String(err);
    res.status(500).json({ ok: false, error: "hug_text_create_failed", message });
  }
}

function init(ctx) {
  ensureReady(ctx);

  routes.registerGet(ctx.app, ["/api/hug/admin/texts", "/api/dashboard/community/hug/texts"], listTexts);
  routes.registerPost(ctx.app, ["/api/hug/admin/texts"], createText);
  routes.registerPost(ctx.app, ["/api/hug/admin/texts/:id"], updateText);
  routes.registerPost(ctx.app, ["/api/hug/admin/texts/:id/toggle"], toggleText);

  return { name: MODULE_NAME, step: "017" };
}

module.exports = { init };

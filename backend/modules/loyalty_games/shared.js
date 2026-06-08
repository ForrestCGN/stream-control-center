"use strict";

const crypto = require("crypto");

function normalizeLogin(value) {
  return String(value || "").trim().replace(/^@/, "").toLowerCase();
}

function cleanDisplayName(login, displayName = "") {
  const display = String(displayName || "").trim();
  return display || String(login || "").trim();
}

function clampInt(value, fallback, min, max) {
  const n = Number.parseInt(value, 10);
  const clean = Number.isFinite(n) ? n : Number(fallback || 0);
  return Math.max(Number(min || 0), Math.min(Number(max || clean), clean));
}

function uid(prefix = "uid") {
  const clean = String(prefix || "uid").trim().replace(/[^a-zA-Z0-9_-]+/g, "_") || "uid";
  return `${clean}_${Date.now()}_${crypto.randomBytes(8).toString("hex")}`;
}

function secureRandomInt(maxExclusive) {
  const max = Number(maxExclusive || 0);
  if (!Number.isInteger(max) || max <= 0) return 0;
  return crypto.randomInt(0, max);
}

function normalizeWeight(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.floor(n);
}

function normalizeField(field, index) {
  const source = field && typeof field === "object" ? field : {};
  const id = String(source.id || `field_${index + 1}`).trim() || `field_${index + 1}`;
  const label = String(source.label || id).trim() || id;
  const sub = String(source.sub || source.subtitle || "").trim();
  const enabled = source.enabled !== false;
  const weight = normalizeWeight(source.weight === undefined ? 1 : source.weight);
  const reward = source.reward && typeof source.reward === "object" ? { ...source.reward } : { type: "none", amount: 0 };

  return {
    index,
    id,
    label,
    sub,
    enabled,
    weight,
    reward,
    colorA: String(source.colorA || "").trim(),
    colorB: String(source.colorB || "").trim(),
    metadata: source.metadata && typeof source.metadata === "object" ? { ...source.metadata } : {}
  };
}

function normalizeFields(fields) {
  const list = Array.isArray(fields) ? fields : [];
  return list
    .map(normalizeField)
    .filter(field => field.enabled && field.weight > 0);
}

function publicField(field) {
  return {
    index: field.index,
    id: field.id,
    label: field.label,
    sub: field.sub,
    weight: field.weight,
    reward: field.reward,
    colorA: field.colorA,
    colorB: field.colorB,
    metadata: field.metadata
  };
}

function pickWeightedIndex(fields) {
  const list = Array.isArray(fields) ? fields : [];
  const total = list.reduce((sum, field) => sum + normalizeWeight(field.weight), 0);
  if (total <= 0) return -1;

  let ticket = secureRandomInt(total);
  for (let i = 0; i < list.length; i += 1) {
    ticket -= normalizeWeight(list[i].weight);
    if (ticket < 0) return i;
  }
  return list.length - 1;
}

function parseDuration(input, spinConfig = {}) {
  return clampInt(
    input.durationMs || input.duration || input.ms,
    spinConfig.defaultDurationMs || 7000,
    spinConfig.minDurationMs || 2500,
    spinConfig.maxDurationMs || 20000
  );
}

function parseExtraTurns(spinConfig = {}) {
  const min = clampInt(spinConfig.minExtraTurns, 5, 1, 50);
  const max = clampInt(spinConfig.maxExtraTurns, 8, min, 50);
  return min + secureRandomInt((max - min) + 1);
}

module.exports = {
  normalizeLogin,
  cleanDisplayName,
  clampInt,
  uid,
  secureRandomInt,
  normalizeWeight,
  normalizeField,
  normalizeFields,
  publicField,
  pickWeightedIndex,
  parseDuration,
  parseExtraTurns
};

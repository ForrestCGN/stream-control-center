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

function normalizeQuantity(value, fallback = 0) {
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n) || n < 0) return Math.max(0, Number.parseInt(fallback || 0, 10) || 0);
  return n;
}

function normalizeField(field, index) {
  const source = field && typeof field === "object" ? field : {};
  const id = String(source.id || source.fieldUid || source.field_uid || `field_${index + 1}`).trim() || `field_${index + 1}`;
  const label = String(source.label || id).trim() || id;
  const sub = String(source.sub || source.subLabel || source.sub_label || source.subtitle || "").trim();
  const enabled = source.enabled !== false;
  const weight = normalizeWeight(source.weight === undefined ? 1 : source.weight);
  const reward = source.reward && typeof source.reward === "object"
    ? { ...source.reward }
    : {
        type: String(source.rewardType || source.reward_type || "none").trim() || "none",
        amount: Number(source.rewardAmount || source.reward_amount || 0) || 0,
        value: source.rewardValue || source.reward_value || ""
      };
  const quantityTotal = normalizeQuantity(source.quantityTotal ?? source.quantity_total ?? source.quantity ?? 0, 0);
  const quantityRemaining = normalizeQuantity(source.quantityRemaining ?? source.quantity_remaining ?? quantityTotal, quantityTotal);
  const removeAfterWin = source.removeAfterWin === true || source.remove_after_win === 1 || source.remove_after_win === true;

  return {
    index,
    id,
    fieldUid: String(source.fieldUid || source.field_uid || id).trim() || id,
    presetUid: String(source.presetUid || source.preset_uid || "").trim(),
    label,
    sub,
    enabled,
    weight,
    quantityTotal,
    quantityRemaining,
    removeAfterWin,
    reward,
    colorA: String(source.colorA || source.color_a || "").trim(),
    colorB: String(source.colorB || source.color_b || "").trim(),
    metadata: source.metadata && typeof source.metadata === "object" ? { ...source.metadata } : {}
  };
}

function isFieldAvailable(field) {
  if (!field || field.enabled === false || normalizeWeight(field.weight) <= 0) return false;
  const total = normalizeQuantity(field.quantityTotal || 0, 0);
  const remaining = normalizeQuantity(field.quantityRemaining ?? total, total);
  if (total > 0 && remaining <= 0) return false;
  return true;
}

function normalizeFields(fields) {
  const list = Array.isArray(fields) ? fields : [];
  return list
    .map(normalizeField)
    .filter(isFieldAvailable);
}

function publicField(field) {
  return {
    index: field.index,
    id: field.id,
    fieldUid: field.fieldUid || field.id,
    presetUid: field.presetUid || "",
    label: field.label,
    sub: field.sub,
    weight: field.weight,
    quantityTotal: field.quantityTotal || 0,
    quantityRemaining: field.quantityRemaining || 0,
    removeAfterWin: !!field.removeAfterWin,
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

function expandFieldsForVisual(fields, minVisibleSlots = 0) {
  const source = Array.isArray(fields) ? fields : [];
  const minSlots = Math.max(0, Number.parseInt(minVisibleSlots || 0, 10) || 0);
  if (!source.length || source.length >= minSlots) {
    return source.map((field, index) => ({ ...field, index }));
  }

  const result = [];
  let cursor = 0;
  while (result.length < minSlots) {
    const field = source[cursor % source.length];
    result.push({ ...field, index: result.length, visualClone: result.length >= source.length });
    cursor += 1;
  }
  return result;
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
  normalizeQuantity,
  normalizeField,
  normalizeFields,
  isFieldAvailable,
  publicField,
  pickWeightedIndex,
  expandFieldsForVisual,
  parseDuration,
  parseExtraTurns
};

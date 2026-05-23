#!/usr/bin/env node
'use strict';

/**
 * STEP274P - Media Registry Migration Plan Refiner
 *
 * Purpose:
 * - Reads config/media_migration_plan.suggested.json by default.
 * - Refines semantic categories without touching DB/files.
 * - Especially improves alert assets: follow/bits/sub/raid/kofi/tipeee/donation.
 * - Writes config/media_migration_plan.refined.json by default.
 *
 * Usage:
 *   node tools/media_registry_refine_plan.js
 *   node tools/media_registry_refine_plan.js --input config/media_migration_plan.suggested.json --output config/media_migration_plan.refined.json
 */

const fs = require('fs');
const path = require('path');

const STEP = 'STEP274P';

function argValue(name, fallback = '') {
  const index = process.argv.indexOf(name);
  if (index >= 0 && process.argv[index + 1]) return process.argv[index + 1];
  const prefixed = process.argv.find(arg => arg.startsWith(`${name}=`));
  if (prefixed) return prefixed.slice(name.length + 1);
  return fallback;
}

function hasArg(name) {
  return process.argv.includes(name);
}

function repoRoot() {
  return process.cwd();
}

function normalizeSlashes(value) {
  return String(value || '').replace(/\\/g, '/');
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function normalizeText(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .toLowerCase();
}

function cleanKey(value, fallback = 'general') {
  const out = normalizeText(value)
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
  return out || fallback;
}

function noteText(entry) {
  return normalizeText(`${entry && entry.note ? entry.note : ''} ${entry && entry.categoryKey ? entry.categoryKey : ''} ${entry && entry.moduleKey ? entry.moduleKey : ''}`);
}

function includesAny(text, needles) {
  return needles.some(needle => text.includes(needle));
}

function refineAlertCategory(entry) {
  const text = noteText(entry);

  // Specific external alert/payment sources first.
  if (includesAny(text, ['kofi', 'ko-fi', 'ko fi'])) return { categoryKey: 'kofi', reason: 'alert_kofi' };
  if (includesAny(text, ['tipeee', 'tipee'])) return { categoryKey: 'tipeee', reason: 'alert_tipeee' };
  if (includesAny(text, ['donation', 'donate', 'spende', 'spenden'])) return { categoryKey: 'donation', reason: 'alert_donation' };

  // Twitch alert families.
  if (includesAny(text, ['raid', 'achtung-raid', 'achtung_raid'])) return { categoryKey: 'raid', reason: 'alert_raid' };
  if (includesAny(text, ['gift-sub', 'giftsub', 'gif-sub', 'gif_sub', 'gifted', 'sub-bombe', 'sub_bombe', 'sub bomb', 'subs ', 'subs_', 'sub-'])) return { categoryKey: 'sub', reason: 'alert_sub' };
  if (includesAny(text, ['re-sub', 'resub', 'prime', 'abo', 'sup', 'sub'])) return { categoryKey: 'sub', reason: 'alert_sub' };
  if (includesAny(text, ['bits', 'bit ', ' bit', 'cheer', '100-', '250-', '500-', '1000', '1.000', '2000', '2.000', '5000', '5.000', '10000', '10.000'])) return { categoryKey: 'bits', reason: 'alert_bits' };
  if (includesAny(text, ['follow', 'follower', 'i will follow'])) return { categoryKey: 'follow', reason: 'alert_follow' };

  return { categoryKey: entry.categoryKey || 'general', reason: 'alert_unchanged' };
}

function refineGeneralCategory(entry) {
  const text = noteText(entry);
  if (includesAny(text, ['intro', 'am start', 'startmusik'])) return { categoryKey: 'intro', reason: 'general_intro' };
  if (includesAny(text, ['outro', 'ende', 'jahr geht zu ende'])) return { categoryKey: 'outro', reason: 'general_outro' };
  if (includesAny(text, ['transition', 'stinger', 'streifen'])) return { categoryKey: 'transitions', reason: 'general_transitions' };
  if (includesAny(text, ['test', 'ping'])) return { categoryKey: 'test', reason: 'general_test' };
  return { categoryKey: entry.categoryKey || 'unsorted', reason: 'general_unchanged' };
}

function refineCommandCategory(entry) {
  const text = noteText(entry);
  if (includesAny(text, ['roxxy'])) return { categoryKey: 'roxxy', reason: 'command_roxxy' };
  if (includesAny(text, ['drudchen'])) return { categoryKey: 'general', reason: 'command_general' };
  return { categoryKey: entry.categoryKey || 'general', reason: 'command_unchanged' };
}

function refineEntry(id, entry) {
  const current = {
    moduleKey: cleanKey(entry.moduleKey || 'general'),
    categoryKey: cleanKey(entry.categoryKey || 'general'),
    note: entry.note || ''
  };

  if (current.moduleKey === 'alerts') {
    const refined = refineAlertCategory(current);
    return { ...current, categoryKey: cleanKey(refined.categoryKey), refineReason: refined.reason };
  }
  if (current.moduleKey === 'general') {
    const refined = refineGeneralCategory(current);
    return { ...current, categoryKey: cleanKey(refined.categoryKey), refineReason: refined.reason };
  }
  if (current.moduleKey === 'commands') {
    const refined = refineCommandCategory(current);
    return { ...current, categoryKey: cleanKey(refined.categoryKey), refineReason: refined.reason };
  }

  return { ...current, refineReason: `${current.moduleKey}_unchanged` };
}

function categoryListFromById(byId) {
  const seen = new Map();
  for (const entry of Object.values(byId || {})) {
    const moduleKey = cleanKey(entry.moduleKey || 'general');
    const categoryKey = cleanKey(entry.categoryKey || 'general');
    seen.set(`${moduleKey}/${categoryKey}`, { moduleKey, categoryKey });
  }
  return Array.from(seen.values()).sort((a, b) => `${a.moduleKey}/${a.categoryKey}`.localeCompare(`${b.moduleKey}/${b.categoryKey}`));
}

function summarize(byId) {
  const byModule = {};
  const byCategory = {};
  const byReason = {};
  for (const entry of Object.values(byId || {})) {
    const moduleKey = entry.moduleKey || 'general';
    const cat = `${moduleKey}/${entry.categoryKey || 'general'}`;
    byModule[moduleKey] = (byModule[moduleKey] || 0) + 1;
    byCategory[cat] = (byCategory[cat] || 0) + 1;
    byReason[entry.refineReason || 'unchanged'] = (byReason[entry.refineReason || 'unchanged'] || 0) + 1;
  }
  return { total: Object.keys(byId || {}).length, byModule, byCategory, byReason };
}

function main() {
  const root = repoRoot();
  const inputRel = normalizeSlashes(argValue('--input', 'config/media_migration_plan.suggested.json'));
  const outputRel = normalizeSlashes(argValue('--output', 'config/media_migration_plan.refined.json'));
  const inputFile = path.isAbsolute(inputRel) ? inputRel : path.join(root, inputRel);
  const outputFile = path.isAbsolute(outputRel) ? outputRel : path.join(root, outputRel);

  if (!fs.existsSync(inputFile)) {
    throw new Error(`input_file_missing: ${inputFile}`);
  }

  const source = readJson(inputFile);
  const sourceById = source.byId && typeof source.byId === 'object' ? source.byId : {};
  const refinedById = {};

  for (const [id, entry] of Object.entries(sourceById)) {
    refinedById[String(id)] = refineEntry(id, entry || {});
  }

  const refined = {
    version: 1,
    step: STEP,
    generatedAt: new Date().toISOString(),
    sourceFile: inputRel,
    description: 'Refined migration plan generated from STEP274O suggestions. Review manually before apply.',
    defaults: source.defaults || { moduleKey: 'general', categoryKey: 'unsorted' },
    categories: categoryListFromById(refinedById),
    summary: summarize(refinedById),
    byId: refinedById,
    rules: [],
    notes: [
      'This file is still a plan, not a migration result.',
      'Run tools/media_registry_migrate_categories.js --dry-run --map-file config/media_migration_plan.refined.json before apply.',
      'The migration tool copies files first and updates DB paths; it does not delete old files.'
    ]
  };

  if (!hasArg('--stdout-only')) writeJson(outputFile, refined);
  console.log(JSON.stringify({ ok: true, step: STEP, input: inputFile, output: outputFile, summary: refined.summary }, null, 2));
}

try {
  main();
} catch (err) {
  console.error(JSON.stringify({ ok: false, step: STEP, error: err.message || String(err) }, null, 2));
  process.exitCode = 1;
}

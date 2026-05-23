#!/usr/bin/env node
'use strict';

/**
 * STEP274O - Media Registry Category Suggestion Generator
 *
 * Purpose:
 * - Reads existing media_assets and command_definitions from the live SQLite DB.
 * - Generates a reviewable category mapping suggestion for STEP274N migration.
 * - DOES NOT modify DB or files.
 *
 * Output:
 * - config/media_migration_plan.suggested.json in repo/workdir by default
 * - data/exports/media_migration/media_registry_suggestions_*.json/csv in live root
 */

const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const STEP = 'STEP274O';

function argValue(name, fallback = '') {
  const idx = process.argv.indexOf(name);
  if (idx >= 0 && process.argv[idx + 1]) return process.argv[idx + 1];
  return fallback;
}

function hasFlag(name) {
  return process.argv.includes(name);
}

function isoStamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function normalizeSlashes(value) {
  return String(value || '').replace(/\\/g, '/');
}

function slug(value, fallback = 'general') {
  const clean = String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
  return clean || fallback;
}

function cleanName(value) {
  return String(value || '').trim();
}

function parseJson(value, fallback) {
  if (value === undefined || value === null || value === '') return fallback;
  try { return JSON.parse(String(value)); } catch (_) { return fallback; }
}

function csvEscape(value) {
  const text = String(value ?? '');
  if (/["\n\r,;]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function repoRoot() {
  return path.resolve(process.cwd());
}

function liveRoot() {
  return path.resolve(argValue('--root', process.env.STREAM_ASSETS_ROOT || 'D:\\Streaming\\stramAssets'));
}

function dbPath(root) {
  return path.resolve(argValue('--db', path.join(root, 'data', 'sqlite', 'app.sqlite')));
}

function outputPlanPath() {
  return path.resolve(argValue('--out', path.join(repoRoot(), 'config', 'media_migration_plan.suggested.json')));
}

function fileExists(file) {
  try { return fs.existsSync(file); } catch (_) { return false; }
}

function rowToAsset(row, root) {
  const relativePath = normalizeSlashes(row.relative_path || '');
  const absolutePath = row.absolute_path || path.join(root, 'htdocs', 'assets', relativePath);
  return {
    id: Number(row.id || 0),
    type: row.type || '',
    category: row.category || '',
    moduleKey: row.module_key || '',
    categoryKey: row.category_key || '',
    displayName: row.display_name || '',
    fileName: row.file_name || path.basename(relativePath),
    relativePath,
    webPath: row.web_path || '',
    absolutePath,
    sizeBytes: Number(row.size_bytes || 0),
    durationMs: Number(row.duration_ms || 0),
    hasAudio: Number(row.has_audio || 0) === 1,
    hasVideo: Number(row.has_video || 0) === 1,
    source: row.source || '',
    status: row.status || '',
    createdAt: row.created_at || '',
    updatedAt: row.updated_at || ''
  };
}

function commandMediaReferences(db) {
  const refs = new Map();
  const commands = [];
  let rows = [];
  try {
    rows = db.prepare('SELECT id, trigger, module_key, action_key, target_url, config_json FROM command_definitions').all();
  } catch (_) {
    return { refs, commands };
  }

  for (const row of rows) {
    const config = parseJson(row.config_json, {});
    const found = new Set();
    const targetUrl = String(row.target_url || '');
    const urlMatch = targetUrl.match(/[?&]mediaId=([0-9]+)/i);
    if (urlMatch) found.add(Number(urlMatch[1]));
    const cfgId = Number(config.mediaId || config.media_id || config.soundMediaId || config.videoMediaId || 0);
    if (Number.isFinite(cfgId) && cfgId > 0) found.add(cfgId);

    for (const mediaId of found) {
      if (!refs.has(mediaId)) refs.set(mediaId, []);
      refs.get(mediaId).push({
        id: Number(row.id || 0),
        trigger: row.trigger || '',
        moduleKey: row.module_key || '',
        actionKey: row.action_key || '',
        targetUrl,
        actionType: config.actionType || ''
      });
      commands.push({ commandId: Number(row.id || 0), trigger: row.trigger || '', mediaId, actionType: config.actionType || '' });
    }
  }

  return { refs, commands };
}

function tokenText(asset) {
  return [asset.displayName, asset.fileName, asset.relativePath, asset.category, asset.moduleKey, asset.categoryKey]
    .join(' ')
    .toLowerCase();
}

function matchAny(text, list) {
  return list.some(item => text.includes(item));
}

function ruleSuggestion(asset, refs) {
  const text = tokenText(asset);
  const ext = path.extname(asset.fileName || asset.relativePath).toLowerCase();
  const isCommand = refs.has(asset.id);

  if (isCommand) {
    if (matchAny(text, ['roxxy', 'blase'])) return { moduleKey: 'commands', categoryKey: 'roxxy', reason: 'command_reference_roxxy' };
    if (matchAny(text, ['skate', 'udo', 'fun', 'witz', 'laugh', 'lachen'])) return { moduleKey: 'commands', categoryKey: 'fun', reason: 'command_reference_fun' };
    return { moduleKey: 'commands', categoryKey: 'general', reason: 'referenced_by_command' };
  }

  if (matchAny(text, ['alert', 'follower', 'follow'])) return { moduleKey: 'alerts', categoryKey: 'follow', reason: 'name_alert_follow' };
  if (matchAny(text, ['sub', 'subscribe', 'subscriber', 'abo'])) return { moduleKey: 'alerts', categoryKey: 'sub', reason: 'name_alert_sub' };
  if (matchAny(text, ['bits', 'cheer'])) return { moduleKey: 'alerts', categoryKey: 'bits', reason: 'name_alert_bits' };
  if (matchAny(text, ['raid'])) return { moduleKey: 'alerts', categoryKey: 'raid', reason: 'name_alert_raid' };

  if (matchAny(text, ['soundalert', 'sound-alert', 'channelreward', 'channel-reward', 'reward', 'kanalpunkte'])) {
    return { moduleKey: 'soundalerts', categoryKey: 'general', reason: 'name_soundalerts' };
  }

  if (matchAny(text, ['birthday', 'geburtstag', 'happy-birthday', 'bday'])) return { moduleKey: 'birthday', categoryKey: 'general', reason: 'name_birthday' };
  if (matchAny(text, ['vip'])) return { moduleKey: 'vip', categoryKey: 'general', reason: 'name_vip' };
  if (matchAny(text, ['tts'])) return { moduleKey: 'tts', categoryKey: 'general', reason: 'name_tts' };

  if (asset.type === 'audio') {
    if (matchAny(text, ['intro', 'start', 'opening'])) return { moduleKey: 'general', categoryKey: 'intro', reason: 'audio_intro' };
    if (matchAny(text, ['outro', 'ende', 'ending'])) return { moduleKey: 'general', categoryKey: 'outro', reason: 'audio_outro' };
    if (matchAny(text, ['test', 'beep'])) return { moduleKey: 'general', categoryKey: 'test', reason: 'audio_test' };
    return { moduleKey: 'general', categoryKey: 'audio', reason: 'default_audio' };
  }

  if (asset.type === 'video' || asset.type === 'animation' || ['.mp4', '.webm', '.mov'].includes(ext)) {
    if (matchAny(text, ['intro', 'start', 'opening'])) return { moduleKey: 'general', categoryKey: 'intro', reason: 'video_intro' };
    if (matchAny(text, ['outro', 'ende', 'ending'])) return { moduleKey: 'general', categoryKey: 'outro', reason: 'video_outro' };
    if (matchAny(text, ['transition', 'stinger'])) return { moduleKey: 'general', categoryKey: 'transitions', reason: 'video_transition' };
    return { moduleKey: 'general', categoryKey: 'video', reason: 'default_video' };
  }

  if (asset.type === 'image') return { moduleKey: 'general', categoryKey: 'images', reason: 'default_image' };
  return { moduleKey: 'general', categoryKey: 'unsorted', reason: 'default_unsorted' };
}

function buildPlan(assets, refs) {
  const byId = {};
  const rules = [];
  const categories = new Map();
  const suggestions = [];

  for (const asset of assets) {
    const suggestion = ruleSuggestion(asset, refs);
    const moduleKey = slug(suggestion.moduleKey, 'general');
    const categoryKey = slug(suggestion.categoryKey, 'general');
    const commandRefs = refs.get(asset.id) || [];
    categories.set(`${moduleKey}/${categoryKey}`, { moduleKey, categoryKey });

    suggestions.push({
      id: asset.id,
      type: asset.type,
      displayName: asset.displayName,
      fileName: asset.fileName,
      current: { moduleKey: asset.moduleKey || '', categoryKey: asset.categoryKey || '', relativePath: asset.relativePath },
      suggested: { moduleKey, categoryKey },
      reason: suggestion.reason,
      commandRefs: commandRefs.map(ref => ref.trigger),
      sourceExists: fileExists(asset.absolutePath)
    });

    byId[String(asset.id)] = {
      moduleKey,
      categoryKey,
      note: `${suggestion.reason}: ${asset.displayName || asset.fileName || asset.relativePath}`
    };
  }

  const plan = {
    version: 1,
    step: STEP,
    generatedAt: new Date().toISOString(),
    description: 'Generated suggestion for tools/media_registry_migrate_categories.js. Review manually before apply.',
    defaults: {
      moduleKey: 'general',
      categoryKey: 'unsorted'
    },
    categories: Array.from(categories.values()).sort((a, b) => `${a.moduleKey}/${a.categoryKey}`.localeCompare(`${b.moduleKey}/${b.categoryKey}`)),
    byId,
    rules,
    notes: [
      'This file is a suggestion, not a migration result.',
      'Review all byId entries before running --apply --copy-files.',
      'The migration tool copies files first and updates DB paths; it does not delete old files.'
    ]
  };

  return { plan, suggestions };
}

function writeCsv(file, suggestions) {
  const header = ['id','type','displayName','fileName','currentModule','currentCategory','currentRelativePath','suggestedModule','suggestedCategory','reason','commandRefs','sourceExists'];
  const rows = [header.join(',')];
  for (const item of suggestions) {
    rows.push([
      item.id,
      item.type,
      item.displayName,
      item.fileName,
      item.current.moduleKey,
      item.current.categoryKey,
      item.current.relativePath,
      item.suggested.moduleKey,
      item.suggested.categoryKey,
      item.reason,
      item.commandRefs.join('|'),
      item.sourceExists ? '1' : '0'
    ].map(csvEscape).join(','));
  }
  fs.writeFileSync(file, `${rows.join('\n')}\n`, 'utf8');
}

function main() {
  if (hasFlag('--help') || hasFlag('-h')) {
    console.log(`Usage:\n  node tools/media_registry_suggest_categories.js [--root D:\\Streaming\\stramAssets] [--db path] [--out config/media_migration_plan.suggested.json]\n\nNo DB/file changes are made.`);
    return;
  }

  const root = liveRoot();
  const dbFile = dbPath(root);
  if (!fileExists(dbFile)) throw new Error(`database_not_found: ${dbFile}`);

  const db = new DatabaseSync(dbFile);
  const rows = db.prepare(`
    SELECT *
    FROM media_assets
    WHERE COALESCE(status, 'active') = 'active'
    ORDER BY id ASC
  `).all();
  const assets = rows.map(row => rowToAsset(row, root));
  const { refs, commands } = commandMediaReferences(db);
  const { plan, suggestions } = buildPlan(assets, refs);

  const outPlan = outputPlanPath();
  ensureDir(path.dirname(outPlan));
  fs.writeFileSync(outPlan, JSON.stringify(plan, null, 2), 'utf8');

  const exportDir = ensureDir(path.join(root, 'data', 'exports', 'media_migration'));
  const stamp = isoStamp();
  const jsonFile = path.join(exportDir, `media_registry_suggestions_${stamp}.json`);
  const csvFile = path.join(exportDir, `media_registry_suggestions_${stamp}.csv`);
  fs.writeFileSync(jsonFile, JSON.stringify({ ok: true, step: STEP, generatedAt: new Date().toISOString(), root, dbFile, outputPlan: outPlan, commands, suggestions }, null, 2), 'utf8');
  writeCsv(csvFile, suggestions);

  const byModule = {};
  const byReason = {};
  for (const item of suggestions) {
    byModule[item.suggested.moduleKey] = (byModule[item.suggested.moduleKey] || 0) + 1;
    byReason[item.reason] = (byReason[item.reason] || 0) + 1;
  }

  console.log(JSON.stringify({
    ok: true,
    step: STEP,
    mode: 'suggest-only',
    total: suggestions.length,
    commandReferenced: commands.length,
    outputPlan: outPlan,
    reports: { jsonFile, csvFile },
    summary: { byModule, byReason }
  }, null, 2));
}

try {
  main();
} catch (err) {
  console.error(JSON.stringify({ ok: false, step: STEP, error: err.message || String(err) }, null, 2));
  process.exitCode = 1;
}

#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = process.cwd();
const mediaPath = path.join(root, 'backend', 'modules', 'media.js');
const helperMediaPath = path.join(root, 'backend', 'modules', 'helpers', 'helper_media.js');

function read(file) {
  if (!fs.existsSync(file)) throw new Error(`Datei nicht gefunden: ${file}`);
  return fs.readFileSync(file, 'utf8');
}

function writeIfChanged(file, content) {
  const old = read(file);
  if (old === content) {
    console.log(`[STEP274A1B] unverändert: ${path.relative(root, file)}`);
    return false;
  }
  fs.writeFileSync(file, content, 'utf8');
  console.log(`[STEP274A1B] aktualisiert: ${path.relative(root, file)}`);
  return true;
}

function replaceFunction(source, functionName, replacement) {
  const start = source.indexOf(`function ${functionName}(`);
  if (start < 0) throw new Error(`Funktion nicht gefunden: ${functionName}`);

  const brace = source.indexOf('{', start);
  if (brace < 0) throw new Error(`Funktionsanfang nicht gefunden: ${functionName}`);

  let depth = 0;
  let end = -1;
  let inString = false;
  let stringChar = '';
  let escaped = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = brace; i < source.length; i += 1) {
    const ch = source[i];
    const next = source[i + 1];

    if (inLineComment) {
      if (ch === '\n') inLineComment = false;
      continue;
    }
    if (inBlockComment) {
      if (ch === '*' && next === '/') {
        inBlockComment = false;
        i += 1;
      }
      continue;
    }
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === '\\') {
        escaped = true;
      } else if (ch === stringChar) {
        inString = false;
        stringChar = '';
      }
      continue;
    }

    if (ch === '/' && next === '/') {
      inLineComment = true;
      i += 1;
      continue;
    }
    if (ch === '/' && next === '*') {
      inBlockComment = true;
      i += 1;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      inString = true;
      stringChar = ch;
      continue;
    }
    if (ch === '{') depth += 1;
    else if (ch === '}') {
      depth -= 1;
      if (depth === 0) {
        end = i + 1;
        break;
      }
    }
  }

  if (end < 0) throw new Error(`Funktionsende nicht gefunden: ${functionName}`);
  return source.slice(0, start) + replacement.trimEnd() + source.slice(end);
}

function patchMediaJs() {
  let src = read(mediaPath);

  const newListAssets = [
    'function listAssets(options = {}) {',
    '  ensureSchema();',
    '',
    "  const requestedType = clean(options.type || '');",
    "  const requestedCategory = clean(options.category || '');",
    "  const requestedStatus = clean(options.status || 'active');",
    "  const requestedQuery = clean(options.q || '');",
    '  const limit = Math.max(1, Math.min(500, Number(options.limit || 200)));',
    '',
    '  const where = [];',
    '  const params = { limit };',
    '',
    '  if (requestedType) {',
    "    where.push('type = :type');",
    '    params.type = requestedType;',
    '  }',
    '',
    '  if (requestedCategory) {',
    "    where.push('category = :category');",
    '    params.category = requestedCategory;',
    '  }',
    '',
    "  if (requestedStatus && requestedStatus !== 'all') {",
    "    where.push('status = :status');",
    '    params.status = requestedStatus;',
    '  }',
    '',
    '  if (requestedQuery) {',
    "    where.push('(lower(display_name) LIKE :q OR lower(file_name) LIKE :q OR lower(relative_path) LIKE :q OR lower(category) LIKE :q)');",
    "    params.q = '%' + requestedQuery.toLowerCase() + '%';",
    '  }',
    '',
    "  const sql = [",
    "    'SELECT *',",
    "    'FROM media_assets',",
    "    where.length ? 'WHERE ' + where.join(' AND ') : '',",
    "    'ORDER BY type ASC, category ASC, display_name COLLATE NOCASE ASC',",
    "    'LIMIT :limit'",
    "  ].filter(Boolean).join('\\n');",
    '',
    '  const rows = db.all(sql, params);',
    '  return rows.map(rowToAsset).filter(Boolean);',
    '}'
  ].join('\n');

  src = replaceFunction(src, 'listAssets', newListAssets);
  src = src.replace(/step: 'STEP274A1'|step: 'STEP274A'/g, "step: 'STEP274A1B'");
  src = src.replace(
    /note: 'STEP274A[^']*'/,
    "note: 'STEP274A1B: Media-Core Fix fuer optionale Listenfilter und ruhigere Scans. Dashboard und Command-Anbindung folgen in STEP274B/C.'"
  );
  src = src.replace(/return \{ name: MODULE_NAME, step: 'STEP274A1' \};|return \{ name: MODULE_NAME, step: 'STEP274A' \};/g, "return { name: MODULE_NAME, step: 'STEP274A1B' };");

  writeIfChanged(mediaPath, src);
}

function patchHelperMediaJs() {
  let src = read(helperMediaPath);

  const execOptionsOld = "{ encoding: 'utf8', timeout: Number(options.timeoutMs) || 5000 }";
  const execOptionsNew = "{ encoding: 'utf8', timeout: Number(options.timeoutMs) || 5000, stdio: ['ignore', 'pipe', 'pipe'] }";
  if (src.includes(execOptionsOld)) src = src.split(execOptionsOld).join(execOptionsNew);

  src = src.replace(
    "return { ok: false, durationMs: 0, cached: false, error: err.message || String(err) };",
    "return { ok: false, durationMs: 0, cached: false, error: 'ffprobe_failed' };"
  );

  src = src.replace(
    "return { ok: false, durationMs: 0, durationOk: false, hasVideo: false, hasAudio: false, width: 0, height: 0, formatName: '', formatLongName: '', videoCodec: '', audioCodec: '', cached: false, error: err.message || String(err) };",
    "return { ok: false, durationMs: 0, durationOk: false, hasVideo: false, hasAudio: false, width: 0, height: 0, formatName: '', formatLongName: '', videoCodec: '', audioCodec: '', cached: false, error: 'ffprobe_failed' };"
  );

  writeIfChanged(helperMediaPath, src);
}

try {
  patchMediaJs();
  patchHelperMediaJs();
  console.log('[STEP274A1B] Fertig. Bitte node --check ausführen.');
} catch (err) {
  console.error('[STEP274A1B] Fehler:', err.message || String(err));
  process.exit(1);
}

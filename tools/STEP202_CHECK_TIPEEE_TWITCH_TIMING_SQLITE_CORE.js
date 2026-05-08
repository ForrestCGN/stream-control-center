// STEP202.2 — Tipeee/Twitch Timing Check via project sqlite_core
// Read-only diagnostic. Does not trigger alerts/webhooks/sounds.

'use strict';

const fs = require('fs');
const path = require('path');

const REPO_ROOT = 'D:\\Git\\stream-control-center';
const OUT_JSON = 'D:\\gpt\\tipeee_twitch_timing_check.json';
const OUT_TXT = 'D:\\gpt\\tipeee_twitch_timing_check.txt';
const WINDOW_SECONDS = Number(process.argv[2] || 120);

process.chdir(REPO_ROOT);

const sqlite = require(path.join(REPO_ROOT, 'backend\\modules\\sqlite_core.js'));

function safe(v) {
  return v === null || v === undefined ? '' : String(v);
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function parseDateMs(v) {
  const ms = new Date(v).getTime();
  return Number.isFinite(ms) ? ms : 0;
}

function secDiff(a, b) {
  const aa = parseDateMs(a);
  const bb = parseDateMs(b);
  if (!aa || !bb) return 999999;
  return Math.round(Math.abs(aa - bb) / 1000);
}

function tableExists(name) {
  const row = sqlite.get(
    "SELECT name FROM sqlite_master WHERE type='table' AND name=:name",
    { name }
  );
  return !!row;
}

function columns(table) {
  try {
    return sqlite.all(`PRAGMA table_info(${table})`).map(r => r.name);
  } catch (_) {
    return [];
  }
}

function pickColumn(existing, preferred) {
  for (const p of preferred) {
    if (existing.includes(p)) return p;
  }
  return null;
}

function selectAlertRows() {
  if (!tableExists('alert_events')) {
    throw new Error('Tabelle alert_events fehlt.');
  }

  const c = columns('alert_events');

  const createdCol = pickColumn(c, ['created_at', 'createdAt', 'started_at', 'updated_at']) || 'created_at';
  const uidCol = pickColumn(c, ['event_uid', 'eventUid', 'id']) || 'id';
  const sourceCol = pickColumn(c, ['source', 'provider']) || 'source';
  const typeCol = pickColumn(c, ['type_key', 'typeKey', 'type', 'event_type']) || 'type_key';
  const userLoginCol = pickColumn(c, ['user_login', 'userLogin', 'login']) || null;
  const userDisplayCol = pickColumn(c, ['user_display', 'userDisplay', 'user', 'username']) || null;
  const amountCol = pickColumn(c, ['amount', 'value']) || null;
  const messageCol = pickColumn(c, ['message', 'text', 'raw_text']) || null;
  const statusCol = pickColumn(c, ['status', 'state']) || null;

  const select = [
    `${uidCol} AS event_uid`,
    `${sourceCol} AS source`,
    `${typeCol} AS type_key`,
    userLoginCol ? `${userLoginCol} AS user_login` : "'' AS user_login",
    userDisplayCol ? `${userDisplayCol} AS user_display` : "'' AS user_display",
    amountCol ? `${amountCol} AS amount` : "0 AS amount",
    messageCol ? `${messageCol} AS message` : "'' AS message",
    statusCol ? `${statusCol} AS status` : "'' AS status",
    `${createdCol} AS created_at`
  ].join(',\n        ');

  return sqlite.all(`
    SELECT
        ${select}
    FROM alert_events
    WHERE LOWER(COALESCE(${sourceCol}, '')) IN ('twitch', 'tipeee', 'kofi')
    ORDER BY datetime(${createdCol}) DESC
    LIMIT 500
  `);
}

function selectProviderRows() {
  if (!tableExists('alert_provider_events')) return [];

  const c = columns('alert_provider_events');

  const providerCol = pickColumn(c, ['provider', 'source']) || 'provider';
  const providerEventIdCol = pickColumn(c, ['provider_event_id', 'providerEventId', 'event_id', 'id']) || null;
  const sourceCol = pickColumn(c, ['source']) || null;
  const typeCol = pickColumn(c, ['type_key', 'typeKey', 'type', 'event_type']) || 'type_key';
  const userDisplayCol = pickColumn(c, ['user_display', 'userDisplay', 'user', 'username']) || null;
  const amountCol = pickColumn(c, ['amount', 'value']) || null;
  const currencyCol = pickColumn(c, ['currency']) || null;
  const statusCol = pickColumn(c, ['status', 'state']) || null;
  const forwardedCol = pickColumn(c, ['forwarded_event_uid', 'forwardedEventUid', 'event_uid']) || null;
  const createdCol = pickColumn(c, ['created_at', 'createdAt', 'received_at', 'updated_at']) || 'created_at';
  const forwardedAtCol = pickColumn(c, ['forwarded_at', 'forwardedAt']) || null;

  const select = [
    `${providerCol} AS provider`,
    providerEventIdCol ? `${providerEventIdCol} AS provider_event_id` : "'' AS provider_event_id",
    sourceCol ? `${sourceCol} AS source` : "'' AS source",
    `${typeCol} AS type_key`,
    userDisplayCol ? `${userDisplayCol} AS user_display` : "'' AS user_display",
    amountCol ? `${amountCol} AS amount` : "0 AS amount",
    currencyCol ? `${currencyCol} AS currency` : "'' AS currency",
    statusCol ? `${statusCol} AS status` : "'' AS status",
    forwardedCol ? `${forwardedCol} AS forwarded_event_uid` : "'' AS forwarded_event_uid",
    `${createdCol} AS created_at`,
    forwardedAtCol ? `${forwardedAtCol} AS forwarded_at` : "'' AS forwarded_at"
  ].join(',\n        ');

  return sqlite.all(`
    SELECT
        ${select}
    FROM alert_provider_events
    WHERE LOWER(COALESCE(${providerCol}, '')) IN ('tipeee', 'kofi')
    ORDER BY datetime(${createdCol}) DESC
    LIMIT 500
  `);
}

function buildResult(alertRows, providerRows) {
  const twitchAlerts = alertRows.filter(r => safe(r.source).toLowerCase() === 'twitch');
  const tipeeeAlerts = alertRows.filter(r => safe(r.source).toLowerCase() === 'tipeee');
  const kofiAlerts = alertRows.filter(r => safe(r.source).toLowerCase() === 'kofi');

  function closePairs(rightRows, rightName) {
    const pairs = [];
    for (const t of twitchAlerts) {
      for (const x of rightRows) {
        const diff = secDiff(t.created_at, x.created_at);
        if (diff <= WINDOW_SECONDS) {
          pairs.push({
            diffSeconds: diff,
            possibleDuplicate: num(t.amount) === num(x.amount),
            twitch: {
              event_uid: t.event_uid,
              source: t.source,
              type_key: t.type_key,
              user: t.user_display || t.user_login,
              amount: t.amount,
              status: t.status,
              created_at: t.created_at,
              message: t.message
            },
            other: {
              provider: rightName,
              event_uid: x.event_uid || '',
              source: x.source,
              type_key: x.type_key,
              user: x.user_display || x.user_login,
              amount: x.amount,
              status: x.status,
              created_at: x.created_at,
              message: x.message || ''
            }
          });
        }
      }
    }
    return pairs.sort((a, b) => a.diffSeconds - b.diffSeconds);
  }

  const providerNearTwitch = [];
  for (const p of providerRows) {
    for (const t of twitchAlerts) {
      const diff = secDiff(p.created_at, t.created_at);
      if (diff <= WINDOW_SECONDS) {
        providerNearTwitch.push({
          diffSeconds: diff,
          sameAmount: num(p.amount) === num(t.amount),
          provider: {
            provider: p.provider,
            provider_event_id: p.provider_event_id,
            type_key: p.type_key,
            user: p.user_display,
            amount: p.amount,
            currency: p.currency,
            status: p.status,
            forwarded_event_uid: p.forwarded_event_uid,
            created_at: p.created_at,
            forwarded_at: p.forwarded_at
          },
          twitch: {
            event_uid: t.event_uid,
            type_key: t.type_key,
            user: t.user_display || t.user_login,
            amount: t.amount,
            status: t.status,
            created_at: t.created_at
          }
        });
      }
    }
  }

  providerNearTwitch.sort((a, b) => a.diffSeconds - b.diffSeconds);

  return {
    ok: true,
    checkedAt: new Date().toISOString(),
    repoRoot: REPO_ROOT,
    databasePath: typeof sqlite.getDbPath === 'function' ? sqlite.getDbPath() : '',
    windowSeconds: WINDOW_SECONDS,
    tableInfo: {
      hasAlertEvents: tableExists('alert_events'),
      hasProviderEvents: tableExists('alert_provider_events'),
      alertRowsChecked: alertRows.length,
      providerRowsChecked: providerRows.length,
      twitchAlertCount: twitchAlerts.length,
      tipeeeAlertCount: tipeeeAlerts.length,
      kofiAlertCount: kofiAlerts.length
    },
    closeTipeeeAlertPairs: closePairs(tipeeeAlerts, 'tipeee'),
    closeKofiAlertPairs: closePairs(kofiAlerts, 'kofi'),
    providerNearTwitch
  };
}

function writeFiles(result) {
  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.writeFileSync(OUT_JSON, JSON.stringify(result, null, 2), 'utf8');

  const lines = [];
  lines.push('Tipeee/Kofi/Twitch Timing Check');
  lines.push('================================');
  lines.push(`Geprüft: ${result.checkedAt}`);
  lines.push(`Fenster: ${result.windowSeconds} Sekunden`);
  lines.push(`DB: ${result.databasePath}`);
  lines.push('');
  lines.push('Counts');
  lines.push('------');
  lines.push(`alert_events: ${result.tableInfo.hasAlertEvents}`);
  lines.push(`alert_provider_events: ${result.tableInfo.hasProviderEvents}`);
  lines.push(`Alert Rows geprüft: ${result.tableInfo.alertRowsChecked}`);
  lines.push(`Provider Rows geprüft: ${result.tableInfo.providerRowsChecked}`);
  lines.push(`Twitch Alerts: ${result.tableInfo.twitchAlertCount}`);
  lines.push(`Tipeee Alerts: ${result.tableInfo.tipeeeAlertCount}`);
  lines.push(`Ko-fi Alerts: ${result.tableInfo.kofiAlertCount}`);
  lines.push('');
  lines.push(`Twitch + Tipeee Alert-Paare <= ${result.windowSeconds}s: ${result.closeTipeeeAlertPairs.length}`);
  for (const p of result.closeTipeeeAlertPairs.slice(0, 80)) {
    lines.push(`- ${p.diffSeconds}s | sameAmount=${p.possibleDuplicate} | Twitch ${p.twitch.type_key} ${p.twitch.amount} @ ${p.twitch.created_at} | Tipeee ${p.other.type_key} ${p.other.amount} @ ${p.other.created_at}`);
  }
  lines.push('');
  lines.push(`Twitch + Ko-fi Alert-Paare <= ${result.windowSeconds}s: ${result.closeKofiAlertPairs.length}`);
  for (const p of result.closeKofiAlertPairs.slice(0, 40)) {
    lines.push(`- ${p.diffSeconds}s | sameAmount=${p.possibleDuplicate} | Twitch ${p.twitch.type_key} ${p.twitch.amount} @ ${p.twitch.created_at} | Ko-fi ${p.other.type_key} ${p.other.amount} @ ${p.other.created_at}`);
  }
  lines.push('');
  lines.push(`Provider-Events nahe Twitch <= ${result.windowSeconds}s: ${result.providerNearTwitch.length}`);
  for (const p of result.providerNearTwitch.slice(0, 120)) {
    lines.push(`- ${p.diffSeconds}s | sameAmount=${p.sameAmount} | ${p.provider.provider}/${p.provider.type_key} ${p.provider.amount} ${p.provider.currency} @ ${p.provider.created_at} -> forwarded=${p.provider.forwarded_event_uid || '-'} | Twitch ${p.twitch.type_key} ${p.twitch.amount} @ ${p.twitch.created_at}`);
  }
  lines.push('');
  lines.push('Bewertung');
  lines.push('---------');
  if (result.closeTipeeeAlertPairs.length === 0 && result.providerNearTwitch.length === 0) {
    lines.push('Keine Tipeee-Events im Zeitfenster zu Twitch-Alerts gefunden.');
  } else {
    lines.push('Es gibt Provider-/Tipeee-Events nahe Twitch-Alerts. Treffer mit sameAmount=true und kleinen Sekundenwerten sind verdächtig.');
  }

  fs.writeFileSync(OUT_TXT, lines.join('\r\n'), 'utf8');
}

try {
  const alertRows = selectAlertRows();
  const providerRows = selectProviderRows();
  const result = buildResult(alertRows, providerRows);
  writeFiles(result);

  console.log(JSON.stringify({
    ok: true,
    outTxt: OUT_TXT,
    outJson: OUT_JSON,
    closeTipeeeAlertPairs: result.closeTipeeeAlertPairs.length,
    closeKofiAlertPairs: result.closeKofiAlertPairs.length,
    providerNearTwitch: result.providerNearTwitch.length
  }, null, 2));
} catch (err) {
  const result = {
    ok: false,
    checkedAt: new Date().toISOString(),
    repoRoot: REPO_ROOT,
    error: err.message || String(err),
    stack: err.stack || ''
  };
  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.writeFileSync(OUT_JSON, JSON.stringify(result, null, 2), 'utf8');
  fs.writeFileSync(OUT_TXT, `FEHLER\r\n${result.error}\r\n\r\n${result.stack}`, 'utf8');
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}

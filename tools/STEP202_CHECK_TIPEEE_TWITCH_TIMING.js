const fs = require('fs');
const path = require('path');
const { createRequire } = require('module');

const REPO_ROOT = 'D:\\Git\\stream-control-center';
const DB_PATH = 'D:\\Streaming\\stramAssets\\data\\sqlite\\app.sqlite';
const OUT_JSON = 'D:\\gpt\\tipeee_twitch_timing_check.json';
const OUT_TXT = 'D:\\gpt\\tipeee_twitch_timing_check.txt';
const WINDOW_SECONDS = Number(process.argv[2] || 120);

const repoRequire = createRequire(path.join(REPO_ROOT, 'package.json'));

function secDiff(a, b) {
  return Math.round(Math.abs(new Date(a).getTime() - new Date(b).getTime()) / 1000);
}

function safe(v) {
  return v === null || v === undefined ? '' : String(v);
}

function writeResult(result) {
  fs.writeFileSync(OUT_JSON, JSON.stringify(result, null, 2), 'utf8');

  const lines = [];
  lines.push('Tipeee/Kofi/Twitch Timing Check');
  lines.push('================================');
  lines.push(`Geprüft: ${result.checkedAt}`);
  lines.push(`Fenster: ${result.windowSeconds} Sekunden`);
  lines.push(`DB: ${result.databasePath}`);
  lines.push('');
  lines.push('Tabellen / Counts');
  lines.push('-----------------');
  lines.push(`alert_events vorhanden: ${result.tableInfo.hasAlertEvents}`);
  lines.push(`alert_provider_events vorhanden: ${result.tableInfo.hasProviderEvents}`);
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
  lines.push('Interpretation');
  lines.push('--------------');
  if (result.closeTipeeeAlertPairs.length === 0 && result.providerNearTwitch.length === 0) {
    lines.push('Keine Tipeee-Events im Zeitfenster zu Twitch-Alerts gefunden.');
  } else {
    lines.push('Es gibt Tipeee/Provider-Events nahe Twitch-Alerts. Prüfe sameAmount=true und sehr kleine diffSeconds besonders genau.');
  }

  fs.writeFileSync(OUT_TXT, lines.join('\r\n'), 'utf8');
}

function buildResult(alertRows, providerRows, tables) {
  const hasAlertEvents = tables.includes('alert_events');
  const hasProviderEvents = tables.includes('alert_provider_events');

  const twitchAlerts = alertRows.filter(r => safe(r.source).toLowerCase() === 'twitch');
  const tipeeeAlerts = alertRows.filter(r => safe(r.source).toLowerCase() === 'tipeee');
  const kofiAlerts = alertRows.filter(r => safe(r.source).toLowerCase() === 'kofi');

  function findClosePairs(rightRows, rightName) {
    const pairs = [];
    for (const t of twitchAlerts) {
      for (const x of rightRows) {
        if (!t.created_at || !x.created_at) continue;
        const diff = secDiff(t.created_at, x.created_at);
        if (diff <= WINDOW_SECONDS) {
          pairs.push({
            diffSeconds: diff,
            possibleDuplicate: Number(t.amount || 0) === Number(x.amount || 0),
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

  const closeTipeeeAlertPairs = findClosePairs(tipeeeAlerts, 'tipeee');
  const closeKofiAlertPairs = findClosePairs(kofiAlerts, 'kofi');

  const providerNearTwitch = [];
  for (const p of providerRows) {
    for (const t of twitchAlerts) {
      if (!p.created_at || !t.created_at) continue;
      const diff = secDiff(p.created_at, t.created_at);
      if (diff <= WINDOW_SECONDS) {
        providerNearTwitch.push({
          diffSeconds: diff,
          sameAmount: Number(p.amount || 0) === Number(t.amount || 0),
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
    databasePath: DB_PATH,
    repoRoot: REPO_ROOT,
    windowSeconds: WINDOW_SECONDS,
    tableInfo: {
      hasAlertEvents,
      hasProviderEvents,
      alertRowsChecked: alertRows.length,
      providerRowsChecked: providerRows.length,
      twitchAlertCount: twitchAlerts.length,
      tipeeeAlertCount: tipeeeAlerts.length,
      kofiAlertCount: kofiAlerts.length
    },
    closeTipeeeAlertPairs,
    closeKofiAlertPairs,
    providerNearTwitch
  };
}

function queryWithBetterSqlite3(Database) {
  const db = new Database(DB_PATH, { readonly: true });
  try {
    const tables = db.prepare(`
      SELECT name FROM sqlite_master
      WHERE type='table'
      ORDER BY name
    `).all().map(r => r.name);

    if (!tables.includes('alert_events')) throw new Error('Tabelle alert_events fehlt.');

    const alertRows = db.prepare(`
      SELECT
        event_uid,
        source,
        type_key,
        user_login,
        user_display,
        amount,
        message,
        status,
        created_at,
        started_at,
        finished_at,
        payload_json
      FROM alert_events
      WHERE source IN ('twitch', 'tipeee', 'kofi')
      ORDER BY datetime(created_at) DESC
      LIMIT 500
    `).all();

    const providerRows = tables.includes('alert_provider_events') ? db.prepare(`
      SELECT
        provider,
        provider_event_id,
        source,
        type_key,
        user_display,
        amount,
        currency,
        status,
        forwarded_event_uid,
        created_at,
        forwarded_at,
        raw_json
      FROM alert_provider_events
      WHERE provider IN ('tipeee', 'kofi')
      ORDER BY datetime(created_at) DESC
      LIMIT 500
    `).all() : [];

    return buildResult(alertRows, providerRows, tables);
  } finally {
    db.close();
  }
}

function runSqlite3(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows || []));
  });
}

async function queryWithSqlite3(sqlite3) {
  const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READONLY);
  try {
    const tableRows = await runSqlite3(db, `
      SELECT name FROM sqlite_master
      WHERE type='table'
      ORDER BY name
    `);
    const tables = tableRows.map(r => r.name);

    if (!tables.includes('alert_events')) throw new Error('Tabelle alert_events fehlt.');

    const alertRows = await runSqlite3(db, `
      SELECT
        event_uid,
        source,
        type_key,
        user_login,
        user_display,
        amount,
        message,
        status,
        created_at,
        started_at,
        finished_at,
        payload_json
      FROM alert_events
      WHERE source IN ('twitch', 'tipeee', 'kofi')
      ORDER BY datetime(created_at) DESC
      LIMIT 500
    `);

    let providerRows = [];
    if (tables.includes('alert_provider_events')) {
      providerRows = await runSqlite3(db, `
        SELECT
          provider,
          provider_event_id,
          source,
          type_key,
          user_display,
          amount,
          currency,
          status,
          forwarded_event_uid,
          created_at,
          forwarded_at,
          raw_json
        FROM alert_provider_events
        WHERE provider IN ('tipeee', 'kofi')
        ORDER BY datetime(created_at) DESC
        LIMIT 500
      `);
    }

    return buildResult(alertRows, providerRows, tables);
  } finally {
    db.close();
  }
}

(async () => {
  if (!fs.existsSync(DB_PATH)) {
    throw new Error(`DB nicht gefunden: ${DB_PATH}`);
  }

  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });

  let result;
  let usedDriver = '';

  try {
    const Database = repoRequire('better-sqlite3');
    result = queryWithBetterSqlite3(Database);
    usedDriver = 'better-sqlite3 via repoRequire';
  } catch (betterErr) {
    try {
      const sqlite3 = repoRequire('sqlite3');
      result = await queryWithSqlite3(sqlite3);
      usedDriver = 'sqlite3 via repoRequire';
    } catch (sqliteErr) {
      const errorResult = {
        ok: false,
        checkedAt: new Date().toISOString(),
        databasePath: DB_PATH,
        repoRoot: REPO_ROOT,
        error: 'Kein SQLite Node-Treiber konnte geladen werden.',
        betterSqlite3Error: betterErr.message,
        sqlite3Error: sqliteErr.message,
        hint: 'Script muss mit installiertem Projekt-node_modules laufen. Prüfe npm install im Repo oder vorhandene DB-Helper.'
      };
      fs.writeFileSync(OUT_JSON, JSON.stringify(errorResult, null, 2), 'utf8');
      fs.writeFileSync(OUT_TXT, [
        'Tipeee/Kofi/Twitch Timing Check FEHLER',
        '=====================================',
        errorResult.error,
        '',
        `better-sqlite3: ${errorResult.betterSqlite3Error}`,
        `sqlite3: ${errorResult.sqlite3Error}`,
        '',
        errorResult.hint
      ].join('\r\n'), 'utf8');
      console.log(JSON.stringify(errorResult, null, 2));
      process.exit(1);
    }
  }

  result.usedDriver = usedDriver;
  writeResult(result);

  console.log(JSON.stringify({
    ok: true,
    usedDriver,
    outJson: OUT_JSON,
    outTxt: OUT_TXT,
    closeTipeeeAlertPairs: result.closeTipeeeAlertPairs.length,
    closeKofiAlertPairs: result.closeKofiAlertPairs.length,
    providerNearTwitch: result.providerNearTwitch.length
  }, null, 2));
})().catch(err => {
  const errorResult = {
    ok: false,
    checkedAt: new Date().toISOString(),
    databasePath: DB_PATH,
    repoRoot: REPO_ROOT,
    error: err.message || String(err),
    stack: err.stack || ''
  };
  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.writeFileSync(OUT_JSON, JSON.stringify(errorResult, null, 2), 'utf8');
  fs.writeFileSync(OUT_TXT, `FEHLER\r\n${errorResult.error}\r\n\r\n${errorResult.stack}`, 'utf8');
  console.error(JSON.stringify(errorResult, null, 2));
  process.exit(1);
});

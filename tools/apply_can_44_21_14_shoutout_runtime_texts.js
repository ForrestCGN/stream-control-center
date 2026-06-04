#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

const root = process.cwd();
const target = path.join(root, 'backend', 'modules', 'clip_shoutout.js');
const backup = target + '.CAN-44.21.14.bak';

function fail(message) {
  console.error('[CAN-44.21.14] FEHLER:', message);
  process.exit(1);
}

if (!fs.existsSync(target)) fail('Datei nicht gefunden: ' + target);

let source = fs.readFileSync(target, 'utf8');
if (!fs.existsSync(backup)) {
  fs.writeFileSync(backup, source, 'utf8');
  console.log('[CAN-44.21.14] Backup erstellt:', backup);
}

const replacements = [
  {
    "label": "module version",
    "before": "const MODULE_VERSION = \"0.2.25\";",
    "after": "const MODULE_VERSION = \"0.2.26\";"
  },
  {
    "label": "auto defaults",
    "before": "const AUTO_SHOUTOUT_TEXT_DEFAULTS = {\n  'auto.greeting': [\n    '👋 @{displayName} ist im Altersheim eingetroffen. Die Pfleger schieben direkt mal den Shouti-Wagen los.',\n    '🧓 Achtung, @{displayName} hat sich an der Rezeption gemeldet. Zeit für einen ordentlichen Shouti aus dem CGN-Altersheim.',\n    '📺 @{displayName} ist da und hat genug Lebenszeichen gesendet. Der AutoShouti wird aus dem Rentner-Regal geholt.',\n    '💜 Willkommen @{displayName}! Die CGN-Rentnercrew startet schon mal den Shouti-Rollator.',\n    '☕ @{displayName} hat sich blicken lassen. Kaffee steht bereit, Shouti wird angeschoben.'\n  ]\n};",
    "after": "const AUTO_SHOUTOUT_TEXT_DEFAULTS = {\n  'auto.greeting': [\n    \"📼 Die Heimleitung hat die VHS von @{displayName} gefunden. Der alte Beamer wird angeworfen.\",\n    \"🎬 Im CGN-Altersheimkino läuft der Beamer von anno dazumal warm. Gleich auf der Leinwand: @{displayName}.\",\n    \"🧓 Die Rentnercrew sitzt schon im Kinosaal. Die Heimaufsicht stellt noch das Bild von @{displayName} scharf.\",\n    \"💿 Die DVD von @{displayName} wurde vorsichtig aus der Hülle genommen. Vorstellung beginnt gleich.\",\n    \"📺 Programmänderung im CGN-Altersheim: @{displayName} kommt auf den großen Bildschirm.\"\n]\n};"
  },
  {
    "label": "shoutout defaults",
    "before": "const SHOUTOUT_TEXT_DEFAULTS = {\n  'shoutout.chat.accepted': [\n    '✅ Shoutout für @{displayName} aufgenommen.'\n  ],\n  'shoutout.chat.waiting': [\n    '⏳ Shoutout für @{displayName} aufgenommen und in die Warteschlange gesetzt.'\n  ],\n  'shoutout.chat.failed': [\n    '⚠️ Shoutout für @{displayName} konnte nicht gestartet werden.'\n  ],\n  'shoutout.chat.duplicate': [\n    '⚠️ @{displayName} hatte in diesem Stream bereits einen Shoutout. Nutze !so @{login} --force, wenn du ihn trotzdem einreihen möchtest.'\n  ],\n  'shoutout.auto.greeting': [\n    '👋 @{displayName} ist im Altersheim eingetroffen. Die Pfleger schieben direkt mal den Shouti-Wagen los.',\n    '🧓 Achtung, @{displayName} hat sich an der Rezeption gemeldet. Zeit für einen ordentlichen Shouti aus dem CGN-Altersheim.',\n    '📺 @{displayName} ist da und hat genug Lebenszeichen gesendet. Der AutoShouti wird aus dem Rentner-Regal geholt.',\n    '💜 Willkommen @{displayName}! Die CGN-Rentnercrew startet schon mal den Shouti-Rollator.',\n    '☕ @{displayName} hat sich blicken lassen. Kaffee steht bereit, Shouti wird angeschoben.'\n  ],\n  'shoutout.auto.queued': [\n    '📺 @{displayName} wurde der Shoutout-Warteliste hinzugefügt. Wartezeit: ca. {waitTime}.'\n  ],\n  'shoutout.auto.alreadyQueued': [\n    '⏳ @{displayName} steht bereits auf der Shoutout-Warteliste. Wartezeit: ca. {waitTime}.'\n  ],\n  'shoutout.auto.alreadyReceived': [\n    '✅ @{displayName} hat bereits einen Shouti erhalten.'\n  ],\n  'shoutout.auto.cooldown': [\n    '⏳ @{displayName} ist im Auto-SO-Cooldown. Nächster Versuch in ca. {waitTime}.'\n  ],\n  'shoutout.auto.waitingStartScene': [\n    '⏳ @{displayName} ist eingetragen. Shoutout wartet bis nach der Start-Szene. Wartezeit: ca. {waitTime}.'\n  ],\n  'shoutout.auto.disabled': [\n    'ℹ️ Auto-Shoutouts sind aktuell deaktiviert.'\n  ],\n  'shoutout.official.queued': [\n    '⏳ Offizieller Shoutout für @{displayName} ist vorgemerkt und wird nach dem Cooldown gesendet.'\n  ],\n  'shoutout.official.failed': [\n    '⚠️ Offizieller Shoutout für @{displayName} konnte nicht gesendet werden.'\n  ],\n  'shoutout.system.textsSaved': [\n    'Shoutout-Texte gespeichert.'\n  ]\n};",
    "after": "const SHOUTOUT_TEXT_DEFAULTS = {\n  'shoutout.chat.accepted': [\n    \"📼 Die Heimleitung hat @{displayName} in den Sendeplan aufgenommen.\",\n    \"🎬 @{displayName} wurde fürs CGN-Altersheimkino vorgemerkt.\",\n    \"📺 Programmänderung bestätigt: @{displayName} kommt ins Heimkino.\",\n    \"💿 Die DVD von @{displayName} liegt bereit. Die Vorstellung wird vorbereitet.\",\n    \"🎞️ @{displayName} steht jetzt auf dem Kinoplan der Heimleitung.\"\n],\n  'shoutout.chat.waiting': [\n    \"⏳ @{displayName} steht im Sendeplan und wartet auf freie Leinwand.\",\n    \"📼 Die VHS von @{displayName} liegt bereit, muss aber noch warten.\",\n    \"🎬 @{displayName} wartet im Vorführraum des CGN-Altersheimkinos.\",\n    \"📺 Der TV-Raum ist noch belegt. @{displayName} kommt gleich dran.\",\n    \"💿 @{displayName} wurde eingelegt, aber der alte Beamer braucht noch einen Moment.\"\n],\n  'shoutout.chat.failed': [\n    \"⚠️ Die Heimleitung meldet: Die Vorführung von @{displayName} konnte nicht gestartet werden.\",\n    \"📼 Bandsalat! Der Shoutout für @{displayName} ist gerade hängen geblieben.\",\n    \"🎬 Der alte Beamer streikt. @{displayName} konnte nicht gezeigt werden.\",\n    \"📺 Die Heimaufsicht findet den richtigen Eingang nicht. @{displayName} startet gerade nicht.\",\n    \"💿 Die DVD von @{displayName} wird nicht gelesen. Vorführung fehlgeschlagen.\"\n],\n  'shoutout.chat.duplicate': [\n    \"📼 @{displayName} lief heute schon im Altersheimkino. Wiederholung nur mit --force.\",\n    \"🚨 Heimaufsicht sagt: @{displayName} war heute bereits im Programm. Extra-Vorführung nur mit --force.\",\n    \"🎞️ Die Leinwand kennt @{displayName} heute schon. Wiederholung nur mit Sondergenehmigung: --force.\",\n    \"📋 Im Sendeplan steht: @{displayName} hatte heute schon Ausstrahlung. Noch mal nur mit --force.\",\n    \"📺 @{displayName} war heute schon auf dem großen Bildschirm. Für die Wiederholung bitte --force nutzen.\"\n],\n  'shoutout.auto.greeting': [\n    \"📼 Die Heimleitung hat die VHS von @{displayName} gefunden. Der alte Beamer wird angeworfen.\",\n    \"🎬 Im CGN-Altersheimkino läuft der Beamer von anno dazumal warm. Gleich auf der Leinwand: @{displayName}.\",\n    \"🧓 Die Rentnercrew sitzt schon im Kinosaal. Die Heimaufsicht stellt noch das Bild von @{displayName} scharf.\",\n    \"💿 Die DVD von @{displayName} wurde vorsichtig aus der Hülle genommen. Vorstellung beginnt gleich.\",\n    \"📺 Programmänderung im CGN-Altersheim: @{displayName} kommt auf den großen Bildschirm.\"\n],\n  'shoutout.auto.queued': [\n    \"📋 @{displayName} wurde in den Kinoplan eingetragen. Wartezeit: ca. {waitTime}.\",\n    \"📼 Die VHS von @{displayName} liegt auf dem Wagen. Vorstellung in ca. {waitTime}.\",\n    \"🎬 @{displayName} steht im Vorführplan. Der Beamer braucht noch ca. {waitTime}.\",\n    \"📺 Der Fernsehraum wird vorbereitet. @{displayName} läuft in ca. {waitTime}.\",\n    \"💿 Die DVD von @{displayName} ist vorgemerkt. Sendestart in ca. {waitTime}.\"\n],\n  'shoutout.auto.alreadyQueued': [\n    \"⏳ @{displayName} steht bereits im Kinoplan. Wartezeit: ca. {waitTime}.\",\n    \"📋 Die Heimleitung hat @{displayName} schon auf der Liste. Noch ca. {waitTime}.\",\n    \"📼 Die VHS von @{displayName} liegt bereits bereit. Vorstellung in ca. {waitTime}.\",\n    \"🎬 @{displayName} wartet schon im Vorführraum. Der Beamer ist noch nicht frei.\",\n    \"📺 @{displayName} ist schon fürs Heimkino vorgemerkt. Bitte im TV-Raum Platz nehmen.\"\n],\n  'shoutout.auto.alreadyReceived': [\n    \"✅ @{displayName} hatte heute schon eine Vorstellung im CGN-Altersheimkino.\",\n    \"📼 Die VHS von @{displayName} wurde heute bereits abgespielt.\",\n    \"🎬 @{displayName} lief heute schon auf der großen Leinwand.\",\n    \"📺 @{displayName} war heute bereits im Altersheim-TV zu sehen.\",\n    \"📋 Die Heimaufsicht bestätigt: @{displayName} steht heute schon als gezeigt im Sendeplan.\"\n],\n  'shoutout.auto.cooldown': [\n    \"⏳ Die Heimleitung sagt: @{displayName} muss noch ca. {waitTime} auf die nächste Ausstrahlung warten.\",\n    \"📼 Die VHS von @{displayName} steckt noch im Rückspulmodus. Nächster Versuch in ca. {waitTime}.\",\n    \"🎬 Der alte Beamer braucht Pause. @{displayName} kann in ca. {waitTime} wieder gezeigt werden.\",\n    \"📺 Der TV-Raum ist im Ruhemodus. @{displayName} darf in ca. {waitTime} wieder ins Programm.\",\n    \"💿 Die DVD von @{displayName} liegt auf Wiedervorlage. Noch ca. {waitTime}.\"\n],\n  'shoutout.auto.waitingStartScene': [\n    \"🎬 @{displayName} steht bereit, aber der Vorhang bleibt bis nach der Start-Szene zu.\",\n    \"📺 Der Fernseher läuft noch im Startprogramm. @{displayName} kommt danach dran.\",\n    \"📼 Die VHS von @{displayName} ist eingelegt. Abgespielt wird nach der Start-Szene.\",\n    \"🧓 Die Rentnercrew sitzt schon, aber die Heimaufsicht startet den Film erst nach dem Streamstart.\",\n    \"🎞️ Der Beamer ist warm, die Leinwand hängt. @{displayName} wartet nur noch auf das Ende der Start-Szene.\"\n],\n  'shoutout.auto.disabled': [\n    \"ℹ️ Die Heimleitung hat das Altersheimkino aktuell geschlossen.\",\n    \"📺 Das CGN-TV-Programm ist gerade pausiert. Auto-Shoutouts sind aus.\",\n    \"📼 Der VHS-Wagen bleibt heute stehen. Auto-Shoutouts sind deaktiviert.\",\n    \"🎬 Der Beamer von anno dazumal ist aus. Auto-Shoutouts laufen gerade nicht.\",\n    \"🚪 Der Kinosaal ist abgeschlossen. Die Heimaufsicht hat Auto-Shoutouts deaktiviert.\"\n],\n  'shoutout.official.queued': [\n    \"⏳ Der offizielle Twitch-Shoutout für @{displayName} wurde in den Sendeplan der Heimleitung eingetragen.\",\n    \"📋 Heimleitung meldet: Offizieller Shoutout für @{displayName} ist vorgemerkt.\",\n    \"📺 @{displayName} steht für den offiziellen Twitch-Sendeplatz bereit.\",\n    \"🎬 Der offizielle Shoutout für @{displayName} wartet auf seinen Platz im Programm.\",\n    \"📼 Die Heimaufsicht hat @{displayName} für den offiziellen Shoutout notiert.\"\n],\n  'shoutout.official.failed': [\n    \"⚠️ Der offizielle Twitch-Shoutout für @{displayName} konnte nicht gesendet werden.\",\n    \"📺 Die Heimleitung meldet Störung im offiziellen Twitch-Programm für @{displayName}.\",\n    \"🎬 Der offizielle Sendeplatz für @{displayName} ist gerade ausgefallen.\",\n    \"📼 Die Heimaufsicht hat es versucht, aber Twitch wollte @{displayName} gerade nicht senden.\",\n    \"💿 Der offizielle Shoutout für @{displayName} konnte nicht abgespielt werden.\"\n],\n  'shoutout.system.textsSaved': [\n    \"💾 Die Heimleitung hat den neuen Sendeplan gespeichert.\",\n    \"📋 Die Textmappe der Heimaufsicht wurde aktualisiert.\",\n    \"📼 Die neuen VHS-Beschriftungen wurden sauber einsortiert.\",\n    \"✅ Die Shoutout-Texte wurden im CGN-Altersheim archiviert.\",\n    \"🎬 Programmheft gespeichert. Die nächste Vorstellung kann kommen.\"\n]\n};"
  },
  {
    "label": "render helper",
    "before": "function renderAutoModuleText(key, vars = {}, options = {}) {\n  const displayName = cleanDisplay(vars.displayName || vars.login || '', vars.login || '');\n  const context = { ...vars, displayName, user: displayName, username: vars.login || '' };\n  const rendered = textHelper.renderModuleText(MODULE_NAME, key, AUTO_SHOUTOUT_TEXT_DEFAULTS, context, {\n    ...AUTO_SHOUTOUT_TEXT_OPTIONS,\n    ...(options || {})\n  });\n  return renderAutoMessage(rendered, { ...vars, displayName });\n}\n\nasync function sendAutoGreetingNotice(acfg, vars = {}, cfg = null) {",
    "after": "function renderAutoModuleText(key, vars = {}, options = {}) {\n  const displayName = cleanDisplay(vars.displayName || vars.login || '', vars.login || '');\n  const context = { ...vars, displayName, user: displayName, username: vars.login || '' };\n  const rendered = textHelper.renderModuleText(MODULE_NAME, key, AUTO_SHOUTOUT_TEXT_DEFAULTS, context, {\n    ...AUTO_SHOUTOUT_TEXT_OPTIONS,\n    ...(options || {})\n  });\n  return renderAutoMessage(rendered, { ...vars, displayName });\n}\n\nfunction renderShoutoutModuleText(key, vars = {}, options = {}) {\n  const displayName = cleanDisplay(vars.displayName || vars.targetDisplay || vars.login || '', vars.login || '');\n  const context = {\n    ...vars,\n    displayName,\n    user: displayName,\n    username: vars.login || vars.targetLogin || '',\n    targetLogin: vars.targetLogin || vars.login || '',\n    login: vars.login || vars.targetLogin || ''\n  };\n  const rendered = textHelper.renderModuleText(MODULE_NAME, key, SHOUTOUT_TEXT_DEFAULTS, context, {\n    ...SHOUTOUT_TEXT_OPTIONS,\n    ...(options || {})\n  });\n  return renderAutoMessage(rendered, { ...vars, displayName, login: context.login });\n}\n\nfunction autoNoticeTextKey(key) {\n  const map = {\n    queued: 'shoutout.auto.queued',\n    alreadyQueued: 'shoutout.auto.alreadyQueued',\n    alreadyReceived: 'shoutout.auto.alreadyReceived',\n    cooldown: 'shoutout.auto.cooldown',\n    waitingStartScene: 'shoutout.auto.waitingStartScene',\n    disabled: 'shoutout.auto.disabled'\n  };\n  return map[key] || `shoutout.auto.${key}`;\n}\n\nasync function sendAutoGreetingNotice(acfg, vars = {}, cfg = null) {"
  },
  {
    "label": "auto notice runtime",
    "before": "async function sendAutoChatNotice(acfg, key, vars = {}, cfg = null) {\n  if (!acfg || acfg.sendChatMessage === false) return false;\n  if (shouldSuppressAutoChatNotice(key, vars)) return false;\n  const messages = normalizeAutoMessages(acfg.messages || {}, acfg || {});\n  const template = messages[key] || acfg[`${key}Message`] || '';\n  const msg = renderAutoMessage(template, vars);\n  if (!msg) return false;\n  await sendChatMessage(msg, { targetLogin: vars.login, autoShoutout: true, reason: vars.reason || key });\n  return true;\n}",
    "after": "async function sendAutoChatNotice(acfg, key, vars = {}, cfg = null) {\n  if (!acfg || acfg.sendChatMessage === false) return false;\n  if (shouldSuppressAutoChatNotice(key, vars)) return false;\n  const textKey = autoNoticeTextKey(key);\n  let msg = renderShoutoutModuleText(textKey, vars);\n  if (!msg) {\n    const messages = normalizeAutoMessages(acfg.messages || {}, acfg || {});\n    const template = messages[key] || acfg[`${key}Message`] || '';\n    msg = renderAutoMessage(template, vars);\n  }\n  if (!msg) return false;\n  await sendChatMessage(msg, { targetLogin: vars.login, autoShoutout: true, reason: vars.reason || key, textKey });\n  return true;\n}"
  },
  {
    "label": "duplicate text runtime",
    "before": "      const message = renderTemplate(firstString(scfg.duplicateMessage), vars).trim();\n      if (message) await sendChatMessage(message, { targetLogin, streamDayId: streamDay.streamDayId, duplicate: true });",
    "after": "      const message = renderShoutoutModuleText('shoutout.chat.duplicate', vars) || renderTemplate(firstString(scfg.duplicateMessage), vars).trim();\n      if (message) await sendChatMessage(message, { targetLogin, streamDayId: streamDay.streamDayId, duplicate: true, textKey: 'shoutout.chat.duplicate' });"
  },
  {
    "label": "display queue chat runtime",
    "before": "    if (dcfg.sendChatMessages !== false) {\n      const queue = listDisplayQueue(200);\n      const pendingBeforeThis = queue.filter(row => Number(row.id || 0) < Number(queueResult.row?.id || 0) && ['queued','waiting','active'].includes(row.status)).length;\n      const template = pendingBeforeThis > 0 ? firstString(dcfg.waitingMessage, dcfg.acceptedMessage) : firstString(dcfg.acceptedMessage, DEFAULT_CONFIG.clipShoutout.chatMessage);\n      await sendChatMessage(renderTemplate(template, vars).trim(), { targetLogin, displayQueueId: queueResult.row && queueResult.row.id });\n    }",
    "after": "    if (dcfg.sendChatMessages !== false) {\n      const queue = listDisplayQueue(200);\n      const pendingBeforeThis = queue.filter(row => Number(row.id || 0) < Number(queueResult.row?.id || 0) && ['queued','waiting','active'].includes(row.status)).length;\n      const textKey = pendingBeforeThis > 0 ? 'shoutout.chat.waiting' : 'shoutout.chat.accepted';\n      const template = pendingBeforeThis > 0 ? firstString(dcfg.waitingMessage, dcfg.acceptedMessage) : firstString(dcfg.acceptedMessage, DEFAULT_CONFIG.clipShoutout.chatMessage);\n      const message = renderShoutoutModuleText(textKey, vars) || renderTemplate(template, vars).trim();\n      await sendChatMessage(message, { targetLogin, displayQueueId: queueResult.row && queueResult.row.id, textKey });\n    }"
  },
  {
    "label": "official queued runtime",
    "before": "        if (shouldSendOfficialChatMessages(cfg) && queueResult && queueResult.ok && queueResult.duplicate !== true) {\n          await sendChatMessage(renderTemplate(ocfg.queuedMessage, vars).trim(), { targetLogin: targetUser.login, clipId: clip.id, officialShoutout: true, queueId: queueResult.row && queueResult.row.id });\n        } else if (shouldSendOfficialChatMessages(cfg) && queueResult && queueResult.duplicate === true) {\n          await sendChatMessage(renderTemplate(ocfg.duplicateQueuedMessage, vars).trim(), { targetLogin: targetUser.login, clipId: clip.id, officialShoutout: true });\n        }",
    "after": "        if (shouldSendOfficialChatMessages(cfg) && queueResult && queueResult.ok && queueResult.duplicate !== true) {\n          const message = renderShoutoutModuleText('shoutout.official.queued', vars) || renderTemplate(ocfg.queuedMessage, vars).trim();\n          await sendChatMessage(message, { targetLogin: targetUser.login, clipId: clip.id, officialShoutout: true, queueId: queueResult.row && queueResult.row.id, textKey: 'shoutout.official.queued' });\n        } else if (shouldSendOfficialChatMessages(cfg) && queueResult && queueResult.duplicate === true) {\n          await sendChatMessage(renderTemplate(ocfg.duplicateQueuedMessage, vars).trim(), { targetLogin: targetUser.login, clipId: clip.id, officialShoutout: true });\n        }"
  }
];

let changed = 0;
for (const item of replacements) {
  const label = item.label;
  const before = item.before;
  const after = item.after;

  if (source.includes(after)) {
    console.log('[CAN-44.21.14] Bereits vorhanden:', label);
    continue;
  }

  const count = source.split(before).length - 1;
  if (count !== 1) {
    fail(`Anchor nicht eindeutig für "${label}" gefunden. Treffer: ${count}`);
  }

  source = source.replace(before, after);
  changed += 1;
  console.log('[CAN-44.21.14] Ersetzt:', label);
}

fs.writeFileSync(target, source, 'utf8');

try {
  childProcess.execFileSync(process.execPath, ['-c', target], { stdio: 'inherit' });
  console.log('[CAN-44.21.14] node -c OK:', target);
} catch (err) {
  console.error('[CAN-44.21.14] Syntaxcheck fehlgeschlagen. Backup liegt hier:', backup);
  process.exit(1);
}

console.log('[CAN-44.21.14] Fertig. Geänderte Blöcke:', changed);
console.log('[CAN-44.21.14] Bitte Node/Backend neu starten und danach !so erneut testen.');

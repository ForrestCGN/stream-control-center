# Generated Function Inventory

Generated: 2026-05-02 19:33:30

Hinweis: Statisch aus JS/HTML-Dateien extrahiert. Dient als Projektübersicht, nicht als vollständiger Parser.

## `backend/core/config_loader.js`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 12 | function | `getConfigPath` | `function getConfigPath(fileName) {` |
| 16 | function | `loadConfig` | `function loadConfig(fileName, defaultValue = {}, options = {}) {` |
| 35 | function | `saveConfig` | `function saveConfig(fileName, data, options = {}) {` |
| 43 | function | `loadConfigWithFallback` | `function loadConfigWithFallback(newPath, legacyPath, defaultValue = {}) {` |
| 49 | function | `copyLegacyConfigIfMissing` | `function copyLegacyConfigIfMissing(fileName, legacyPath) {` |

## `backend/core/fs_utils.js`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 11 | function | `exists` | `function exists(filePath) {` |
| 15 | function | `ensureDir` | `function ensureDir(dirPath) {` |
| 22 | function | `ensureParentDir` | `function ensureParentDir(filePath) {` |
| 26 | function | `readText` | `function readText(filePath, fallback = "") {` |
| 35 | function | `writeTextAtomic` | `function writeTextAtomic(filePath, content) {` |
| 43 | function | `readJson` | `function readJson(filePath, fallback = null) {` |
| 54 | function | `writeJsonAtomic` | `function writeJsonAtomic(filePath, data, options = {}) {` |
| 60 | function | `copyIfMissing` | `function copyIfMissing(sourcePath, targetPath) {` |
| 69 | function | `statSafe` | `function statSafe(filePath) {` |
| 77 | function | `listFilesSafe` | `function listFilesSafe(dirPath) {` |

## `backend/core/logger.js`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 17 | function | `enableFileLogging` | `function enableFileLogging(enabled = true) {` |
| 24 | function | `timestamp` | `function timestamp() {` |
| 28 | function | `format` | `function format(level, scope, args) {` |
| 41 | function | `writeLine` | `function writeLine(filePath, line) {` |
| 51 | function | `log` | `function log(level, scope, ...args) {` |
| 62 | function | `createLogger` | `function createLogger(scope) {` |

## `backend/core/paths.js`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 60 | function | `fromRoot` | `function fromRoot(...parts) {` |
| 64 | function | `fromWebroot` | `function fromWebroot(...parts) {` |
| 68 | function | `fromConfig` | `function fromConfig(...parts) {` |
| 72 | function | `fromState` | `function fromState(...parts) {` |
| 76 | function | `fromSecrets` | `function fromSecrets(...parts) {` |

## `backend/core/security.js`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 17 | function | `redactSecrets` | `function redactSecrets(value) {` |
| 47 | function | `safeError` | `function safeError(error) {` |
| 57 | function | `blockInternalPath` | `function blockInternalPath(req, res) {` |

## `backend/core/state_store.js`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 12 | function | `getStatePath` | `function getStatePath(fileName) {` |
| 16 | function | `loadState` | `function loadState(fileName, defaultValue = {}, options = {}) {` |
| 35 | function | `saveState` | `function saveState(fileName, data, options = {}) {` |
| 43 | function | `copyLegacyStateIfMissing` | `function copyLegacyStateIfMissing(fileName, legacyPath) {` |

## `backend/modules/alert_system.js`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 108 | module export | `init` | `module.exports.init = function init(ctx) {` |
| 235 | function | `ensureRuntime` | `function ensureRuntime(ctx) {` |
| 239 | function | `reloadConfig` | `function reloadConfig() {` |
| 247 | function | `ensureDirs` | `function ensureDirs() {` |
| 255 | function | `ensureSchema` | `function ensureSchema() {` |
| 434 | function | `createChatBlocksSchema` | `function createChatBlocksSchema(db) {` |
| 471 | function | `addColumnIfMissing` | `function addColumnIfMissing(db, tableName, columnName, definition) {` |
| 481 | function | `seedDefaults` | `function seedDefaults() {` |
| 524 | function | `seedAlertChatBlocks` | `function seedAlertChatBlocks() {` |
| 552 | function | `buildStatus` | `function buildStatus(req = null) {` |
| 580 | function | `buildHealth` | `function buildHealth(req = null) {` |
| 590 | function | `getAlertCounts` | `function getAlertCounts() {` |
| 611 | function | `buildFfprobeStatus` | `function buildFfprobeStatus() {` |
| 621 | function | `publicConfig` | `function publicConfig() {` |
| 631 | function | `saveAlertConfig` | `function saveAlertConfig(input = {}) {` |
| 664 | function | `checkAlertIntegration` | `function checkAlertIntegration() {` |
| 708 | function | `listTypes` | `function listTypes() {` |
| 712 | function | `listAssets` | `function listAssets() {` |
| 716 | function | `listChatBlocks` | `function listChatBlocks(filter = {}) {` |
| 727 | function | `getChatBlockById` | `function getChatBlockById(idRaw) {` |
| 734 | function | `saveChatBlock` | `function saveChatBlock(input = {}) {` |
| 758 | function | `deleteChatBlock` | `function deleteChatBlock(idRaw) {` |
| 765 | function | `parseChatTexts` | `function parseChatTexts(value) {` |
| 775 | function | `listRules` | `function listRules() {` |
| 786 | function | `saveRule` | `function saveRule(input, silent = false) {` |
| 837 | function | `deleteRule` | `function deleteRule(idRaw) {` |
| 844 | function | `validateRules` | `function validateRules(input) {` |
| 857 | function | `rangesOverlap` | `function rangesOverlap(a, b) {` |
| 865 | function | `createUploadMiddleware` | `function createUploadMiddleware() {` |
| 892 | function | `registerUploadedAsset` | `function registerUploadedAsset(req) {` |
| 927 | function | `deleteAsset` | `function deleteAsset(idRaw, deleteFile) {` |
| 944 | function | `assetUsage` | `function assetUsage(idRaw) {` |
| 954 | function | `scanSoundDurations` | `function scanSoundDurations(input = {}) {` |
| 982 | function | `probeSoundFile` | `function probeSoundFile(filePath) {` |
| 994 | function | `readSettingsRows` | `function readSettingsRows() {` |
| 1002 | function | `getSettings` | `function getSettings() {` |
| 1008 | function | `deepMergePlain` | `function deepMergePlain(base, override) {` |
| 1018 | function | `settingAlias` | `function settingAlias(settings, canonicalKey, ...aliases) {` |
| 1028 | function | `canonicalSettingsKey` | `function canonicalSettingsKey(rawKey) {` |
| 1036 | function | `getRuntimeAlertSettings` | `function getRuntimeAlertSettings() {` |
| 1048 | function | `sanitizeSettingsObject` | `function sanitizeSettingsObject(value) {` |
| 1053 | function | `saveSettings` | `function saveSettings(input) {` |
| 1068 | function | `enqueueFromRequest` | `function enqueueFromRequest(req, broadcastWS, defaultSource) {` |
| 1072 | function | `normalizeAlertPayload` | `function normalizeAlertPayload(input, defaultSource) {` |
| 1093 | function | `enqueueAlert` | `function enqueueAlert(payload, broadcastWS) {` |
| 1098 | function | `enqueueAlertWithRule` | `function enqueueAlertWithRule(payload, rule, broadcastWS, options = {}) {` |
| 1143 | function | `replayAlertEvent` | `function replayAlertEvent(eventUid, broadcastWS) {` |
| 1168 | function | `getRuleById` | `function getRuleById(id) {` |
| 1186 | function | `listDisplayProfiles` | `function listDisplayProfiles(filter = {}) {` |
| 1194 | function | `getDisplayProfileById` | `function getDisplayProfileById(idRaw) {` |
| 1201 | function | `getDefaultDisplayProfile` | `function getDefaultDisplayProfile() {` |
| 1206 | function | `saveDisplayProfile` | `function saveDisplayProfile(input = {}) {` |
| 1226 | function | `deleteDisplayProfile` | `function deleteDisplayProfile(idRaw) {` |
| 1237 | function | `seedDisplayProfiles` | `function seedDisplayProfiles() {` |
| 1247 | function | `defaultDisplaySettings` | `function defaultDisplaySettings() {` |
| 1251 | function | `sanitizeDisplaySettings` | `function sanitizeDisplaySettings(input = {}) {` |
| 1253 | const function | `pick` | `const pick = (v, allowed, fallback) => allowed.includes(String(v \|\| '').toLowerCase()) ? String(v).toLowerCase() : fallback;` |
| 1254 | const function | `color` | `const color = (v, fallback) => /^#[0-9a-f]{6}$/i.test(String(v \|\| '').trim()) ? String(v).trim() : fallback;` |
| 1294 | function | `resolveTopGraphicUrlFromAsset` | `function resolveTopGraphicUrlFromAsset(assetId) {` |
| 1303 | function | `resolveDisplayProfile` | `function resolveDisplayProfile(event, rule = {}) {` |
| 1313 | function | `listTextVariants` | `function listTextVariants(filter = {}) {` |
| 1324 | function | `saveTextVariant` | `function saveTextVariant(input = {}) {` |
| 1356 | function | `deleteTextVariant` | `function deleteTextVariant(idRaw) {` |
| 1363 | function | `listTestPresets` | `function listTestPresets(filter = {}) {` |
| 1374 | function | `getTestPresetById` | `function getTestPresetById(idRaw) {` |
| 1381 | function | `saveTestPreset` | `function saveTestPreset(input = {}) {` |
| 1404 | function | `deleteTestPreset` | `function deleteTestPreset(idRaw) {` |
| 1411 | function | `seedAlertTextVariants` | `function seedAlertTextVariants() {` |
| 1442 | function | `seedAlertTestPresets` | `function seedAlertTestPresets() {` |
| 1456 | function | `findMatchingRule` | `function findMatchingRule(payload) {` |
| 1497 | function | `shouldUseSoundSystemForAlert` | `function shouldUseSoundSystemForAlert(event, overlayAlert) {` |
| 1509 | function | `soundFileFromPublicUrl` | `function soundFileFromPublicUrl(publicUrl) {` |
| 1524 | function | `buildSoundSystemPayload` | `function buildSoundSystemPayload(event, overlayAlert) {` |
| 1561 | function | `postJson` | `function postJson(targetUrl, payload, timeoutMs = 3500) {` |
| 1603 | async function | `processQueue` | `async function processQueue(broadcastWS) {` |
| 1631 | function | `startCurrentFallbackTimer` | `function startCurrentFallbackTimer(event, broadcastWS) {` |
| 1638 | async function | `prepareSoundSyncedAlert` | `async function prepareSoundSyncedAlert(event, overlayAlert, broadcastWS) {` |
| 1664 | function | `finishCurrent` | `function finishCurrent(reason, broadcastWS) {` |
| 1677 | async function | `enrichEventAvatar` | `async function enrichEventAvatar(event) {` |
| 1696 | async function | `resolveTwitchAvatarUrl` | `async function resolveTwitchAvatarUrl(loginRaw) {` |
| 1725 | function | `buildUserinfoUrl` | `function buildUserinfoUrl(base, login) {` |
| 1738 | function | `extractAvatarUrl` | `function extractAvatarUrl(json) {` |
| 1758 | function | `resolveEventCelebration` | `function resolveEventCelebration(event, rule = {}, displaySettings = {}) {` |
| 1773 | function | `buildOverlayAlert` | `function buildOverlayAlert(event) {` |
| 1821 | function | `buildOverlayText` | `function buildOverlayText(event, rule = {}) {` |
| 1847 | function | `buildTemplateContext` | `function buildTemplateContext(event, rule = {}) {` |
| 1884 | function | `selectTextVariant` | `function selectTextVariant(event, rule = {}) {` |
| 1899 | function | `pickWeighted` | `function pickWeighted(rows) {` |
| 1910 | function | `renderTemplate` | `function renderTemplate(template, context) {` |
| 1917 | function | `formatAmount` | `function formatAmount(amount, currency, type, provider) {` |
| 1933 | function | `providerLogoUrl` | `function providerLogoUrl(source, typeKey) {` |
| 1941 | function | `defaultIconUrl` | `function defaultIconUrl(source, typeKey) {` |
| 1950 | function | `fallbackTemplates` | `function fallbackTemplates(event, rule = {}) {` |
| 1964 | function | `persistRenderedAlert` | `function persistRenderedAlert(eventUid, alert) {` |
| 1983 | function | `resolveAlertDurationMs` | `function resolveAlertDurationMs(rule = {}) {` |
| 1992 | function | `buildAlertChatMessage` | `function buildAlertChatMessage(event, rule = {}, context = null) {` |
| 2010 | async function | `dispatchAlertChatMessage` | `async function dispatchAlertChatMessage(event, alert) {` |
| 2059 | function | `saveChatOutbox` | `function saveChatOutbox(event, chat, status) {` |
| 2080 | function | `listChatOutbox` | `function listChatOutbox(filter = {}) {` |
| 2089 | function | `updateChatOutboxStatus` | `function updateChatOutboxStatus(idRaw, status, error) {` |
| 2097 | function | `markChatOutboxSent` | `function markChatOutboxSent(idRaw) {` |
| 2104 | function | `markChatOutboxConsumed` | `function markChatOutboxConsumed(idRaw) {` |
| 2112 | function | `markChatOutboxError` | `function markChatOutboxError(idRaw, input = {}) {` |
| 2120 | function | `updateChatDispatchStatus` | `function updateChatDispatchStatus(eventUid, status, error) {` |
| 2130 | function | `buildTtsPayload` | `function buildTtsPayload(event, rule = {}) {` |
| 2154 | function | `buildDefaultTitle` | `function buildDefaultTitle(event) {` |
| 2163 | function | `sendOverlay` | `function sendOverlay(broadcastWS, payload) {` |
| 2168 | function | `clearQueue` | `function clearQueue(reason) {` |
| 2178 | function | `attachWs` | `function attachWs(wss) {` |
| 2198 | function | `absRoot` | `function absRoot(p) {` |
| 2204 | function | `relRoot` | `function relRoot(p) {` |
| 2208 | function | `imageTargetDir` | `function imageTargetDir(category) {` |
| 2216 | function | `detectAssetType` | `function detectAssetType(mime, hint) {` |
| 2222 | function | `sanitizeFilename` | `function sanitizeFilename(name) {` |
| 2225 | function | `safeExt` | `function safeExt(ext) { return /^[.][a-z0-9]{1,8}$/i.test(ext) ? ext.toLowerCase() : ''; }` |
| 2226 | function | `cleanText` | `function cleanText(v) { return String(v ?? '').trim().slice(0, 500); }` |
| 2227 | function | `validateCelebration` | `function validateCelebration(value) {` |
| 2231 | function | `normalizeCelebrationAlias` | `function normalizeCelebrationAlias(value) {` |
| 2240 | function | `cleanTemplate` | `function cleanTemplate(v) { return String(v ?? '').trim().slice(0, 1200); }` |
| 2241 | function | `boolish` | `function boolish(v, fallback) { if (v === undefined \|\| v === null \|\| v === '') return !!fallback; return v === true \|\| v === 1 \|\| v === '1' \|\| v === 'true' \|\| v === 'on'; }` |
| 2242 | function | `validateMessageMode` | `function validateMessageMode(v) { const mode = cleanKey(v \|\| 'auto'); return ['auto','always','never'].includes(mode) ? mode : 'auto'; }` |
| 2243 | function | `cleanKey` | `function cleanKey(v) { return String(v ?? '').trim().toLowerCase().replace(/[^a-z0-9_.-]+/g, '_').replace(/^_+\|_+$/g, '').slice(0, 80); }` |
| 2244 | function | `toInt` | `function toInt(v, fallback) { const n = Number.parseInt(v, 10); return Number.isFinite(n) ? n : fallback; }` |
| 2245 | function | `nullableInt` | `function nullableInt(v) { if (v === '' \|\| v === null \|\| v === undefined) return null; const n = Number.parseInt(v, 10); return Number.isFinite(n) && n > 0 ? n : null; }` |
| 2246 | function | `nullableNumber` | `function nullableNumber(v) { if (v === '' \|\| v === null \|\| v === undefined) return null; const n = Number(v); return Number.isFinite(n) ? n : null; }` |
| 2247 | function | `clamp` | `function clamp(n, min, max) { return Math.min(max, Math.max(min, n)); }` |
| 2248 | function | `boolInt` | `function boolInt(v, fallback) { if (v === undefined \|\| v === null \|\| v === '') return fallback ? 1 : 0; return (v === true \|\| v === 1 \|\| v === '1' \|\| v === 'true' \|\| v === 'on') ? 1 : 0; }` |
| 2249 | function | `parseJson` | `function parseJson(v, fallback) { try { return JSON.parse(v \|\| ''); } catch (_) { return fallback; } }` |
| 2250 | function | `nowIso` | `function nowIso() { return new Date().toISOString(); }` |
| 2251 | function | `makeEventUid` | `function makeEventUid() { return \`al_${Date.now()}_${Math.random().toString(16).slice(2, 10)}\`; }` |
| 2252 | function | `validateImageMode` | `function validateImageMode(v) { const mode = cleanKey(v \|\| 'none'); return state.config.allowedImageModes.includes(mode) ? mode : 'none'; }` |
| 2253 | function | `validateTtsTiming` | `function validateTtsTiming(v) { const mode = cleanKey(v \|\| 'after_alert'); return ['after_alert', 'during_alert', 'before_alert'].includes(mode) ? mode : 'after_alert'; }` |
| 2254 | function | `validateTtsMode` | `function validateTtsMode(v) { const mode = cleanKey(v \|\| 'audio_only'); return ['audio_only', 'overlay'].includes(mode) ? mode : 'audio_only'; }` |

## `backend/modules/challenge.js`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 119 | module export | `init` | `module.exports.init = function init(ctx) {` |
| 177 | function | `loadRuntime` | `function loadRuntime() {` |
| 183 | function | `loadJsonFromConfig` | `function loadJsonFromConfig(parts, fallback) {` |
| 210 | function | `unwrapLoadedConfig` | `function unwrapLoadedConfig(value) {` |
| 219 | function | `mergeDefaults` | `function mergeDefaults(fallback, loaded) {` |
| 235 | function | `clone` | `function clone(value) {` |
| 239 | function | `handleStart` | `function handleStart(req, res) {` |
| 311 | function | `handleStatus` | `function handleStatus(req, res) {` |
| 342 | function | `handleRemoveNext` | `function handleRemoveNext(req, res) {` |
| 358 | function | `handleReset` | `function handleReset(req, res) {` |
| 374 | function | `handleReload` | `function handleReload(req, res) {` |
| 389 | function | `handleStats` | `function handleStats(req, res) {` |
| 438 | function | `handleStatsTop` | `function handleStatsTop(req, res) {` |
| 486 | function | `handleStatsUser` | `function handleStatsUser(req, res) {` |
| 516 | function | `tickRuntime` | `function tickRuntime() {` |
| 530 | function | `finishActive` | `function finishActive(reason) {` |
| 553 | function | `scheduleNextFromQueue` | `function scheduleNextFromQueue() {` |
| 579 | function | `startNextFromQueue` | `function startNextFromQueue() {` |
| 585 | function | `clearNextStartTimer` | `function clearNextStartTimer() {` |
| 594 | function | `startEntry` | `function startEntry(entry, source) {` |
| 618 | function | `createEntry` | `function createEntry(modeId, mode, user, duration) {` |
| 634 | function | `normalizeMode` | `function normalizeMode(raw) {` |
| 652 | function | `snapshot` | `function snapshot(event) {` |
| 670 | function | `publicChallenge` | `function publicChallenge(entry) {` |
| 693 | function | `broadcastChallengeStarted` | `function broadcastChallengeStarted(entry, chatMessage) {` |
| 713 | function | `broadcastStatus` | `function broadcastStatus(event, extra = {}) {` |
| 723 | function | `broadcast` | `function broadcast(obj) {` |
| 743 | function | `getStatsEnabled` | `function getStatsEnabled() {` |
| 751 | function | `ensureStatsSchema` | `function ensureStatsSchema() {` |
| 795 | function | `recordChallengeStat` | `function recordChallengeStat(eventType, entry) {` |
| 854 | function | `dbRun` | `function dbRun(sql, params = []) {` |
| 864 | function | `dbAll` | `function dbAll(sql, params = []) {` |
| 876 | function | `dbGet` | `function dbGet(sql, params = []) {` |
| 888 | function | `normalizeUserKey` | `function normalizeUserKey(value) {` |
| 896 | function | `getDelayBetweenChallengesMs` | `function getDelayBetweenChallengesMs() {` |
| 907 | function | `getChatBool` | `function getChatBool(key, fallback) {` |
| 921 | function | `sendTwitchChatMessage` | `function sendTwitchChatMessage(message, event, entry) {` |
| 948 | function | `playDiscordSoundFor` | `function playDiscordSoundFor(entry) {` |
| 972 | function | `pickMessage` | `function pickMessage(pathParts, context) {` |
| 985 | function | `render` | `function render(template, context) {` |
| 999 | function | `placeholders` | `function placeholders(entry, extra = {}) {` |
| 1014 | function | `formatDuration` | `function formatDuration(seconds) {` |
| 1023 | function | `respond` | `function respond(req, res, status, payload) {` |
| 1032 | function | `getParam` | `function getParam(req, name, fallback) {` |
| 1042 | function | `positiveInt` | `function positiveInt(value, fallback) {` |
| 1052 | function | `cleanUser` | `function cleanUser(value) {` |
| 1057 | function | `truthy` | `function truthy(value) {` |
| 1061 | function | `touch` | `function touch(event) {` |
| 1066 | function | `registerGet` | `function registerGet(appRef, path, handler) {` |
| 1076 | function | `registerPost` | `function registerPost(appRef, path, handler) {` |

## `backend/modules/clips.js`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 14 | module export | `init` | `module.exports.init = function init(ctx) {` |
| 24 | function | `loadClipConfig` | `function loadClipConfig() {` |
| 53 | function | `loadDiscordChannels` | `function loadDiscordChannels() {` |
| 57 | function | `loadClipMessages` | `function loadClipMessages(cfg) {` |
| 61 | async function | `loadChannelInfoFromApi` | `async function loadChannelInfoFromApi(cfg) {` |
| 111 | function | `buildClipTitle` | `function buildClipTitle(input, cfg, channelInfo) {` |
| 141 | function | `publicMessages` | `function publicMessages(messages) {` |
| 154 | function | `publicClipRuntimeConfig` | `function publicClipRuntimeConfig(cfg) {` |
| 271 | function | `handleClipRegister` | `function handleClipRegister(req, res, source, method) {` |
| 325 | function | `resolveRootDir` | `function resolveRootDir(ctx, env) {` |
| 343 | function | `resolveMaybeAbsolute` | `function resolveMaybeAbsolute(rootDir, value) {` |
| 349 | function | `readJsonSafe` | `function readJsonSafe(filePath, fallback) {` |
| 361 | function | `firstString` | `function firstString(...values) {` |
| 370 | function | `toInt` | `function toInt(value, fallback, min, max) {` |
| 378 | function | `extractCustomTitle` | `function extractCustomTitle(rawInput) {` |
| 386 | function | `sanitizeOneLine` | `function sanitizeOneLine(value) {` |
| 393 | function | `messageContent` | `function messageContent(messages, key) {` |
| 399 | function | `appendQuery` | `function appendQuery(baseUrl, params) {` |
| 411 | function | `httpJsonGet` | `function httpJsonGet(url, timeoutMs) {` |

## `backend/modules/credits.js`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 7 | module export | `init` | `module.exports.init = function init(ctx) {` |

## `backend/modules/dashboard_controlcenter.js`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 12 | function | `readJsonSafe` | `function readJsonSafe(filePath, fallback) {` |
| 21 | function | `resolveConfigDir` | `function resolveConfigDir(options = {}) {` |
| 27 | function | `register` | `function register(app, options = {}) {` |
| 30 | function | `cfg` | `function cfg(name, fallback) {` |

## `backend/modules/deathcounter_v2.js`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 14 | module export | `init` | `module.exports.init = function init(ctx) {` |
| 744 | function | `ensureStateFile` | `function ensureStateFile() {` |
| 776 | function | `readState` | `function readState() {` |
| 792 | function | `updateState` | `function updateState(mutator) {` |
| 800 | function | `setOverlayVisibility` | `function setOverlayVisibility(visible) {` |
| 809 | function | `setCurrentGame` | `function setCurrentGame(game) {` |
| 822 | function | `createEmptyState` | `function createEmptyState() {` |
| 840 | function | `createPlayer` | `function createPlayer({ displayName, login, active = true, sortOrder = 1, currentGame = DEFAULT_GAME_KEY }) {` |
| 861 | function | `sanitizePlayer` | `function sanitizePlayer(player) {` |
| 885 | function | `normalizeOverlay` | `function normalizeOverlay(overlay) {` |
| 895 | function | `normalizeGameName` | `function normalizeGameName(value) {` |
| 900 | function | `ensureGameBucketsForAllPlayers` | `function ensureGameBucketsForAllPlayers(players, game) {` |
| 904 | function | `ensureGameStats` | `function ensureGameStats(player, game) {` |
| 912 | function | `recalcAggregates` | `function recalcAggregates(player) {` |
| 925 | function | `clampStats` | `function clampStats(player) {` |
| 934 | function | `syncOverlayLists` | `function syncOverlayLists(state) {` |
| 965 | function | `maybeTrackExtraPlayer` | `function maybeTrackExtraPlayer(state, player) {` |
| 976 | function | `getDefaultSelectedPlayers` | `function getDefaultSelectedPlayers(players) {` |
| 986 | function | `publicState` | `function publicState(state) {` |
| 995 | function | `publicOverlay` | `function publicOverlay(state) {` |
| 1007 | function | `publicPlayer` | `function publicPlayer(player) {` |
| 1023 | function | `summarizePlayer` | `function summarizePlayer(player, game) {` |
| 1046 | async function | `resolvePlayerReference` | `async function resolvePlayerReference(players, rawInput) {` |
| 1072 | async function | `lookupTwitchUserByName` | `async function lookupTwitchUserByName(rawInput) {` |
| 1099 | function | `buildTodeSummary` | `function buildTodeSummary(state) {` |
| 1134 | function | `buildTodePlayerDetail` | `function buildTodePlayerDetail(state, player) {` |
| 1150 | function | `findPlayerStrict` | `function findPlayerStrict(players, rawInput) {` |
| 1162 | function | `findPlayerOrThrow` | `function findPlayerOrThrow(players, rawInput) {` |
| 1170 | function | `sortPlayers` | `function sortPlayers(players) {` |
| 1179 | function | `migrateLegacyToV2` | `function migrateLegacyToV2(legacy) {` |
| 1220 | function | `broadcastState` | `function broadcastState(ctx, state, event) {` |
| 1230 | function | `fetchJson` | `function fetchJson(rawUrl) {` |
| 1261 | function | `ok` | `function ok(payload) {` |
| 1265 | function | `fail` | `function fail(error) {` |
| 1269 | function | `readJSON` | `function readJSON(file, fallback) {` |
| 1273 | function | `writeJSON` | `function writeJSON(file, value) {` |
| 1277 | function | `ensureDir` | `function ensureDir(dir) {` |
| 1281 | function | `bodyOrQuery` | `function bodyOrQuery(req, key) {` |
| 1285 | function | `requiredString` | `function requiredString(value, message) {` |
| 1291 | function | `stringOrDefault` | `function stringOrDefault(value, fallback) {` |
| 1296 | function | `intOrDefault` | `function intOrDefault(value, fallback) {` |
| 1300 | function | `booleanOrDefault` | `function booleanOrDefault(value, fallback) {` |
| 1304 | function | `normalizePlayerListInput` | `function normalizePlayerListInput(raw) {` |
| 1311 | function | `stripAtPrefix` | `function stripAtPrefix(value) {` |
| 1315 | function | `cleanLogin` | `function cleanLogin(value) {` |

## `backend/modules/diagnostics.js`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 5 | module export | `init` | `module.exports.init = function init(ctx) {` |

## `backend/modules/discord.js`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 32 | function | `readToolsConfig` | `function readToolsConfig() {` |
| 50 | function | `normalizeToolPath` | `function normalizeToolPath(value) {` |
| 56 | function | `getFfmpegCandidates` | `function getFfmpegCandidates() {` |
| 71 | function | `configureFfmpegPath` | `function configureFfmpegPath() {` |
| 108 | function | `getFfmpegSummary` | `function getFfmpegSummary() {` |
| 109 | const function | `pathParts` | `const pathParts = (process.env.PATH \|\| '').split(path.delimiter).filter(Boolean);` |
| 162 | function | `nowIso` | `function nowIso() {` |
| 166 | function | `authOk` | `function authOk(req) {` |
| 171 | function | `jsonForbidden` | `function jsonForbidden(res) {` |
| 175 | function | `safeString` | `function safeString(value) {` |
| 179 | function | `normalizeContent` | `function normalizeContent(value) {` |
| 183 | function | `truncateDiscordName` | `function truncateDiscordName(value, maxLen = 80) {` |
| 187 | function | `cleanAllowedMentions` | `function cleanAllowedMentions(value) {` |
| 208 | function | `buildDiscordPayload` | `function buildDiscordPayload({ content, embeds, allowedMentions }) {` |
| 232 | function | `ensureGuildAudioState` | `function ensureGuildAudioState(guildId) {` |
| 250 | function | `resolveMediaFile` | `function resolveMediaFile(key) {` |
| 261 | async function | `connectToVoiceChannel` | `async function connectToVoiceChannel(guild, channelId) {` |
| 273 | function | `clearIdleTimer` | `function clearIdleTimer(guildId) {` |
| 281 | function | `scheduleIdleLeave` | `function scheduleIdleLeave(guildId) {` |
| 299 | function | `getConnectionSummary` | `function getConnectionSummary(guildId) {` |
| 308 | function | `getAudioStateSummary` | `function getAudioStateSummary(guildId = GUILD_ID) {` |
| 341 | function | `resetGuildAudioState` | `function resetGuildAudioState(guildId = GUILD_ID, options = {}) {` |
| 353 | function | `ensurePlayerCanStart` | `function ensurePlayerCanStart(guildId) {` |
| 363 | function | `playNext` | `function playNext(guild) {` |
| 400 | function | `attachAudioHandlers` | `function attachAudioHandlers(guild) {` |
| 423 | async function | `joinConfiguredVoiceChannel` | `async function joinConfiguredVoiceChannel(channelId = DEFAULT_VOICE_CHANNEL_ID) {` |
| 443 | async function | `leaveVoiceChannel` | `async function leaveVoiceChannel(guildId = GUILD_ID) {` |
| 453 | async function | `enqueueSound` | `async function enqueueSound(soundKey, channelId = DEFAULT_VOICE_CHANNEL_ID) {` |
| 490 | function | `listAvailableSounds` | `function listAvailableSounds() {` |
| 508 | async function | `fetchTextChannel` | `async function fetchTextChannel(channelId) {` |
| 522 | async function | `postToChannel` | `async function postToChannel({ channelId, content, embeds, allowedMentions }) {` |
| 536 | async function | `postToWebhook` | `async function postToWebhook({ webhookUrl, username, avatarUrl, content, embeds, allowedMentions }) {` |
| 569 | async function | `postMessage` | `async function postMessage({ mode, channelId, webhookUrl, username, avatarUrl, content, embeds, allowedMentions }) {` |
| 583 | function | `buildStatus` | `function buildStatus() {` |
| 599 | function | `getBridgeService` | `function getBridgeService() {` |
| 606 | function | `registerRoutes` | `function registerRoutes(app) {` |
| 622 | async function | `handleQueueClear` | `async function handleQueueClear(_req, res) {` |
| 634 | async function | `handleJoin` | `async function handleJoin(req, res) {` |
| 643 | async function | `handleLeave` | `async function handleLeave(req, res) {` |
| 652 | async function | `handlePlay` | `async function handlePlay(req, res) {` |
| 736 | function | `createDiscordClient` | `function createDiscordClient() {` |
| 745 | async function | `loginDiscord` | `async function loginDiscord() {` |
| 785 | function | `init` | `function init(ctx) {` |

## `backend/modules/fireworks_api.js`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 4 | module export | `init` | `module.exports.init = function init(ctx) {` |
| 7 | function | `clampInt` | `function clampInt(v, min, max, fallback) {` |
| 13 | function | `normMode` | `function normMode(m) {` |

## `backend/modules/helpers/helper_config.js`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 7 | function | `cleanValue` | `function cleanValue(value) {` |
| 12 | function | `getEnv` | `function getEnv(name, fallback = '') {` |
| 18 | function | `requireEnv` | `function requireEnv(name) {` |
| 24 | function | `normalizeDir` | `function normalizeDir(inputPath) {` |
| 28 | function | `resolveFrom` | `function resolveFrom(basePath, ...parts) {` |
| 34 | function | `findProjectRoot` | `function findProjectRoot() {` |
| 53 | function | `getRootDir` | `function getRootDir() {` |
| 57 | function | `getWebrootDir` | `function getWebrootDir() {` |
| 61 | function | `getScriptsDir` | `function getScriptsDir() {` |
| 65 | function | `getModulesDir` | `function getModulesDir() {` |
| 69 | function | `getHelpersDir` | `function getHelpersDir() {` |
| 73 | function | `getDataDir` | `function getDataDir() {` |
| 77 | function | `getConfigDir` | `function getConfigDir() {` |
| 81 | function | `getAssetsDir` | `function getAssetsDir() {` |
| 85 | function | `getSoundsDir` | `function getSoundsDir() {` |
| 89 | function | `getTokensDir` | `function getTokensDir() {` |
| 93 | function | `getOverlaysDir` | `function getOverlaysDir() {` |
| 97 | function | `getLogsDir` | `function getLogsDir() {` |
| 101 | function | `getTempDir` | `function getTempDir() {` |
| 105 | function | `getSecretsDir` | `function getSecretsDir() {` |
| 109 | function | `resolveFromRoot` | `function resolveFromRoot(...parts) { return resolveFrom(getRootDir(), ...parts); }` |
| 110 | function | `resolveFromWebroot` | `function resolveFromWebroot(...parts) { return resolveFrom(getWebrootDir(), ...parts); }` |
| 111 | function | `resolveFromScripts` | `function resolveFromScripts(...parts) { return resolveFrom(getScriptsDir(), ...parts); }` |
| 112 | function | `resolveFromModules` | `function resolveFromModules(...parts) { return resolveFrom(getModulesDir(), ...parts); }` |
| 113 | function | `resolveFromData` | `function resolveFromData(...parts) { return resolveFrom(getDataDir(), ...parts); }` |
| 114 | function | `resolveFromConfig` | `function resolveFromConfig(...parts) { return resolveFrom(getConfigDir(), ...parts); }` |
| 115 | function | `resolveFromAssets` | `function resolveFromAssets(...parts) { return resolveFrom(getAssetsDir(), ...parts); }` |
| 116 | function | `resolveFromSounds` | `function resolveFromSounds(...parts) { return resolveFrom(getSoundsDir(), ...parts); }` |
| 117 | function | `resolveFromTokens` | `function resolveFromTokens(...parts) { return resolveFrom(getTokensDir(), ...parts); }` |
| 118 | function | `resolveFromOverlays` | `function resolveFromOverlays(...parts) { return resolveFrom(getOverlaysDir(), ...parts); }` |
| 119 | function | `resolveFromLogs` | `function resolveFromLogs(...parts) { return resolveFrom(getLogsDir(), ...parts); }` |
| 120 | function | `resolveFromTemp` | `function resolveFromTemp(...parts) { return resolveFrom(getTempDir(), ...parts); }` |
| 121 | function | `resolveFromSecrets` | `function resolveFromSecrets(...parts) { return resolveFrom(getSecretsDir(), ...parts); }` |
| 123 | function | `getSummary` | `function getSummary() {` |
| 142 | function | `ensureBaseDirs` | `function ensureBaseDirs() {` |
| 148 | function | `isPlainObject` | `function isPlainObject(value) {` |
| 152 | function | `clone` | `function clone(value) {` |
| 162 | function | `deepMerge` | `function deepMerge(base, override) {` |
| 177 | function | `readJsonFile` | `function readJsonFile(filePath, fallback = null) {` |
| 191 | function | `writeJsonFile` | `function writeJsonFile(filePath, data, options = {}) {` |
| 197 | function | `resolveConfigFile` | `function resolveConfigFile(fileName) {` |
| 211 | function | `loadConfig` | `function loadConfig(fileName, defaults = {}, options = {}) {` |
| 258 | function | `boolValue` | `function boolValue(value, fallback = false) {` |
| 262 | function | `numberValue` | `function numberValue(value, fallback = 0) {` |

## `backend/modules/helpers/helper_cooldown.js`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 5 | function | `nowMs` | `function nowMs() {` |
| 9 | function | `toMs` | `function toMs(value, unit = 'seconds') {` |
| 26 | function | `isoFromMs` | `function isoFromMs(ms) {` |
| 32 | function | `formatDuration` | `function formatDuration(ms) {` |
| 42 | function | `normalizeKey` | `function normalizeKey(...parts) {` |
| 50 | function | `checkCooldown` | `function checkCooldown(lastAtMs, cooldownMs, currentMs = nowMs()) {` |
| 75 | function | `roleRank` | `function roleRank(user = {}) {` |
| 86 | function | `resolveRoleCooldown` | `function resolveRoleCooldown(config = {}, user = {}) {` |
| 96 | function | `createCooldownStore` | `function createCooldownStore(initial = {}) {` |
| 148 | function | `checkRule` | `function checkRule(store, rule = {}, context = {}) {` |

## `backend/modules/helpers/helper_core.js`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 6 | function | `nowIso` | `function nowIso() {` |
| 10 | function | `normalizePath` | `function normalizePath(inputPath) {` |
| 15 | function | `ensureDir` | `function ensureDir(dirPath) {` |
| 28 | function | `ensureParentDir` | `function ensureParentDir(filePath) {` |
| 39 | function | `fileExists` | `function fileExists(filePath) {` |
| 44 | function | `readText` | `function readText(filePath, fallback = '') {` |
| 50 | function | `writeText` | `function writeText(filePath, content) {` |
| 57 | function | `safeJsonParse` | `function safeJsonParse(raw, fallback = null) {` |
| 66 | function | `readJson` | `function readJson(filePath, fallback = null) {` |
| 72 | function | `writeJson` | `function writeJson(filePath, data, options = {}) {` |
| 80 | function | `appendJsonLine` | `function appendJsonLine(filePath, data) {` |
| 87 | function | `pickFirst` | `function pickFirst(...values) {` |
| 96 | function | `getParam` | `function getParam(req, name, fallback = '') {` |
| 110 | function | `boolParam` | `function boolParam(value, fallback = false) {` |
| 119 | function | `intParam` | `function intParam(value, fallback = 0) {` |
| 124 | function | `ok` | `function ok(data = {}, message = 'ok') {` |
| 133 | function | `fail` | `function fail(message = 'Fehler', data = {}) {` |
| 142 | function | `sendOk` | `function sendOk(res, data = {}, message = 'ok') {` |
| 146 | function | `sendFail` | `function sendFail(res, message = 'Fehler', statusCode = 500, data = {}) {` |
| 150 | function | `asyncRoute` | `function asyncRoute(handler) {` |

## `backend/modules/helpers/helper_dashboard_audit.js`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 9 | function | `compactNowTs` | `function compactNowTs() {` |
| 13 | function | `compactDetails` | `function compactDetails(details, maxLength = 1000) {` |
| 23 | function | `buildAuditEntry` | `function buildAuditEntry(input = {}) {` |

## `backend/modules/helpers/helper_dashboard_auth.js`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 12 | function | `readJsonSafe` | `function readJsonSafe(filePath, fallback) {` |
| 21 | function | `uniq` | `function uniq(list) {` |
| 25 | function | `resolveRolePermissions` | `function resolveRolePermissions(rolesConfig, roleName, seen = new Set()) {` |
| 37 | function | `hasPermission` | `function hasPermission(rolesConfig, roleName, permission) {` |
| 43 | function | `getClientIp` | `function getClientIp(req) {` |
| 48 | function | `normalizeIp` | `function normalizeIp(ip) {` |
| 52 | function | `isLocalRequest` | `function isLocalRequest(req) {` |
| 57 | function | `getDashboardRole` | `function getDashboardRole(req) {` |
| 63 | function | `createDashboardAuth` | `function createDashboardAuth(options = {}) {` |
| 68 | function | `loadRoles` | `function loadRoles() {` |
| 72 | function | `requirePermission` | `function requirePermission(permission, opts = {}) {` |

## `backend/modules/helpers/helper_media.js`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 12 | function | `normalizeSlashes` | `function normalizeSlashes(value) {` |
| 16 | function | `isSafeRelativePath` | `function isSafeRelativePath(value) {` |
| 24 | function | `extensionAllowed` | `function extensionAllowed(filePath, allowed = DEFAULT_ALLOWED_EXTENSIONS) {` |
| 29 | function | `resolveMediaPath` | `function resolveMediaPath(fileName, options = {}) {` |
| 51 | function | `findFfprobe` | `function findFfprobe(options = {}) {` |
| 73 | function | `readAudioDurationMs` | `function readAudioDurationMs(filePath, options = {}) {` |
| 100 | function | `getAudioInfo` | `function getAudioInfo(fileName, options = {}) {` |
| 117 | function | `clearDurationCache` | `function clearDurationCache() {` |
| 122 | function | `durationCacheInfo` | `function durationCacheInfo() {` |

## `backend/modules/helpers/helper_messages.js`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 5 | function | `sanitizeChatMessage` | `function sanitizeChatMessage(message, maxLength = 450) {` |
| 14 | function | `isEmptyMessage` | `function isEmptyMessage(message) {` |
| 18 | function | `streamerbotChatPayload` | `function streamerbotChatPayload(message, options = {}) {` |
| 30 | function | `buildSendResponse` | `function buildSendResponse(message, options = {}) {` |
| 52 | function | `buildNoSendResponse` | `function buildNoSendResponse(reason = 'no_send', options = {}) {` |
| 69 | function | `buildErrorResponse` | `function buildErrorResponse(reason = 'error', options = {}) {` |
| 73 | function | `splitLongMessage` | `function splitLongMessage(message, maxLength = 1800) {` |
| 94 | function | `discordWebhookPayload` | `function discordWebhookPayload(content, options = {}) {` |
| 112 | function | `standardSystemMessage` | `function standardSystemMessage(text, options = {}) {` |
| 118 | function | `escapeMentions` | `function escapeMentions(text) {` |
| 122 | function | `replacePlaceholders` | `function replacePlaceholders(template, values = {}) {` |

## `backend/modules/helpers/helper_queue.js`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 5 | function | `nowIso` | `function nowIso() {` |
| 9 | function | `cleanId` | `function cleanId(value) {` |
| 13 | function | `normalizePriority` | `function normalizePriority(value, fallback = 50) {` |
| 19 | function | `createItem` | `function createItem(input = {}, defaults = {}) {` |
| 33 | function | `sortQueue` | `function sortQueue(items) {` |
| 40 | function | `createQueue` | `function createQueue(options = {}) {` |
| 48 | function | `trim` | `function trim() {` |

## `backend/modules/helpers/helper_routes.js`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 3 | function | `normalizeMethod` | `function normalizeMethod(method) {` |
| 9 | function | `normalizeRoutes` | `function normalizeRoutes(routes) {` |
| 24 | function | `registerRoute` | `function registerRoute(app, method, routes, handler, ...middlewares) {` |
| 36 | function | `registerGet` | `function registerGet(app, routes, handler, ...middlewares) {` |
| 40 | function | `registerPost` | `function registerPost(app, routes, handler, ...middlewares) {` |
| 44 | function | `registerPut` | `function registerPut(app, routes, handler, ...middlewares) {` |
| 48 | function | `registerDelete` | `function registerDelete(app, routes, handler, ...middlewares) {` |
| 52 | function | `legacyPair` | `function legacyPair(legacyRoute, apiRoute) {` |

## `backend/modules/helpers/helper_security.js`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 21 | function | `getSecurityConfigPath` | `function getSecurityConfigPath() {` |
| 25 | function | `cleanStringList` | `function cleanStringList(value, fallback) {` |
| 30 | function | `mergeConfig` | `function mergeConfig(fileConfig) {` |
| 40 | function | `loadSecurityConfig` | `function loadSecurityConfig() {` |
| 44 | function | `ensureSecurityConfig` | `function ensureSecurityConfig() {` |
| 50 | function | `stripPort` | `function stripPort(ip) {` |
| 61 | function | `normalizeIp` | `function normalizeIp(ip) {` |
| 70 | function | `getHeader` | `function getHeader(req, name) {` |
| 77 | function | `getClientIp` | `function getClientIp(req, cfg = loadSecurityConfig()) {` |
| 88 | function | `isLocalhostIp` | `function isLocalhostIp(ip) {` |
| 93 | function | `isValidIpv4` | `function isValidIpv4(ip) {` |
| 99 | function | `ipv4ToInt` | `function ipv4ToInt(ip) {` |
| 104 | function | `ipv4InCidr` | `function ipv4InCidr(ip, cidr) {` |
| 112 | function | `isPrivateIpv4` | `function isPrivateIpv4(ip) {` |
| 116 | function | `networkMatchesIp` | `function networkMatchesIp(ip, network) {` |
| 124 | function | `isAllowedNetworkIp` | `function isAllowedNetworkIp(ip, cfg = loadSecurityConfig()) {` |
| 137 | function | `isAllowedLocalRequest` | `function isAllowedLocalRequest(req, cfg = loadSecurityConfig()) {` |
| 141 | function | `getAuthFromRequest` | `function getAuthFromRequest(req, cfg = loadSecurityConfig()) {` |
| 156 | function | `getConfiguredAuthTokens` | `function getConfiguredAuthTokens(cfg = loadSecurityConfig()) {` |
| 166 | function | `safeEquals` | `function safeEquals(a, b) {` |
| 172 | function | `hasValidAuth` | `function hasValidAuth(req, cfg = loadSecurityConfig()) {` |
| 178 | function | `canAccess` | `function canAccess(req, options = {}) {` |
| 189 | function | `deny` | `function deny(res, result, statusCode = 403) {` |
| 196 | function | `requireLocalOrAuth` | `function requireLocalOrAuth(options = {}) {` |
| 204 | function | `securitySummary` | `function securitySummary(req = null) {` |

## `backend/modules/helpers/helper_state.js`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 7 | function | `nowIso` | `function nowIso() {` |
| 11 | function | `normalizeState` | `function normalizeState(raw, fallbackData = {}) {` |
| 29 | function | `readJson` | `function readJson(filePath, fallback = null) {` |
| 44 | function | `backupFile` | `function backupFile(filePath, options = {}) {` |
| 58 | function | `writeJsonAtomic` | `function writeJsonAtomic(filePath, data, options = {}) {` |
| 70 | function | `loadState` | `function loadState(filePath, fallbackData = {}) {` |
| 80 | function | `saveState` | `function saveState(filePath, state, options = {}) {` |
| 86 | function | `updateState` | `function updateState(filePath, updater, options = {}) {` |
| 95 | function | `createStateStore` | `function createStateStore(filePath, options = {}) {` |
| 108 | function | `listFiles` | `function listFiles(dirPath, options = {}) {` |

## `backend/modules/helpers/helper_texts.js`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 101 | function | `getMessagesDir` | `function getMessagesDir() {` |
| 105 | function | `ensureDefaultMessageFiles` | `function ensureDefaultMessageFiles() {` |
| 119 | function | `listJsonFiles` | `function listJsonFiles(dir) {` |
| 126 | function | `normalizeTextList` | `function normalizeTextList(value) {` |
| 145 | function | `normalizePlaceholders` | `function normalizePlaceholders(value) {` |
| 158 | function | `loadMessageFiles` | `function loadMessageFiles() {` |
| 217 | function | `reload` | `function reload() {` |
| 221 | function | `getStore` | `function getStore() {` |
| 226 | function | `getStatus` | `function getStatus() {` |
| 234 | function | `hasKey` | `function hasKey(key) {` |
| 238 | function | `getEntry` | `function getEntry(key) {` |
| 244 | function | `getTexts` | `function getTexts(key) {` |
| 249 | function | `getPlaceholders` | `function getPlaceholders() {` |
| 254 | function | `pickText` | `function pickText(key, options = {}) {` |
| 268 | function | `flattenContext` | `function flattenContext(input = {}) {` |
| 291 | function | `renderTemplate` | `function renderTemplate(template, context = {}) {` |
| 299 | function | `renderKey` | `function renderKey(key, context = {}, options = {}) {` |
| 305 | function | `buildChatResult` | `function buildChatResult(key, context = {}, options = {}) {` |

## `backend/modules/hug_system.js`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 75 | function | `nowIso` | `function nowIso() {` |
| 79 | function | `nowMs` | `function nowMs() {` |
| 83 | function | `ensureDir` | `function ensureDir(dirPath) {` |
| 87 | function | `readJsonIfExists` | `function readJsonIfExists(filePath) {` |
| 92 | function | `deepMerge` | `function deepMerge(base, override) {` |
| 109 | function | `loadHugTypes` | `function loadHugTypes() {` |
| 137 | function | `normalizeLogin` | `function normalizeLogin(input) {` |
| 144 | async function | `resolveUserByLogin` | `async function resolveUserByLogin(login) {` |
| 151 | function | `pickWeightedHugType` | `function pickWeightedHugType() {` |
| 164 | function | `getTypeById` | `function getTypeById(typeId) {` |
| 168 | function | `pickRandom` | `function pickRandom(arr) {` |
| 173 | function | `formatTemplate` | `function formatTemplate(text, fromDisplay, toDisplay) {` |
| 181 | function | `renderTemplate` | `function renderTemplate(text, context = {}) {` |
| 189 | function | `responseText` | `function responseText(key, context = {}, fallback = "") {` |
| 190 | const function | `responses` | `const responses = (hugTypesConfig && hugTypesConfig.responses) \|\| DEFAULT_MESSAGES.responses;` |
| 195 | function | `getRehugWindowMinutes` | `function getRehugWindowMinutes() {` |
| 200 | function | `createUserIdentityMismatchError` | `function createUserIdentityMismatchError(existingUser, incomingUser) {` |
| 208 | function | `isUserIdentityMismatch` | `function isUserIdentityMismatch(err) {` |
| 212 | function | `ensureHugUser` | `function ensureHugUser(user) {` |
| 248 | function | `ensurePairRow` | `function ensurePairRow(fromUserId, toUserId) {` |
| 270 | function | `cleanupExpiredPendingForTarget` | `function cleanupExpiredPendingForTarget(targetUserId) {` |
| 284 | function | `cleanupExpiredPendingGlobal` | `function cleanupExpiredPendingGlobal() {` |
| 298 | function | `getUserEnabled` | `function getUserEnabled(userId) {` |
| 306 | function | `getStatsByUserId` | `function getStatsByUserId(userId) {` |
| 325 | function | `buildStatsMessage` | `function buildStatsMessage(requesterDisplay, statsRow) {` |
| 467 | async function | `executeAction` | `async function executeAction(action, actorUser, targetLogin) {` |
| 630 | async function | `handleAction` | `async function handleAction(req, res) {` |
| 661 | async function | `handleCmd` | `async function handleCmd(req, res) {` |
| 694 | async function | `handleStats` | `async function handleStats(req, res) {` |
| 746 | async function | `handleStatsCmd` | `async function handleStatsCmd(req, res) {` |
| 809 | function | `handleTop` | `function handleTop(req, res) {` |
| 824 | const function | `topTitles` | `const topTitles = (hugTypesConfig && hugTypesConfig.topTitles) \|\| DEFAULT_MESSAGES.topTitles;` |
| 869 | function | `handleReload` | `function handleReload(req, res) {` |
| 885 | function | `ensureSchema` | `function ensureSchema() {` |
| 937 | function | `init` | `function init(ctx) {` |

## `backend/modules/kofi.js`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 57 | module export | `init` | `module.exports.init = function init(ctx) {` |
| 154 | function | `ensureRuntime` | `function ensureRuntime(ctx) {` |
| 158 | function | `ensureSchema` | `function ensureSchema() {` |
| 223 | function | `seedSettings` | `function seedSettings() {` |
| 241 | function | `loadSettings` | `function loadSettings() {` |
| 257 | function | `seedAlertTypesAndRules` | `function seedAlertTypesAndRules() {` |
| 305 | function | `buildStatus` | `function buildStatus(req) {` |
| 324 | function | `maskSettings` | `function maskSettings(settings) {` |
| 331 | function | `updateSettings` | `function updateSettings(patch) {` |
| 381 | function | `parseKofiPayload` | `function parseKofiPayload(req) {` |
| 407 | function | `normalizeKofiEvent` | `function normalizeKofiEvent(data, original) {` |
| 435 | function | `mapKofiType` | `function mapKofiType(data) {` |
| 447 | function | `buildKofiTitle` | `function buildKofiTitle(typeKey, displayName, amount, currency, data) {` |
| 455 | function | `verifyWebhook` | `function verifyWebhook(req, event) {` |
| 479 | async function | `handleKofiEvent` | `async function handleKofiEvent(event, options = {}) {` |
| 537 | function | `rememberProviderEvent` | `function rememberProviderEvent(event, status, forwardedEventUid) {` |
| 563 | function | `updateProviderEvent` | `function updateProviderEvent(event, status, forwardedEventUid) {` |
| 577 | function | `buildLocalTestEvent` | `function buildLocalTestEvent(query) {` |
| 601 | function | `postJsonInternal` | `function postJsonInternal(targetUrl, payload) {` |
| 637 | function | `sanitizeRawKofi` | `function sanitizeRawKofi(raw) {` |
| 643 | function | `stripSensitive` | `function stripSensitive(obj) {` |
| 655 | function | `isDirectLocalRequest` | `function isDirectLocalRequest(req) {` |
| 663 | function | `hasCloudflareTunnelHeaders` | `function hasCloudflareTunnelHeaders(req) {` |
| 664 | const function | `h` | `const h = (req && req.headers) \|\| {};` |
| 678 | function | `getHost` | `function getHost(req) {` |
| 682 | function | `getIp` | `function getIp(req) {` |
| 686 | function | `mergeSettings` | `function mergeSettings(base, incoming) {` |
| 694 | function | `safeEqual` | `function safeEqual(a, b) {` |
| 703 | function | `cleanText` | `function cleanText(v, max = 500) { return String(v ?? '').trim().slice(0, max); }` |
| 704 | function | `cleanKey` | `function cleanKey(v) { return String(v ?? '').trim().toLowerCase().replace(/[^a-z0-9_.-]+/g, '_').replace(/^_+\|_+$/g, '').slice(0, 80); }` |
| 705 | function | `toNumber` | `function toNumber(v, fallback) { const n = Number(v); return Number.isFinite(n) ? n : fallback; }` |
| 706 | function | `formatAmount` | `function formatAmount(n) { return Number(n \|\| 0).toFixed(2).replace(/\.00$/, ''); }` |
| 707 | function | `parseJson` | `function parseJson(v, fallback) { try { return JSON.parse(v \|\| ''); } catch (_) { return fallback; } }` |
| 708 | function | `nowIso` | `function nowIso() { return new Date().toISOString(); }` |
| 709 | function | `errorMessage` | `function errorMessage(err) { return err && err.message ? err.message : String(err); }` |

## `backend/modules/message_rotator.js`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 116 | function | `getConfigPath` | `function getConfigPath() {` |
| 120 | function | `clone` | `function clone(value) {` |
| 124 | function | `toBool` | `function toBool(value, fallback = false) {` |
| 128 | function | `toPositiveNumber` | `function toPositiveNumber(value, fallback = 0) {` |
| 134 | function | `cleanId` | `function cleanId(value) {` |
| 138 | function | `cleanLower` | `function cleanLower(value) {` |
| 142 | function | `cleanStringList` | `function cleanStringList(value, fallback = []) {` |
| 147 | function | `mergeConfig` | `function mergeConfig(raw) {` |
| 200 | function | `ensureConfigFile` | `function ensureConfigFile() {` |
| 206 | function | `loadConfig` | `function loadConfig() {` |
| 220 | function | `getConfig` | `function getConfig() {` |
| 225 | function | `msFromMinutes` | `function msFromMinutes(minutes) {` |
| 229 | function | `ageSeconds` | `function ageSeconds(ms) {` |
| 234 | function | `publicState` | `function publicState() {` |
| 265 | function | `resetRuntimeCounters` | `function resetRuntimeCounters(options = {}) {` |
| 295 | function | `startRotator` | `function startRotator() {` |
| 305 | function | `stopRotator` | `function stopRotator() {` |
| 311 | function | `isBotName` | `function isBotName(name) {` |
| 318 | function | `getTickUser` | `function getTickUser(req) {` |
| 328 | function | `tick` | `function tick(req) {` |
| 351 | function | `itemRuntime` | `function itemRuntime(id) {` |
| 362 | function | `getDueItems` | `function getDueItems() {` |
| 399 | function | `chooseWeighted` | `function chooseWeighted(items) {` |
| 419 | function | `block` | `function block(reason, extra = {}) {` |
| 431 | function | `buildContext` | `function buildContext(req) {` |
| 448 | function | `updateLiveStatusCache` | `function updateLiveStatusCache(result) {` |
| 465 | function | `getCachedLiveStatus` | `function getCachedLiveStatus() {` |
| 475 | function | `fetchJsonUrl` | `function fetchJsonUrl(rawUrl, timeoutMs = 3000) {` |
| 510 | function | `evaluateOnlineStatus` | `function evaluateOnlineStatus(payload, onlineCheck) {` |
| 521 | async function | `checkLiveStatus` | `async function checkLiveStatus(options = {}) {` |
| 574 | async function | `nextMessage` | `async function nextMessage(req) {` |
| 656 | function | `manualRuntime` | `function manualRuntime(id) {` |
| 667 | function | `normalizeCommand` | `function normalizeCommand(value) {` |
| 673 | function | `findManualItem` | `function findManualItem(req) {` |
| 711 | function | `manualMessage` | `function manualMessage(req) {` |
| 781 | function | `wantsPlain` | `function wantsPlain(req) {` |
| 785 | function | `sendResponse` | `function sendResponse(req, res, payload, statusCode = 200) {` |
| 792 | function | `checkAuth` | `function checkAuth(req) {` |
| 797 | function | `guarded` | `function guarded(handler) {` |
| 818 | function | `init` | `function init(ctx) {` |

## `backend/modules/messages.js`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 19 | function | `getInput` | `function getInput(req, key, fallback = '') {` |
| 23 | function | `wantsPlain` | `function wantsPlain(req) {` |
| 27 | function | `reply` | `function reply(req, res, payload, statusCode = 200) {` |
| 34 | function | `checkAuth` | `function checkAuth(req) {` |
| 39 | function | `collectContext` | `function collectContext(req) {` |
| 64 | function | `buildOptions` | `function buildOptions(req) {` |
| 73 | function | `cooldownKey` | `function cooldownKey(target, key) {` |
| 77 | function | `checkCooldown` | `function checkCooldown(req, key, target) {` |
| 99 | async function | `sendDiscordIfRequested` | `async function sendDiscordIfRequested(ctx, result, req) {` |
| 117 | async function | `buildAndMaybeSend` | `async function buildAndMaybeSend(ctx, req) {` |
| 150 | function | `schedulerStatus` | `function schedulerStatus() {` |
| 160 | function | `stopScheduler` | `function stopScheduler() {` |
| 167 | function | `startScheduler` | `function startScheduler(ctx, options = {}) {` |
| 196 | function | `init` | `function init(ctx) {` |
| 213 | const function | `reloadHandler` | `const reloadHandler = (req, res) => {` |
| 221 | const function | `randomHandler` | `const randomHandler = (req, res) => {` |
| 243 | const function | `schedulerStartHandler` | `const schedulerStartHandler = (req, res) => {` |
| 258 | const function | `schedulerStopHandler` | `const schedulerStopHandler = (req, res) => {` |

## `backend/modules/obs_shared.js`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 13 | function | `createSharedObs` | `function createSharedObs(env = {}, logger = console) {` |
| 81 | function | `normalize` | `function normalize(value) {` |
| 85 | function | `normalizeLookup` | `function normalizeLookup(value) {` |
| 89 | function | `isFiniteNum` | `function isFiniteNum(v) {` |
| 93 | function | `maxFinite` | `function maxFinite(arr) {` |
| 97 | function | `collapseMul` | `function collapseMul(levelsMul) {` |
| 110 | function | `mulToDb` | `function mulToDb(m) {` |
| 115 | function | `clone` | `function clone(value) {` |
| 119 | function | `scheduleIdleCheck` | `function scheduleIdleCheck(ms = IDLE_CHECK_MS) {` |
| 132 | function | `scheduleReconnect` | `function scheduleReconnect(ms = SCENE_RECONNECT_MS) {` |
| 142 | async function | `detectObsProcess` | `async function detectObsProcess() {` |
| 156 | async function | `detectObsPort` | `async function detectObsPort() {` |
| 160 | const arrow | `finish` | `const finish = ok => {` |
| 173 | async function | `isObsAvailable` | `async function isObsAvailable() {` |
| 179 | async function | `connect` | `async function connect() {` |
| 227 | async function | `ensureConnected` | `async function ensureConnected() {` |
| 235 | async function | `call` | `async function call(requestType, requestData = {}) {` |
| 245 | async function | `refreshSnapshot` | `async function refreshSnapshot() {` |
| 267 | async function | `refreshScenes` | `async function refreshScenes() {` |
| 286 | function | `getPublicStatus` | `function getPublicStatus() {` |
| 313 | function | `getLegacyAudioState` | `function getLegacyAudioState() {` |
| 324 | function | `getSceneAliasesConfig` | `function getSceneAliasesConfig() {` |
| 334 | function | `buildConfiguredScenes` | `function buildConfiguredScenes(configObj) {` |
| 362 | function | `buildAllowedScenes` | `function buildAllowedScenes(configuredScenes, obsSceneNames) {` |
| 367 | async function | `getAllowedScenes` | `async function getAllowedScenes() {` |
| 374 | async function | `getSceneListWithMeta` | `async function getSceneListWithMeta() {` |
| 383 | function | `resolveSceneSelection` | `function resolveSceneSelection(input, sceneList) {` |
| 399 | async function | `setProgramScene` | `async function setProgramScene(sceneName) {` |
| 405 | async function | `setPreviewScene` | `async function setPreviewScene(sceneName) {` |
| 411 | async function | `triggerStudioTransition` | `async function triggerStudioTransition() {` |
| 416 | async function | `getInputList` | `async function getInputList() {` |
| 421 | async function | `getInputSettings` | `async function getInputSettings(inputName) {` |
| 425 | async function | `findInputByNameOrAlias` | `async function findInputByNameOrAlias(inputName, aliasMap = {}) {` |
| 431 | async function | `getSceneItemList` | `async function getSceneItemList(sceneName) {` |
| 436 | async function | `findSceneItem` | `async function findSceneItem(sceneName, sourceName) {` |
| 441 | async function | `setSceneItemEnabled` | `async function setSceneItemEnabled(sceneName, sceneItemId, enabled) {` |
| 450 | async function | `getInputMute` | `async function getInputMute(inputName) {` |
| 455 | async function | `setInputMute` | `async function setInputMute(inputName, muted) {` |
| 460 | async function | `toggleInputMute` | `async function toggleInputMute(inputName) {` |
| 465 | async function | `getInputVolume` | `async function getInputVolume(inputName) {` |
| 473 | async function | `setInputVolume` | `async function setInputVolume(inputName, payload) {` |
| 478 | async function | `triggerMediaInputAction` | `async function triggerMediaInputAction(inputName, mediaAction) {` |
| 483 | async function | `getReplayBufferStatus` | `async function getReplayBufferStatus() {` |
| 489 | async function | `startReplayBuffer` | `async function startReplayBuffer() {` |
| 495 | async function | `stopReplayBuffer` | `async function stopReplayBuffer() {` |
| 501 | async function | `saveReplayBuffer` | `async function saveReplayBuffer() {` |
| 506 | async function | `getSourceFilterList` | `async function getSourceFilterList(sourceName) {` |
| 511 | async function | `setSourceFilterEnabled` | `async function setSourceFilterEnabled(sourceName, filterName, enabled) {` |
| 554 | const function | `subset` | `const subset = (evt.inputs \|\| []).filter(i => AUDIO_INPUTS.includes(i.inputName));` |
| 618 | function | `getSharedObs` | `function getSharedObs(env = {}, logger = console) {` |

## `backend/modules/obs.js`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 7 | module export | `init` | `module.exports.init = function init(ctx) {` |
| 25 | function | `clampNumber` | `function clampNumber(value, min, max, fallback) {` |
| 31 | function | `boolValue` | `function boolValue(value, fallback) {` |
| 40 | function | `sanitizeDashboardConfig` | `function sanitizeDashboardConfig(input = {}) {` |
| 53 | function | `loadDashboardConfig` | `function loadDashboardConfig() {` |
| 58 | function | `saveDashboardConfig` | `function saveDashboardConfig(input = {}) {` |
| 67 | function | `setCommonHeaders` | `function setCommonHeaders(res) {` |
| 74 | function | `ok` | `function ok(res, route, data, statusCode = 200) {` |
| 85 | function | `fail` | `function fail(res, route, code, message, details = null, statusCode = 400) {` |
| 100 | function | `body` | `function body(req, key) {` |
| 104 | function | `normalize` | `function normalize(value) {` |
| 108 | function | `normalizeLookup` | `function normalizeLookup(value) {` |
| 112 | function | `safeJsonParse` | `function safeJsonParse(input, fallback) {` |
| 120 | async function | `resolveSceneName` | `async function resolveSceneName(sceneOrAlias) {` |
| 127 | async function | `resolveInputName` | `async function resolveInputName(inputOrAlias) {` |
| 401 | async function | `handleSceneItemVisibility` | `async function handleSceneItemVisibility(req, res, mode) {` |
| 624 | async function | `handleFilter` | `async function handleFilter(req, res, mode) {` |

## `backend/modules/overlay_data.js`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 4 | function | `readJsonSafe` | `function readJsonSafe(file, fallback) {` |
| 14 | function | `init` | `function init({ app, paths }) {` |

## `backend/modules/scene_control.js`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 6 | module export | `init` | `module.exports.init = function init(ctx) {` |
| 13 | function | `ok` | `function ok(payload) {` |
| 17 | function | `fail` | `function fail(message, errorCode) {` |
| 21 | function | `normalizeInput` | `function normalizeInput(value) {` |
| 25 | function | `normalizeLookup` | `function normalizeLookup(value) {` |
| 29 | function | `bodyOrQuery` | `function bodyOrQuery(req, key) {` |
| 33 | function | `buildChatListMessage` | `function buildChatListMessage(sceneList) {` |
| 40 | function | `publicState` | `function publicState() {` |
| 58 | async function | `getSceneMeta` | `async function getSceneMeta() {` |

## `backend/modules/security.js`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 7 | function | `buildSecurityStatus` | `function buildSecurityStatus(req) {` |
| 48 | module export | `init` | `module.exports.init = function init(ctx) {` |

## `backend/modules/sound_output_config.js`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 46 | module export | `init` | `module.exports.init = function init(ctx) {` |
| 50 | function | `loadConfig` | `function loadConfig() {` |
| 57 | function | `saveConfig` | `function saveConfig(data) {` |
| 63 | function | `outputState` | `function outputState() {` |
| 74 | function | `normalizeTarget` | `function normalizeTarget(value) {` |
| 80 | function | `boolValue` | `function boolValue(value, fallback) {` |
| 84 | function | `intValue` | `function intValue(value, fallback, min, max) {` |
| 90 | function | `getField` | `function getField(obj, ...names) {` |
| 98 | function | `resolveHelperPath` | `function resolveHelperPath(output) {` |
| 107 | function | `helperInfo` | `function helperInfo(output) {` |
| 121 | function | `fallbackDevices` | `function fallbackDevices(output) {` |
| 134 | function | `extractDevices` | `function extractDevices(parsed) {` |
| 141 | function | `normalizeDevice` | `function normalizeDevice(raw, selected) {` |
| 155 | function | `readDevicesViaHelper` | `function readDevicesViaHelper(output) {` |
| 224 | const function | `devices` | `const devices = (result.devices \|\| []).map(device => normalizeDevice(device, selected));` |

## `backend/modules/sound_system.js`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 110 | module export | `init` | `module.exports.init = function init(ctx) {` |
| 145 | function | `deepMergeRuntimeSettings` | `function deepMergeRuntimeSettings(base, override) {` |
| 163 | function | `ensureSoundSettingsSchema` | `function ensureSoundSettingsSchema() {` |
| 180 | function | `parseSettingJson` | `function parseSettingJson(raw, fallback) {` |
| 189 | function | `getSoundSettings` | `function getSoundSettings() {` |
| 202 | function | `pickEffectiveSettings` | `function pickEffectiveSettings() {` |
| 210 | function | `publicSoundSettings` | `function publicSoundSettings() {` |
| 223 | function | `sanitizeSoundSettingsPayload` | `function sanitizeSoundSettingsPayload(body) {` |
| 250 | function | `saveSoundSettings` | `function saveSoundSettings(body, updatedBy) {` |
| 278 | function | `loadAll` | `function loadAll() {` |
| 304 | function | `touch` | `function touch() { state.updatedAt = core.nowIso(); }` |
| 306 | function | `emit` | `function emit(reason) {` |
| 313 | function | `publicState` | `function publicState() {` |
| 349 | function | `publicItem` | `function publicItem(item) {` |
| 387 | function | `msg` | `function msg(key) { return messages[key] \|\| DEFAULT_MESSAGES[key] \|\| key; }` |
| 388 | function | `makeRequestId` | `function makeRequestId() { return \`snd_${Date.now()}_${Math.random().toString(36).slice(2, 8)}\`; }` |
| 389 | function | `normalizeId` | `function normalizeId(value) { return String(value \|\| "").trim().toLowerCase().replace(/[^a-z0-9_.:-]/g, "_"); }` |
| 390 | function | `hasOwn` | `function hasOwn(obj, key) { return !!obj && Object.prototype.hasOwnProperty.call(obj, key); }` |
| 391 | function | `isPlainObject` | `function isPlainObject(value) { return !!value && typeof value === "object" && !Array.isArray(value); }` |
| 392 | function | `objectValue` | `function objectValue(value) {` |
| 402 | function | `boolFromBase` | `function boolFromBase(base, key, fallback) { return core.boolParam(hasOwn(base, key) ? base[key] : fallback, fallback); }` |
| 403 | function | `numberFromBase` | `function numberFromBase(base, key, fallback) {` |
| 407 | function | `priorityForCategory` | `function priorityForCategory(category, fallback) {` |
| 414 | function | `resolvePriority` | `function resolvePriority(base, preset, body, category) {` |
| 423 | const function | `categoryDefault` | `const categoryDefault = (config.categoryDefaults && config.categoryDefaults[normalizeId(category)]) \|\| {};` |
| 436 | function | `applyCategoryDefaults` | `function applyCategoryDefaults(defaults, preset, body) {` |
| 438 | const function | `categoryDefaults` | `const categoryDefaults = (config.categoryDefaults && config.categoryDefaults[normalizeId(rawCategory)]) \|\| {};` |
| 442 | function | `getSoundsBaseDir` | `function getSoundsBaseDir() {` |
| 448 | function | `getSoundList` | `function getSoundList() { return Array.isArray(config.sounds) ? config.sounds : []; }` |
| 449 | function | `findSound` | `function findSound(soundId) { const id = normalizeId(soundId); return getSoundList().find(sound => normalizeId(sound.id) === id) \|\| null; }` |
| 451 | function | `browserUrlFromRelative` | `function browserUrlFromRelative(relativeFile) {` |
| 456 | function | `clampVolume` | `function clampVolume(value, fallback) {` |
| 462 | function | `normalizeTarget` | `function normalizeTarget(rawTarget) {` |
| 463 | const function | `fallback` | `const fallback = (config.defaults && config.defaults.target) \|\| "stream";` |
| 469 | function | `normalizeOutputTarget` | `function normalizeOutputTarget(rawOutputTarget, legacyTarget) {` |
| 470 | const function | `fallback` | `const fallback = (config.output && config.output.defaultTarget) \|\| (config.defaults && config.defaults.outputTarget) \|\| "overlay";` |
| 477 | function | `shouldUseOverlay` | `function shouldUseOverlay(item) { return item.outputTarget === "overlay" \|\| item.outputTarget === "both"; }` |
| 478 | function | `shouldUseDevice` | `function shouldUseDevice(item) { return item.outputTarget === "device" \|\| item.outputTarget === "both"; }` |
| 480 | function | `targetEnabled` | `function targetEnabled(target) {` |
| 485 | function | `outputTargetEnabled` | `function outputTargetEnabled(outputTarget) {` |
| 494 | function | `intInRange` | `function intInRange(value, fallback, min, max) {` |
| 500 | function | `resolveHelperPath` | `function resolveHelperPath() {` |
| 508 | function | `getDeviceConfig` | `function getDeviceConfig() {` |
| 513 | function | `getDevicePlaybackMode` | `function getDevicePlaybackMode(item) {` |
| 518 | function | `effectiveHelperTimeoutMs` | `function effectiveHelperTimeoutMs(item, helper) {` |
| 526 | function | `createBeepWavBuffer` | `function createBeepWavBuffer(options = {}) {` |
| 561 | function | `resolveDurationMs` | `function resolveDurationMs(base, audioInfo, fallbackMs, generatedBeep) {` |
| 575 | function | `alertVisualLeadMs` | `function alertVisualLeadMs(item) {` |
| 593 | function | `itemStillActive` | `function itemStillActive(item, parallel) {` |
| 599 | function | `parallelAllowedByPolicy` | `function parallelAllowedByPolicy(item) {` |
| 612 | function | `normalizePlayRequest` | `function normalizePlayRequest(raw) {` |
| 626 | const function | `targetConfig` | `const targetConfig = (config.targets && config.targets[target]) \|\| {};` |
| 697 | function | `sortQueue` | `function sortQueue() {` |
| 705 | function | `emitItemEvent` | `function emitItemEvent(reason, item, extra = {}) {` |
| 716 | function | `canInterruptCurrent` | `function canInterruptCurrent(item, current) {` |
| 733 | function | `shouldDropBusy` | `function shouldDropBusy(item) {` |
| 742 | function | `shouldDropQueueFull` | `function shouldDropQueueFull(item) {` |
| 751 | function | `cooldownKeyUser` | `function cooldownKeyUser(item) {` |
| 755 | function | `checkCooldown` | `function checkCooldown(item) {` |
| 787 | function | `rememberCooldown` | `function rememberCooldown(item) {` |
| 798 | function | `clearFinishTimer` | `function clearFinishTimer() { if (finishTimer) clearTimeout(finishTimer); finishTimer = null; }` |
| 800 | function | `killProcessTree` | `function killProcessTree(proc, reason) {` |
| 814 | function | `killDeviceProcess` | `function killDeviceProcess(item, reason) {` |
| 833 | function | `killParallelDeviceProcesses` | `function killParallelDeviceProcesses(reason) {` |
| 837 | function | `playDeviceOutput` | `function playDeviceOutput(item) {` |
| 895 | function | `activateItemAudio` | `function activateItemAudio(item, parallel) {` |
| 916 | function | `startItem` | `function startItem(item, reason, options = {}) {` |
| 950 | function | `finishParallel` | `function finishParallel(requestId, reason) {` |
| 958 | function | `startNextIfPossible` | `function startNextIfPossible(reason) {` |
| 965 | function | `finishCurrent` | `function finishCurrent(reason) {` |
| 975 | function | `stopCurrent` | `function stopCurrent(reason) {` |
| 986 | function | `enqueueOrStart` | `function enqueueOrStart(item) {` |
| 1029 | function | `markClient` | `function markClient(eventName) {` |
| 1053 | const function | `prefix` | `const prefix = (config.routes && config.routes.prefix) \|\| "/api/sound";` |
| 1081 | function | `playResponse` | `function playResponse(req, res, input) {` |

## `backend/modules/sqlite_core.js`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 12 | function | `ensureDir` | `function ensureDir(dirPath) {` |
| 16 | function | `nowIso` | `function nowIso() {` |
| 20 | function | `initDatabase` | `function initDatabase(dataDir) {` |
| 46 | function | `getDb` | `function getDb() {` |
| 53 | function | `getDbPath` | `function getDbPath() {` |
| 57 | function | `isInitialized` | `function isInitialized() {` |
| 61 | function | `buildStatus` | `function buildStatus() {` |
| 71 | function | `exec` | `function exec(sql) {` |
| 75 | function | `run` | `function run(sql, params = {}) {` |
| 79 | function | `get` | `function get(sql, params = {}) {` |
| 83 | function | `all` | `function all(sql, params = {}) {` |
| 87 | function | `transaction` | `function transaction(fn) {` |
| 104 | function | `getSchemaVersion` | `function getSchemaVersion(moduleName) {` |
| 112 | function | `setSchemaVersion` | `function setSchemaVersion(moduleName, version) {` |
| 129 | function | `ensureSchema` | `function ensureSchema(moduleName, targetVersion, migrateFn) {` |
| 152 | function | `close` | `function close() {` |
| 160 | function | `init` | `function init(ctx) {` |
| 167 | const function | `shutdown` | `const shutdown = () => {` |

## `backend/modules/start_overlay.js`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 92 | function | `init` | `function init(ctx) {` |
| 105 | function | `configFilePath` | `function configFilePath() {` |
| 109 | function | `messagesFilePath` | `function messagesFilePath() {` |
| 113 | function | `ensureMessagesFile` | `function ensureMessagesFile() {` |
| 121 | function | `normalizeRotatorMessages` | `function normalizeRotatorMessages(value) {` |
| 145 | function | `normalizeFallbackChatMessages` | `function normalizeFallbackChatMessages(value) {` |
| 158 | function | `loadRuntime` | `function loadRuntime() {` |
| 188 | function | `isIgnoredUser` | `function isIgnoredUser(loginOrName) {` |
| 195 | function | `bodyOrQuery` | `function bodyOrQuery(req, key, fallback = '') {` |
| 199 | function | `pickRequestValue` | `function pickRequestValue(req, keys, fallback = '') {` |
| 208 | function | `normalizeChatSegments` | `function normalizeChatSegments(value) {` |
| 239 | function | `normalizeChatItem` | `function normalizeChatItem(input = {}) {` |
| 266 | function | `addChatMessage` | `function addChatMessage(input) {` |
| 301 | function | `clearChat` | `function clearChat() {` |
| 313 | function | `publicChatSnapshot` | `function publicChatSnapshot() {` |
| 318 | function | `publicConfig` | `function publicConfig() {` |
| 360 | function | `publicStatus` | `function publicStatus() {` |
| 375 | function | `broadcast` | `function broadcast(payload) {` |
| 382 | function | `sendOverlayBootstrap` | `function sendOverlayBootstrap(ws) {` |
| 400 | function | `attachWebSocketListener` | `function attachWebSocketListener() {` |
| 421 | function | `handleChat` | `function handleChat(req, res) {` |
| 446 | function | `handleClear` | `function handleClear(req, res) {` |
| 454 | function | `handleReload` | `function handleReload(req, res) {` |

## `backend/modules/tagebuch.js`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 64 | function | `nowIso` | `function nowIso() {` |
| 68 | function | `safeString` | `function safeString(value) {` |
| 72 | function | `boolValue` | `function boolValue(value, fallback = false) {` |
| 80 | function | `deepMerge` | `function deepMerge(base, extra) {` |
| 93 | function | `readJsonIfExists` | `function readJsonIfExists(filePath, fallback) {` |
| 104 | function | `writeJsonIfMissing` | `function writeJsonIfMissing(filePath, data) {` |
| 114 | function | `configPath` | `function configPath() {` |
| 118 | function | `messagesPath` | `function messagesPath() {` |
| 122 | function | `loadRuntimeConfig` | `function loadRuntimeConfig() {` |
| 144 | function | `loadRuntimeMessages` | `function loadRuntimeMessages() {` |
| 156 | function | `getConfig` | `function getConfig() {` |
| 160 | function | `getMessages` | `function getMessages() {` |
| 164 | function | `reloadRuntime` | `function reloadRuntime() {` |
| 170 | function | `localDateString` | `function localDateString(date = new Date()) {` |
| 177 | function | `stripTagebuchCommand` | `function stripTagebuchCommand(value) {` |
| 183 | function | `getInput` | `function getInput(req, key) {` |
| 187 | function | `wantsPlain` | `function wantsPlain(req) {` |
| 192 | function | `authOk` | `function authOk(req) {` |
| 196 | function | `jsonForbidden` | `function jsonForbidden(res) {` |
| 200 | function | `buildPageTitle` | `function buildPageTitle(pageNumber) {` |
| 204 | function | `ensureSchema` | `function ensureSchema() {` |
| 344 | function | `getState` | `function getState() {` |
| 358 | function | `saveState` | `function saveState(next) {` |
| 393 | function | `logRuntimeEvent` | `function logRuntimeEvent(type, data = {}) {` |
| 418 | function | `getBridge` | `function getBridge(ctx) {` |
| 425 | async function | `resolveTwitchUser` | `async function resolveTwitchUser(authorLogin) {` |
| 448 | function | `normalizeUserKey` | `function normalizeUserKey({ userId, login, displayName }) {` |
| 461 | function | `updateUserStats` | `function updateUserStats({ pageDate, pageNumber, userId, login, displayName, system = false }) {` |
| 532 | function | `statsLimit` | `function statsLimit(req) {` |
| 540 | function | `mapUserStatsRow` | `function mapUserStatsRow(row) {` |
| 552 | function | `mapDailyStatsRow` | `function mapDailyStatsRow(row) {` |
| 566 | function | `getStatsTop` | `function getStatsTop(limit = 10) {` |
| 578 | function | `getStatsForDate` | `function getStatsForDate(pageDate, limit = 10) {` |
| 591 | function | `getStatsForUser` | `function getStatsForUser(user) {` |
| 612 | async function | `postWebhook` | `async function postWebhook(ctx, payload) {` |
| 627 | async function | `createPageForDateIfNeeded` | `async function createPageForDateIfNeeded(ctx, pageDate) {` |
| 665 | async function | `markStreamStarted` | `async function markStreamStarted(ctx) {` |
| 691 | async function | `postDiaryEntry` | `async function postDiaryEntry(ctx, { authorDisplay, authorLogin, message, system = false, systemUsername = '' }) {` |
| 769 | async function | `markStreamEnded` | `async function markStreamEnded(ctx) {` |
| 811 | function | `resetState` | `function resetState(mode, confirm) {` |
| 848 | function | `nextPageNumberIfNewDate` | `function nextPageNumberIfNewDate(state = getState()) {` |
| 853 | function | `publicState` | `function publicState(state = getState()) {` |
| 868 | function | `buildStatus` | `function buildStatus() {` |
| 894 | function | `sendPlainOrJson` | `function sendPlainOrJson(req, res, result, okStatus = 200) {` |
| 901 | function | `registerRoutes` | `function registerRoutes(ctx) {` |
| 904 | async function | `handleStreamStart` | `async function handleStreamStart(req, res) {` |
| 913 | async function | `handleStreamEnd` | `async function handleStreamEnd(req, res) {` |
| 922 | async function | `handleTagebuch` | `async function handleTagebuch(req, res) {` |
| 944 | function | `handleStatus` | `function handleStatus(req, res) {` |
| 954 | function | `handleStatsTop` | `function handleStatsTop(req, res) {` |
| 965 | function | `handleStatsToday` | `function handleStatsToday(req, res) {` |
| 978 | function | `handleStatsUser` | `function handleStatsUser(req, res) {` |
| 990 | function | `handleReset` | `function handleReset(req, res) {` |
| 999 | function | `handleReload` | `function handleReload(req, res) {` |
| 1035 | function | `init` | `function init(ctx) {` |

## `backend/modules/tipeee.js`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 93 | module export | `init` | `module.exports.init = function init(ctx) {` |
| 244 | function | `ensureRuntime` | `function ensureRuntime(ctx) {` |
| 248 | function | `ensureSchema` | `function ensureSchema() {` |
| 313 | function | `seedSettings` | `function seedSettings() {` |
| 330 | function | `loadSettings` | `function loadSettings() {` |
| 348 | function | `updateSettings` | `function updateSettings(patch) {` |
| 411 | function | `seedAlertTypesAndRules` | `function seedAlertTypesAndRules() {` |
| 459 | function | `buildStatus` | `function buildStatus(req) {` |
| 490 | function | `maskSettings` | `function maskSettings(settings) {` |
| 497 | async function | `connectSocket` | `async function connectSocket() {` |
| 533 | function | `bindSocketEvents` | `function bindSocketEvents(socket) {` |
| 587 | function | `waitForSocketConnect` | `function waitForSocketConnect(socket, timeoutMs) {` |
| 590 | const arrow | `finish` | `const finish = result => {` |
| 606 | function | `disconnectSocket` | `function disconnectSocket(reason = 'disconnect') {` |
| 626 | async function | `resolveSocketUrl` | `async function resolveSocketUrl(settings) {` |
| 641 | function | `normalizeSocketSiteResponse` | `function normalizeSocketSiteResponse(body, fallback) {` |
| 664 | function | `normalizeTipeeeEvent` | `function normalizeTipeeeEvent(payload, originalMeta = {}) {` |
| 694 | function | `mapTipeeeType` | `function mapTipeeeType(input) {` |
| 703 | async function | `handleTipeeeEvent` | `async function handleTipeeeEvent(event, options = {}) {` |
| 777 | function | `rememberProviderEvent` | `function rememberProviderEvent(event, status, forwardedEventUid) {` |
| 803 | function | `updateProviderEvent` | `function updateProviderEvent(event, status, forwardedEventUid) {` |
| 817 | function | `rememberRecentEvent` | `function rememberRecentEvent(event) {` |
| 830 | function | `buildLocalTestEvent` | `function buildLocalTestEvent(query) {` |
| 853 | function | `buildSyntheticProviderId` | `function buildSyntheticProviderId(root, params, typeKey, amount, currency) {` |
| 859 | function | `buildTipeeeTitle` | `function buildTipeeeTitle(typeKey, displayName, amount, currency) {` |
| 867 | function | `verifySecretHeader` | `function verifySecretHeader(req) {` |
| 875 | function | `postJsonInternal` | `function postJsonInternal(targetUrl, payload) {` |
| 910 | function | `getJsonExternal` | `function getJsonExternal(targetUrl, timeoutMs) {` |
| 942 | function | `sanitizeRawTipeee` | `function sanitizeRawTipeee(raw) {` |
| 948 | function | `stripSensitive` | `function stripSensitive(obj) {` |
| 960 | function | `fail` | `function fail(error, err) {` |
| 968 | function | `setErrorResult` | `function setErrorResult(error, message) {` |
| 974 | function | `isDirectLocalRequest` | `function isDirectLocalRequest(req) {` |
| 982 | function | `hasCloudflareTunnelHeaders` | `function hasCloudflareTunnelHeaders(req) {` |
| 983 | const function | `h` | `const h = (req && req.headers) \|\| {};` |
| 997 | function | `getHost` | `function getHost(req) {` |
| 1001 | function | `getIp` | `function getIp(req) {` |
| 1005 | function | `mergeSettings` | `function mergeSettings(base, incoming) {` |
| 1015 | function | `normalizeStringArray` | `function normalizeStringArray(value, fallback) {` |
| 1021 | function | `safeEqual` | `function safeEqual(a, b) {` |
| 1030 | function | `cleanText` | `function cleanText(v, max = 500) { return String(v ?? '').trim().slice(0, max); }` |
| 1031 | function | `cleanKey` | `function cleanKey(v) { return String(v ?? '').trim().toLowerCase().replace(/[^a-z0-9_.-]+/g, '_').replace(/^_+\|_+$/g, '').slice(0, 80); }` |
| 1032 | function | `toNumber` | `function toNumber(v, fallback) { const n = Number(v); return Number.isFinite(n) ? n : fallback; }` |
| 1033 | function | `formatAmount` | `function formatAmount(n) { return Number(n \|\| 0).toFixed(2).replace(/\.00$/, ''); }` |
| 1034 | function | `parseJson` | `function parseJson(v, fallback) { try { return JSON.parse(v \|\| ''); } catch (_) { return fallback; } }` |
| 1035 | function | `nowIso` | `function nowIso() { return new Date().toISOString(); }` |
| 1036 | function | `errorMessage` | `function errorMessage(err) { return err && err.message ? err.message : String(err); }` |

## `backend/modules/todo.js`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 73 | function | `normalizeAlias` | `function normalizeAlias(value) {` |
| 80 | function | `getInput` | `function getInput(req, key) {` |
| 84 | function | `wantsPlain` | `function wantsPlain(req) {` |
| 88 | function | `reply` | `function reply(req, res, payload, statusCode = 200) {` |
| 95 | function | `readJsonSafe` | `function readJsonSafe(filePath, fallback) {` |
| 107 | function | `ensureMessagesFile` | `function ensureMessagesFile() {` |
| 119 | function | `loadRuntime` | `function loadRuntime() {` |
| 132 | function | `t` | `function t(key, values = {}) {` |
| 140 | function | `nowIso` | `function nowIso() {` |
| 145 | function | `localDateString` | `function localDateString(date = new Date()) {` |
| 152 | function | `checkAuth` | `function checkAuth(req) {` |
| 157 | function | `getDiscordBridge` | `function getDiscordBridge(ctx) {` |
| 166 | function | `getNestedValue` | `function getNestedValue(obj, pathParts) {` |
| 175 | function | `extractDisplayNameFromUserinfo` | `function extractDisplayNameFromUserinfo(payload) {` |
| 199 | function | `shouldResolveDisplayName` | `function shouldResolveDisplayName(authorLogin, authorDisplay) {` |
| 209 | async function | `fetchJsonWithTimeout` | `async function fetchJsonWithTimeout(url, timeoutMs) {` |
| 224 | async function | `resolveAuthorInfo` | `async function resolveAuthorInfo(input) {` |
| 265 | function | `parseTodoMessage` | `function parseTodoMessage(rawMessage) {` |
| 285 | function | `resolveTodoTarget` | `function resolveTodoTarget(rawTarget) {` |
| 293 | function | `getTargetListText` | `function getTargetListText() {` |
| 297 | function | `getTodoChannelIdForTarget` | `function getTodoChannelIdForTarget(target) {` |
| 303 | function | `getChannelStatus` | `function getChannelStatus() {` |
| 315 | function | `makeUserKey` | `function makeUserKey(authorLogin, authorDisplay) {` |
| 321 | function | `ensureTodoSchema` | `function ensureTodoSchema() {` |
| 375 | function | `incrementStats` | `function incrementStats({ authorLogin, authorDisplay, target }) {` |
| 437 | function | `formatStatsRows` | `function formatStatsRows(rows, headerKey) {` |
| 448 | function | `getLimit` | `function getLimit(req, fallback = 10, max = 50) {` |
| 454 | async function | `postTodoEntry` | `async function postTodoEntry(ctx, input) {` |
| 530 | function | `buildStatus` | `function buildStatus() {` |
| 551 | function | `init` | `function init(ctx) {` |
| 564 | const function | `addHandler` | `const addHandler = async (req, res) => {` |
| 627 | const function | `reloadHandler` | `const reloadHandler = async (req, res) => {` |

## `backend/modules/tts_system.js`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 23 | function | `init` | `function init(ctx) {` |
| 164 | function | `structuredCloneSafe` | `function structuredCloneSafe(obj) {` |
| 168 | function | `deepMerge` | `function deepMerge(base, incoming) {` |
| 180 | function | `loadJson` | `function loadJson(file, fallback) {` |
| 195 | function | `saveJson` | `function saveJson(file, data) {` |
| 205 | function | `saveState` | `function saveState() { saveJson(STATE_FILE, state); }` |
| 206 | function | `saveBans` | `function saveBans() { saveJson(BANS_FILE, bans); }` |
| 208 | function | `reloadAllConfig` | `function reloadAllConfig() {` |
| 218 | function | `msg` | `function msg(key, vars = {}) {` |
| 225 | function | `todayKey` | `function todayKey() { return core.nowIso().slice(0, 10); }` |
| 226 | function | `monthKey` | `function monthKey() { return core.nowIso().slice(0, 7); }` |
| 228 | function | `normalizeUsageDate` | `function normalizeUsageDate() {` |
| 251 | function | `getRequestData` | `function getRequestData(req) {` |
| 255 | function | `toBool` | `function toBool(value) {` |
| 259 | function | `resolveRole` | `function resolveRole(data) {` |
| 270 | function | `sanitizeText` | `function sanitizeText(raw) {` |
| 286 | function | `makeId` | `function makeId() {` |
| 291 | function | `roleConfig` | `function roleConfig(role) {` |
| 295 | function | `voiceConfig` | `function voiceConfig(voiceId) {` |
| 300 | function | `userKey` | `function userKey(data) {` |
| 304 | function | `displayName` | `function displayName(data) {` |
| 308 | function | `normalizeLogin` | `function normalizeLogin(value) {` |
| 312 | function | `parseRawInput` | `function parseRawInput(data) {` |
| 320 | function | `parseCommand` | `function parseCommand(raw) {` |
| 331 | function | `canRunSubcommand` | `function canRunSubcommand(role, command, actorLogin) {` |
| 348 | function | `checkCooldown` | `function checkCooldown(role, user) {` |
| 374 | function | `touchCooldown` | `function touchCooldown(role, user) {` |
| 381 | function | `isMuted` | `function isMuted(user) {` |
| 386 | function | `isBanned` | `function isBanned(user) {` |
| 391 | function | `canUseGoogle` | `function canUseGoogle(chars) {` |
| 404 | function | `addUsage` | `function addUsage(engine, chars) {` |
| 418 | function | `googleAvailable` | `function googleAvailable(vc) {` |
| 425 | function | `piperAvailable` | `function piperAvailable(vc) {` |
| 432 | async function | `synthesizeGoogle` | `async function synthesizeGoogle(item, voiceId, vc) {` |
| 466 | async function | `synthesizePiper` | `async function synthesizePiper(item, voiceId, vc) {` |
| 493 | async function | `synthesize` | `async function synthesize(item) {` |
| 518 | function | `publicItem` | `function publicItem(item) {` |
| 533 | function | `publicStatus` | `function publicStatus() {` |
| 558 | function | `broadcastState` | `function broadcastState() {` |
| 562 | function | `sortQueue` | `function sortQueue() {` |
| 569 | async function | `startNext` | `async function startNext() {` |
| 604 | function | `enqueue` | `function enqueue(item) {` |
| 610 | function | `sayWithData` | `function sayWithData(data) {` |
| 690 | function | `done` | `function done(req, res) {` |
| 704 | function | `setEnabled` | `function setEnabled(value) {` |
| 710 | function | `stopCurrent` | `function stopCurrent() {` |
| 718 | function | `clearQueue` | `function clearQueue(stopAlso) {` |
| 724 | function | `formatNameList` | `function formatNameList(obj, emptyText) {` |
| 731 | function | `splitTargetAndReason` | `function splitTargetAndReason(rest) {` |
| 738 | function | `handleSubcommand` | `function handleSubcommand(command, rest, data) {` |
| 886 | function | `run` | `function run(req, res) {` |
| 902 | function | `cleanupGeneratedFiles` | `function cleanupGeneratedFiles() {` |

## `backend/modules/twitch_chat_overlay.js`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 13 | module export | `init` | `module.exports.init = function init(ctx) {` |
| 22 | const function | `BOT_USERNAME` | `const BOT_USERNAME = (env.TWITCH_BOT_USERNAME \|\| '').toString().trim().toLowerCase();` |
| 23 | const function | `BOT_CHANNEL` | `const BOT_CHANNEL = (env.TWITCH_BOT_CHANNEL \|\| '').toString().trim().replace(/^#/, '').toLowerCase();` |
| 28 | const function | `IGNORE_USERS` | `const IGNORE_USERS = (env.START_OVERLAY_CHAT_IGNORE_USERS \|\| 'streamelements,streamlabs,nightbot')` |
| 33 | const function | `TWITCH_CLIENT_ID` | `const TWITCH_CLIENT_ID = (env.TWITCH_BOT_CLIENT_ID \|\| env.TWITCH_CLIENT_ID \|\| '').toString().trim();` |
| 34 | const function | `BROADCASTER_ID_ENV` | `const BROADCASTER_ID_ENV = (env.TWITCH_BROADCASTER_ID \|\| '').toString().trim();` |
| 75 | function | `isIgnoredUser` | `function isIgnoredUser(name) {` |
| 81 | function | `broadcast` | `function broadcast(payload) {` |
| 87 | function | `emoteUrl` | `function emoteUrl(id, scale = '2.0') {` |
| 92 | function | `normalizeEmoteName` | `function normalizeEmoteName(name) {` |
| 96 | function | `pickEmoteImage` | `function pickEmoteImage(item) {` |
| 109 | function | `storeEmote` | `function storeEmote(item, source) {` |
| 130 | async function | `getBotAccessToken` | `async function getBotAccessToken() {` |
| 139 | async function | `resolveBroadcasterId` | `async function resolveBroadcasterId() {` |
| 160 | async function | `helixGet` | `async function helixGet(pathname, params = {}) {` |
| 182 | async function | `loadTwitchEmotes` | `async function loadTwitchEmotes(force = false) {` |
| 238 | function | `publicEmoteStatus` | `function publicEmoteStatus() {` |
| 251 | function | `unescapeIrcTagValue` | `function unescapeIrcTagValue(value) {` |
| 260 | function | `parseTags` | `function parseTags(rawTags) {` |
| 275 | function | `parseIrcLine` | `function parseIrcLine(line) {` |
| 307 | function | `loginFromPrefix` | `function loginFromPrefix(prefix) {` |
| 313 | function | `parseEmoteTag` | `function parseEmoteTag(emoteTag, text) {` |
| 346 | function | `buildSegmentsFromKnownNames` | `function buildSegmentsFromKnownNames(text) {` |
| 406 | function | `buildSegments` | `function buildSegments(text, emoteTag) {` |
| 446 | function | `addChatItem` | `function addChatItem(item) {` |
| 464 | function | `handlePrivmsg` | `function handlePrivmsg(parsed) {` |
| 469 | const function | `login` | `const login = (tags['login'] \|\| loginFromPrefix(parsed.prefix) \|\| '').toString().toLowerCase();` |
| 491 | function | `cleanupTimers` | `function cleanupTimers() {` |
| 502 | function | `scheduleReconnect` | `function scheduleReconnect(reason) {` |
| 515 | function | `sendRaw` | `function sendRaw(line) {` |
| 523 | async function | `startConnection` | `async function startConnection(trigger = 'manual') {` |
| 545 | const function | `fail` | `const fail = (err) => {` |
| 638 | async function | `stopConnection` | `async function stopConnection(trigger = 'manual') {` |
| 661 | function | `clearChat` | `function clearChat() {` |
| 666 | function | `publicStatus` | `function publicStatus() {` |
| 698 | function | `sendSnapshot` | `function sendSnapshot(ws) {` |
| 761 | function | `lookupEmoteByName` | `function lookupEmoteByName(nameInput) {` |

## `backend/modules/twitch_presence.js`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 9 | module export | `sendChatMessage` | `module.exports.sendChatMessage = async function sendChatMessage(message, options = {}) {` |
| 16 | module export | `getPresenceStatus` | `module.exports.getPresenceStatus = function getPresenceStatus() {` |
| 23 | module export | `init` | `module.exports.init = function init(ctx) {` |
| 28 | const function | `BOT_USERNAME` | `const BOT_USERNAME = (env.TWITCH_BOT_USERNAME \|\| '').toString().trim().toLowerCase();` |
| 29 | const function | `BOT_CHANNEL` | `const BOT_CHANNEL = (env.TWITCH_BOT_CHANNEL \|\| '').toString().trim().toLowerCase();` |
| 30 | const function | `BOT_CLIENT_ID` | `const BOT_CLIENT_ID = (env.TWITCH_BOT_CLIENT_ID \|\| '').toString().trim();` |
| 31 | const function | `BOT_CLIENT_SECRET` | `const BOT_CLIENT_SECRET = (env.TWITCH_BOT_CLIENT_SECRET \|\| '').toString().trim();` |
| 33 | const function | `JOIN_MESSAGE` | `const JOIN_MESSAGE = (env.TWITCH_BOT_JOIN_MESSAGE \|\| '').toString();` |
| 43 | function | `readJSON` | `function readJSON(file, fallback = null) {` |
| 52 | function | `writeJSON` | `function writeJSON(file, obj) {` |
| 62 | const function | `epoch` | `const epoch = () => Math.floor(Date.now() / 1000);` |
| 64 | async function | `refreshBotTokens` | `async function refreshBotTokens(refreshToken) {` |
| 82 | function | `getStoredBotToken` | `function getStoredBotToken() {` |
| 88 | async function | `getBotAccessTokenWithRefresh` | `async function getBotAccessTokenWithRefresh() {` |
| 125 | function | `cleanupTimers` | `function cleanupTimers() {` |
| 136 | function | `resetStateForSocketClose` | `function resetStateForSocketClose() {` |
| 143 | function | `scheduleReconnect` | `function scheduleReconnect(reason) {` |
| 159 | function | `startPingLoop` | `function startPingLoop() {` |
| 172 | function | `safeCloseSocket` | `function safeCloseSocket() {` |
| 188 | function | `maybeSendJoinMessage` | `function maybeSendJoinMessage(socket, trigger) {` |
| 204 | function | `sanitizeOutgoingChatMessage` | `function sanitizeOutgoingChatMessage(message) {` |
| 210 | async function | `sendChatMessageInternal` | `async function sendChatMessageInternal(message, options = {}) {` |
| 252 | async function | `startConnectionInternal` | `async function startConnectionInternal(trigger = 'manual') {` |
| 290 | const function | `fail` | `const fail = (err) => {` |
| 395 | async function | `stopConnectionInternal` | `async function stopConnectionInternal(trigger = 'manual') {` |
| 418 | async function | `handlePresenceStart` | `async function handlePresenceStart(req, res) {` |
| 433 | async function | `handlePresenceStop` | `async function handlePresenceStop(req, res) {` |
| 448 | async function | `handlePresenceSend` | `async function handlePresenceSend(req, res) {` |
| 459 | function | `buildPresenceStatus` | `function buildPresenceStatus() {` |
| 493 | function | `handlePresenceStatus` | `function handlePresenceStatus(req, res) {` |

## `backend/modules/twitch.js`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 59 | module export | `init` | `module.exports.init = function init(ctx) {` |
| 66 | const function | `TW_OAUTH_SCOPES` | `const TW_OAUTH_SCOPES = (env.TWITCH_OAUTH_SCOPES \|\|` |
| 74 | const function | `TW_BOT_USERNAME` | `const TW_BOT_USERNAME = (env.TWITCH_BOT_USERNAME \|\| '').toString().trim().toLowerCase();` |
| 75 | const function | `TW_BOT_CHANNEL` | `const TW_BOT_CHANNEL = (env.TWITCH_BOT_CHANNEL \|\| '').toString().trim().toLowerCase();` |
| 76 | const function | `TW_BOT_OAUTH_SCOPES` | `const TW_BOT_OAUTH_SCOPES = (env.TWITCH_BOT_OAUTH_SCOPES \|\| 'chat:read chat:edit')` |
| 98 | const function | `DEFAULT_BROADCASTER_ID` | `const DEFAULT_BROADCASTER_ID = (env.TWITCH_BROADCASTER_ID \|\| '').toString().trim();` |
| 113 | function | `cacheFileFor` | `function cacheFileFor(broadcasterId) {` |
| 117 | function | `eventCacheFileFor` | `function eventCacheFileFor(name) {` |
| 121 | function | `writeEventCache` | `function writeEventCache(name, payload) {` |
| 131 | function | `readEventCache` | `function readEventCache(name) {` |
| 136 | function | `ensureDir` | `function ensureDir(filePath){try{core.ensureParentDir(filePath);return true;}catch(e){console.warn('[OAUTH] ensureDir error:',e?.message\|\|e);return false;}}` |
| 137 | function | `mergePlainObject` | `function mergePlainObject(base, extra) {` |
| 150 | function | `ensureTwitchAlertSettingsTable` | `function ensureTwitchAlertSettingsTable() {` |
| 162 | function | `getTwitchAlertSettingsFromDb` | `function getTwitchAlertSettingsFromDb() {` |
| 174 | function | `saveTwitchAlertSettingsToDb` | `function saveTwitchAlertSettingsToDb(value) {` |
| 185 | function | `readTwitchAlertFileFallback` | `function readTwitchAlertFileFallback() {` |
| 196 | function | `loadTwitchAlertBridgeConfig` | `function loadTwitchAlertBridgeConfig() {` |
| 218 | function | `updateTwitchAlertBridgeConfig` | `function updateTwitchAlertBridgeConfig(input) {` |
| 226 | function | `rememberTwitchAlertBridge` | `function rememberTwitchAlertBridge(entry) {` |
| 231 | function | `readJSON` | `function readJSON(file,fallback=null){return core.readJson(file, fallback);}` |
| 232 | function | `writeJSON` | `function writeJSON(file,obj){try{core.writeJson(file,obj);return true;}catch(e){console.warn('[OAUTH] writeJSON error:',e?.message\|\|e);return false;}}` |
| 233 | const function | `epoch` | `const epoch = () => Math.floor(Date.now()/1000);` |
| 235 | async function | `exchangeCodeForTokens` | `async function exchangeCodeForTokens(code){` |
| 241 | async function | `exchangeCodeForTokensCustom` | `async function exchangeCodeForTokensCustom(code, clientId, clientSecret, redirectUri){` |
| 257 | async function | `refreshTokens` | `async function refreshTokens(refresh_token){` |
| 263 | async function | `refreshBotTokens` | `async function refreshBotTokens(refresh_token){` |
| 269 | function | `getStoredUserToken` | `function getStoredUserToken(){const d=readJSON(TOKEN_STORE,null);if(!d\|\|!d.access_token\|\|!d.expires_at)return null;return d;}` |
| 270 | function | `getStoredBotToken` | `function getStoredBotToken(){const d=readJSON(BOT_TOKEN_STORE,null);if(!d\|\|!d.access_token\|\|!d.expires_at)return null;return d;}` |
| 271 | async function | `getUserAccessTokenWithRefresh` | `async function getUserAccessTokenWithRefresh(){const s=getStoredUserToken();if(!s)return null;const now=epoch();if(s.expires_at&&now<s.expires_at-60)return s.access_token;if(s.refresh_token){try{const upd=await refreshTokens(s.refresh_token);writeJSON(TOKEN_STORE,upd);return upd.access_token;}catch(e){console.warn('[OAUTH] refresh failed:',e?.response?.data\|\|e?.message\|\|e);return null;}}return null;}` |
| 272 | async function | `getBotAccessTokenWithRefresh` | `async function getBotAccessTokenWithRefresh(){const s=getStoredBotToken();if(!s)return null;const now=epoch();if(s.expires_at&&now<s.expires_at-60)return s.access_token;if(s.refresh_token){try{const upd=await refreshBotTokens(s.refresh_token);writeJSON(BOT_TOKEN_STORE,upd);return upd.access_token;}catch(e){console.warn('[BOT OAUTH] refresh failed:',e?.response?.data\|\|e?.message\|\|e);return null;}}return null;}` |
| 274 | async function | `getAppAccessToken` | `async function getAppAccessToken(){if(!TW_CLIENT_ID\|\|!TW_CLIENT_SECRET){console.warn('[TWITCH] Missing TWITCH_CLIENT_ID/SECRET. Helix calls will fail.');throw new Error('Missing TWITCH_CLIENT_ID / TWITCH_CLIENT_SECRET');}const now=epoch();if(__app_access&&now<__app_exp-60)return __app_access;const r=await axios.post('https://id.twitch.tv/oauth2/token',null,{params:{client_id:TW_CLIENT_ID,client_secret:TW_CLIENT_SECRET,grant_type:'client_credentials'}});__app_access=r.data.access_token;__app_exp=now+Number(r.data.expires_in\|\|0);return __app_access;}` |
| 275 | async function | `getAccessToken` | `async function getAccessToken(){const user=await getUserAccessTokenWithRefresh();if(user)return user;if(env.TWITCH_ACCESS_TOKEN&&env.TWITCH_ACCESS_TOKEN.length>0)return env.TWITCH_ACCESS_TOKEN;return await getAppAccessToken();}` |
| 276 | function | `helixHeaders` | `function helixHeaders(token){if(!TW_CLIENT_ID)throw new Error('Missing TWITCH_CLIENT_ID header value');return {'Client-ID':TW_CLIENT_ID,Authorization:\`Bearer ${token}\`};}` |
| 277 | async function | `helixGet` | `async function helixGet(pathname,params){const token=await getAccessToken();const url=new URL('https://api.twitch.tv/helix'+pathname);Object.entries(params\|\|{}).forEach(([k,v])=>{if(v!==undefined&&v!==null&&v!=='')url.searchParams.set(k,v);});const r=await axios.get(url.toString(),{headers:helixHeaders(token)});return r.data;}` |
| 278 | async function | `helixPost` | `async function helixPost(pathname, body){` |
| 285 | async function | `helixDelete` | `async function helixDelete(pathname, params){` |
| 295 | async function | `resolveUserByLoginInternal` | `async function resolveUserByLoginInternal(loginInput) {` |
| 296 | const function | `login` | `const login = (loginInput \|\| '').toString().trim().replace(/^@/, '').toLowerCase();` |
| 466 | const function | `handleUserInfo` | `const handleUserInfo = async (req, res) => {` |
| 476 | const function | `handleUserById` | `const handleUserById = async (req, res) => {` |
| 486 | const function | `handleResolveUser` | `const handleResolveUser = async (req, res) => {` |
| 498 | const function | `handleStreamInfo` | `const handleStreamInfo = async (req, res) => {` |
| 511 | const function | `handleChannelInfo` | `const handleChannelInfo = async (req, res) => {` |
| 521 | const function | `handleChannelSummary` | `const handleChannelSummary = async (req, res) => {` |
| 555 | const function | `handleStreamSummary` | `const handleStreamSummary = async (req, res) => {` |
| 599 | const function | `handleChatSettings` | `const handleChatSettings = async (req, res) => {` |
| 611 | const function | `handleChatters` | `const handleChatters = async (req, res) => {` |
| 623 | const function | `handleGoals` | `const handleGoals = async (req, res) => {` |
| 633 | const function | `handleSchedule` | `const handleSchedule = async (req, res) => {` |
| 648 | const function | `handlePolls` | `const handlePolls = async (req, res) => {` |
| 658 | const function | `handlePredictions` | `const handlePredictions = async (req, res) => {` |
| 710 | const function | `handler` | `const handler = async (req, res) => {` |
| 723 | const function | `handleEventSubCache` | `const handleEventSubCache = (req, res) => {` |
| 731 | const function | `handleEventSubCacheAll` | `const handleEventSubCacheAll = (req, res) => {` |
| 748 | const function | `handleHypetrainCache` | `const handleHypetrainCache = (req, res) => {` |
| 797 | const function | `handleHypetrainCacheRaw` | `const handleHypetrainCacheRaw = (req, res) => {` |
| 847 | const function | `kind` | `const kind = (req.query.type \|\| 'bits').toString();` |
| 900 | function | `eventSubReadyStateName` | `function eventSubReadyStateName(socket) {` |
| 909 | function | `rememberEventSubState` | `function rememberEventSubState(entry) {` |
| 914 | function | `getEventSubStatusSnapshot` | `function getEventSubStatusSnapshot() {` |
| 1040 | function | `normalizeEventSubCondition` | `function normalizeEventSubCondition(condition) {` |
| 1049 | function | `eventSubKey` | `function eventSubKey(type, version, condition) {` |
| 1053 | function | `isEnabledEventSubForSession` | `function isEnabledEventSubForSession(sub, sessionId) {` |
| 1059 | function | `rebuildKnownEventSubSubscriptions` | `function rebuildKnownEventSubSubscriptions(subscriptions, sessionId) {` |
| 1071 | async function | `listEventSubSubscriptions` | `async function listEventSubSubscriptions() {` |
| 1088 | async function | `createEventSubSubscription` | `async function createEventSubSubscription(config, sessionId, broadcasterId){` |
| 1126 | async function | `bootstrapEventSubSubscriptions` | `async function bootstrapEventSubSubscriptions(sessionId, broadcasterId) {` |
| 1147 | function | `writeHypetrainCacheFromEndEvent` | `function writeHypetrainCacheFromEndEvent(broadcasterId, event){` |
| 1172 | function | `cacheGenericEvent` | `function cacheGenericEvent(sub, event) {` |
| 1180 | function | `twitchAlertKindForSubscription` | `function twitchAlertKindForSubscription(subscriptionType) {` |
| 1191 | function | `cleanEventText` | `function cleanEventText(value) {` |
| 1200 | function | `normalizeTwitchEventSubToAlert` | `function normalizeTwitchEventSubToAlert(subscriptionType, event) {` |
| 1250 | async function | `forwardAlertPayloadToAlertSystem` | `async function forwardAlertPayloadToAlertSystem(alertPayload, subscriptionType) {` |
| 1285 | function | `buildFakeTwitchAlertEvent` | `function buildFakeTwitchAlertEvent(kind, query) {` |
| 1286 | const function | `user` | `const user = (query.user \|\| query.login \|\| 'TestUser').toString();` |
| 1287 | const function | `display` | `const display = (query.display \|\| query.user \|\| 'TestUser').toString();` |
| 1298 | function | `scheduleEventSubReconnect` | `function scheduleEventSubReconnect(reason) {` |
| 1317 | function | `closeSocketQuietly` | `function closeSocketQuietly(socket, reason = 'normal') {` |
| 1329 | function | `connectEventSubWebSocket` | `function connectEventSubWebSocket(url = EVENTSUB_NORMAL_URL, isTwitchReconnect = false) {` |
| 1466 | const function | `broadcasterId` | `const broadcasterId = (event?.broadcaster_user_id \|\| DEFAULT_BROADCASTER_ID \|\| '').toString();` |
| 1527 | const function | `handleEventSubStatus` | `const handleEventSubStatus = async (req, res) => {` |
| 1546 | const function | `handleEventSubReconcile` | `const handleEventSubReconcile = async (req, res) => {` |
| 1594 | const function | `handleEventSubCleanupDisconnected` | `const handleEventSubCleanupDisconnected = async (req, res) => {` |
| 1641 | const function | `handleEventSubReconnect` | `const handleEventSubReconnect = (req, res) => {` |
| 1677 | module export | `resolveUserByLogin` | `module.exports.resolveUserByLogin = async function resolveUserByLogin(login) {` |
| 1684 | module export | `getStoredBotToken` | `module.exports.getStoredBotToken = function getStoredBotToken() {` |
| 1691 | module export | `getBotAccessTokenWithRefresh` | `module.exports.getBotAccessTokenWithRefresh = async function getBotAccessTokenWithRefresh() {` |

## `backend/modules/vip_sound_overlay.js`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 8 | module export | `init` | `module.exports.init = function init(ctx) {` |
| 42 | function | `emptyOverlay` | `function emptyOverlay() {` |
| 66 | function | `nowIso` | `function nowIso() {` |
| 70 | function | `publicState` | `function publicState() {` |
| 84 | function | `emitState` | `function emitState(reason) {` |
| 95 | function | `fail` | `function fail(res, status, message) {` |
| 99 | function | `requiredString` | `function requiredString(v, name) {` |
| 100 | const function | `s` | `const s = (v ?? "").toString().trim();` |
| 105 | function | `bodyOrQuery` | `function bodyOrQuery(req, key) {` |
| 109 | function | `intOrDefault` | `function intOrDefault(v, d) {` |
| 114 | function | `normalizeWinPath` | `function normalizeWinPath(p) {` |
| 118 | function | `fileExistsSafe` | `function fileExistsSafe(p) {` |
| 126 | function | `toBrowserAudioUrl` | `function toBrowserAudioUrl(soundPath) {` |
| 139 | function | `makeRequestId` | `function makeRequestId() {` |
| 143 | function | `normalizeSoundType` | `function normalizeSoundType(raw) {` |
| 144 | const function | `t` | `const t = (raw \|\| "").toString().trim().toLowerCase();` |
| 149 | function | `buildQueuedChatMessage` | `function buildQueuedChatMessage(item, queuePosition) {` |
| 155 | function | `buildOverlayTitle` | `function buildOverlayTitle(soundType) {` |
| 159 | function | `buildOverlayText` | `function buildOverlayText(soundType, displayName) {` |
| 182 | function | `beautifyDisplayName` | `function beautifyDisplayName(name) {` |
| 183 | const function | `s` | `const s = (name \|\| "").toString().trim();` |
| 189 | function | `httpGetJson` | `function httpGetJson(url) {` |
| 221 | async function | `fetchUserInfo` | `async function fetchUserInfo(loginOrDisplayName) {` |
| 222 | const function | `key` | `const key = (loginOrDisplayName \|\| "").toString().trim().toLowerCase();` |
| 257 | async function | `normalizeItem` | `async function normalizeItem(raw) {` |
| 258 | const function | `loginRaw` | `const loginRaw = (raw.login \|\| "").toString().trim();` |
| 259 | const function | `displayRaw` | `const displayRaw = (raw.displayName \|\| "").toString().trim();` |
| 260 | const function | `titleRaw` | `const titleRaw = (raw.title \|\| "").toString().trim();` |
| 261 | const function | `textRaw` | `const textRaw = (raw.text \|\| "").toString().trim();` |
| 262 | const function | `avatarRaw` | `const avatarRaw = (raw.avatarUrl \|\| "").toString().trim();` |
| 273 | const function | `resolvedLogin` | `const resolvedLogin = ((info && info.login) \|\| loginRaw \|\| displayRaw).toString().trim().toLowerCase();` |
| 280 | const function | `resolvedAvatar` | `const resolvedAvatar = ((info && info.avatarUrl) \|\| avatarRaw \|\| "").toString().trim();` |
| 302 | function | `startNextIfIdle` | `function startNextIfIdle() {` |
| 333 | async function | `enqueue` | `async function enqueue(raw) {` |
| 353 | function | `markClientSeen` | `function markClientSeen() {` |
| 361 | function | `registerApiPrefix` | `function registerApiPrefix(prefix) {` |
| 449 | const function | `requestId` | `const requestId = (bodyOrQuery(req, "requestId") \|\| "").toString().trim();` |
| 461 | const function | `requestId` | `const requestId = (bodyOrQuery(req, "requestId") \|\| "").toString().trim();` |
| 474 | const function | `requestId` | `const requestId = (bodyOrQuery(req, "requestId") \|\| "").toString().trim();` |

## `backend/server.js`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 36 | function | `blockInternalPath` | `function blockInternalPath(req, res) {` |
| 97 | function | `broadcastWS` | `function broadcastWS(payload) {` |

## `htdocs/dashboard/app.js`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 124 | function | `openNavGroup` | `function openNavGroup(groupId){` |
| 170 | function | `applyTheme` | `function applyTheme(theme){` |
| 184 | function | `applyNav` | `function applyNav(value){` |

## `htdocs/dashboard/modules/adminconfigs.js`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 27 | function | `ensureSoundExpertConfig` | `function ensureSoundExpertConfig(registry){` |
| 35 | function | `esc` | `function esc(value){ return window.CGN.esc(value ?? ''); }` |
| 36 | function | `num` | `function num(value, fallback){ const n = Number(value); return Number.isFinite(n) ? n : fallback; }` |
| 37 | function | `csv` | `function csv(value, fallback){ return Array.isArray(value) ? value.join(', ') : (Array.isArray(fallback) ? fallback.join(', ') : ''); }` |
| 38 | function | `readText` | `function readText(id, fallback){` |
| 43 | function | `readNumber` | `function readNumber(id, fallback, min, max){` |
| 49 | function | `readCsv` | `function readCsv(id, fallback){` |
| 55 | function | `option` | `function option(value, current, label){` |
| 59 | async function | `loadRegistry` | `async function loadRegistry(){ try { state.registry = ensureSoundExpertConfig(await window.CGN.api('/api/dashboard/controlcenter/admin-configs')); } catch (_) { state.registry = ensureSoundExpertConfig(fallbackRegistry); } }` |
| 60 | async function | `loadConfig` | `async function loadConfig(id){` |
| 81 | function | `getConfigs` | `function getConfigs(){ return Array.isArray(state.registry?.configs) ? state.registry.configs : fallbackRegistry.configs; }` |
| 82 | function | `getSecrets` | `function getSecrets(){ return Array.isArray(state.registry?.secrets) ? state.registry.secrets : fallbackRegistry.secrets; }` |
| 83 | function | `selectedItem` | `function selectedItem(){ return getConfigs().find(c => c.id === state.selectedId) \|\| getConfigs()[0]; }` |
| 84 | function | `pretty` | `function pretty(value){ try { return JSON.stringify(value ?? {}, null, 2); } catch (_) { return '{}'; } }` |
| 85 | function | `select` | `function select(id){ state.selectedId = id; loadConfig(id); }` |
| 87 | function | `renderSoundExpertConfig` | `function renderSoundExpertConfig(payload){` |
| 155 | async function | `saveSoundExpertConfig` | `async function saveSoundExpertConfig(){` |
| 194 | function | `renderPreview` | `function renderPreview(id, payload){` |
| 211 | function | `render` | `function render(){` |
| 226 | async function | `loadAll` | `async function loadAll(){ await loadRegistry(); if (!state.selectedConfig) await loadConfig(state.selectedId); else render(); }` |

## `htdocs/dashboard/modules/alerts.js`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 48 | const arrow | `esc` | `const esc = v => CGN.esc(v);` |
| 49 | const arrow | `escClass` | `const escClass = v => String(v ?? "").toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+\|-+$/g, "") \|\| "default";` |
| 50 | const function | `opt` | `const opt = (value,label,selected) => \`<option value="${esc(value)}" ${String(value)===String(selected)?'selected':''}>${esc(label)}</option>\`;` |
| 51 | const function | `pill` | `const pill = (text, cls='') => \`<span class="pill ${cls}">${esc(text)}</span>\`;` |
| 52 | const arrow | `fmtMs` | `const fmtMs = ms => {` |
| 56 | const arrow | `bytes` | `const bytes = n => {` |
| 62 | const arrow | `empty` | `const empty = v => v === null \|\| v === undefined ? '' : v;` |
| 64 | function | `parseChatTexts` | `function parseChatTexts(value){` |
| 79 | function | `ensureStep169Styles` | `function ensureStep169Styles(){` |
| 138 | async function | `loadAll` | `async function loadAll(keepNote=false){` |
| 169 | function | `sourceSort` | `function sourceSort(a,b){` |
| 174 | function | `sources` | `function sources(includeAll=true){` |
| 182 | function | `availableTypes` | `function availableTypes(source){` |
| 195 | function | `typeOrder` | `function typeOrder(source, typeKey){` |
| 200 | function | `typeLabel` | `function typeLabel(typeKey){` |
| 204 | function | `compactTypeLabel` | `function compactTypeLabel(r){` |
| 209 | function | `rangeText` | `function rangeText(r){` |
| 215 | function | `visibleRules` | `function visibleRules(){` |
| 222 | function | `ruleSort` | `function ruleSort(a,b){` |
| 233 | function | `numericRangeValue` | `function numericRangeValue(r){` |
| 239 | function | `sortArrow` | `function sortArrow(key){` |
| 244 | function | `sortableTh` | `function sortableTh(key, label, cls=''){` |
| 248 | function | `rulesColgroup` | `function rulesColgroup(){` |
| 252 | function | `typeOptionsForSource` | `function typeOptionsForSource(source, selected, includeCurrent=true){` |
| 260 | function | `effectiveDurationMs` | `function effectiveDurationMs(r){` |
| 274 | function | `compareRulesForCurrentSort` | `function compareRulesForCurrentSort(a,b){` |
| 296 | function | `sortRulesForView` | `function sortRulesForView(list){` |
| 301 | function | `ensureSoundPreviewStyles` | `function ensureSoundPreviewStyles(){` |
| 322 | function | `render` | `function render(){` |
| 335 | function | `noteHtml` | `function noteHtml(){` |
| 341 | function | `topTabs` | `function topTabs(){` |
| 357 | function | `pageHtml` | `function pageHtml(){` |
| 370 | function | `overviewPage` | `function overviewPage(){` |
| 390 | function | `statusCard` | `function statusCard(title, metric, sub, cls){` |
| 394 | function | `compactRulesTable` | `function compactRulesTable(){` |
| 399 | function | `rulesPage` | `function rulesPage(){` |
| 411 | function | `groupedRulesHtml` | `function groupedRulesHtml(){` |
| 431 | function | `filtersHtml` | `function filtersHtml(){` |
| 437 | function | `ruleRow` | `function ruleRow(r, compact){` |
| 457 | function | `durationText` | `function durationText(r){` |
| 467 | function | `assetInline` | `function assetInline(label, url){` |
| 473 | function | `soundAssetById` | `function soundAssetById(id){` |
| 478 | function | `selectedSoundUrl` | `function selectedSoundUrl(id){` |
| 483 | function | `displayProfileLabel` | `function displayProfileLabel(r){` |
| 493 | function | `profileInline` | `function profileInline(r){` |
| 499 | function | `selectedChatBlockIdForRule` | `function selectedChatBlockIdForRule(r){` |
| 507 | function | `chatBlockLabelForRule` | `function chatBlockLabelForRule(r){` |
| 510 | const function | `block` | `const block = (state.chatBlocks \|\| []).find(b => Number(b.id) === Number(id));` |
| 514 | function | `chatBlockInline` | `function chatBlockInline(r){` |
| 517 | const function | `block` | `const block = (state.chatBlocks \|\| []).find(b => Number(b.id) === Number(id));` |
| 523 | function | `chatBlockOptions` | `function chatBlockOptions(source, typeKey, selected){` |
| 524 | const function | `rows` | `const rows = (state.chatBlocks \|\| []).filter(b => Number(b.enabled ?? 1) === 1 && b.source === source && b.type_key === typeKey);` |
| 531 | function | `displayProfileOptions` | `function displayProfileOptions(selected, includeDefault){` |
| 556 | function | `placeholderChip` | `function placeholderChip(key){` |
| 561 | function | `placeholdersHtml` | `function placeholdersHtml(){` |
| 570 | function | `chatBlocksPage` | `function chatBlocksPage(){` |
| 572 | const function | `list` | `const list = (state.chatBlocks \|\| [])` |
| 593 | function | `designPage` | `function designPage(){` |
| 691 | function | `selectHtml` | `function selectHtml(key,label,value,items){ return \`<label>${esc(label)}<select data-display-key="${esc(key)}">${items.map(([v,l])=>opt(v,l,value)).join('')}</select></label>\`; }` |
| 692 | function | `colorHtml` | `function colorHtml(key,label,value){ return \`<label>${esc(label)}<input data-display-key="${esc(key)}" type="color" value="${esc(value \|\| '#c45cff')}"></label>\`; }` |
| 693 | function | `rangeHtml` | `function rangeHtml(key,label,value,min,max,step){ return \`<label>${esc(label)} <span class="range-value">${esc(value)}</span><input data-display-key="${esc(key)}" type="range" min="${esc(min)}" max="${esc(max)}" step="${esc(step)}" value="${esc(value)}"></label>\`; }` |
| 694 | function | `compactRangeHtml` | `function compactRangeHtml(key,label,value,min,max,step){ return \`<label class="compact-range"><span>${esc(label)}</span><b class="range-value">${esc(value)}</b><input data-display-key="${esc(key)}" type="range" min="${esc(min)}" max="${esc(max)}" step="${esc(step)}" value="${esc(value)}"></label>\`; }` |
| 696 | function | `imageAssetSelectItems` | `function imageAssetSelectItems(selected){` |
| 702 | function | `selectedImageAssetUrl` | `function selectedImageAssetUrl(id){` |
| 704 | const function | `a` | `const a = (state.assets \|\| []).find(x => Number(x.id) === Number(id));` |
| 709 | function | `designPreviewVariantOptions` | `function designPreviewVariantOptions(){` |
| 710 | const function | `variants` | `const variants = (state.textVariants \|\| []).filter(v => Number(v.enabled ?? 1) === 1);` |
| 719 | function | `selectedPreviewVariant` | `function selectedPreviewVariant(){` |
| 724 | function | `displaySimpleLabel` | `function displaySimpleLabel(value){` |
| 729 | function | `presetsPage` | `function presetsPage(){` |
| 747 | function | `assetsPage` | `function assetsPage(){` |
| 760 | function | `assetTable` | `function assetTable(kind){` |
| 769 | function | `assetRow` | `function assetRow(a){` |
| 778 | function | `assetUsageCount` | `function assetUsageCount(asset){` |
| 783 | function | `testsPage` | `function testsPage(){` |
| 800 | function | `historyPage` | `function historyPage(){` |
| 810 | function | `historyList` | `function historyList(limit, compact=false){` |
| 811 | const function | `items` | `const items = (state.status?.history \|\| []).slice(0, limit);` |
| 820 | function | `historyTable` | `function historyTable(){` |
| 821 | const function | `rows` | `const rows = (state.status?.history \|\| []).map(h => \`<tr>` |
| 833 | function | `amountText` | `function amountText(h){` |
| 838 | function | `formatDate` | `function formatDate(v){` |
| 845 | function | `configPage` | `function configPage(){` |
| 878 | function | `configInput` | `function configInput(key,label,value,type='text',wide=false){` |
| 882 | function | `configSelect` | `function configSelect(key,label,value,items){` |
| 887 | function | `readConfigForm` | `function readConfigForm(){` |
| 901 | function | `defaultRule` | `function defaultRule(){` |
| 913 | function | `defaultRuleForCurrentDesign` | `function defaultRuleForCurrentDesign(){` |
| 921 | function | `normalizeRule` | `function normalizeRule(rule){` |
| 936 | function | `modalHtml` | `function modalHtml(){` |
| 945 | function | `ruleModal` | `function ruleModal(){` |
| 949 | const function | `activeDurationText` | `const activeDurationText = (r.duration_mode \|\| 'fixed') === 'sound' ? calcSoundDurationText(r.sound_asset_id, r.duration_ms) : fmtMs(r.duration_ms ?? 7000);` |
| 950 | const function | `fixedHint` | `const fixedHint = (r.duration_mode \|\| 'fixed') === 'fixed' ? \`Aktiv: ${fmtMs(r.duration_ms ?? 7000)}\` : \`Nur Fallback: ${fmtMs(r.duration_ms ?? 7000)}\`;` |
| 951 | const function | `soundHint` | `const soundHint = (r.duration_mode \|\| 'fixed') === 'sound' ? \`Aktiv: ${calcSoundDurationText(r.sound_asset_id, r.duration_ms)}\` : 'Nicht aktiv';` |
| 1000 | function | `editLoadedSummary` | `function editLoadedSummary(r){` |
| 1015 | function | `variantModal` | `function variantModal(){` |
| 1040 | function | `chatBlockModal` | `function chatBlockModal(){` |
| 1059 | function | `normalizeChatTextRows` | `function normalizeChatTextRows(value){` |
| 1070 | function | `chatTextRowHtml` | `function chatTextRowHtml(text, index){` |
| 1074 | function | `presetModal` | `function presetModal(){` |
| 1093 | function | `uploadModal` | `function uploadModal(){` |
| 1109 | function | `assetOptions` | `function assetOptions(kind, selected){` |
| 1117 | function | `selectedSoundDuration` | `function selectedSoundDuration(id){` |
| 1123 | function | `calcSoundDurationText` | `function calcSoundDurationText(soundId, fallbackMs){` |
| 1133 | function | `readRuleForm` | `function readRuleForm(){` |
| 1171 | function | `isPlaceholderTextTarget` | `function isPlaceholderTextTarget(el){` |
| 1180 | function | `rememberPlaceholderTarget` | `function rememberPlaceholderTarget(el){` |
| 1184 | function | `bestPlaceholderTarget` | `function bestPlaceholderTarget(){` |
| 1191 | function | `insertTextAtCursor` | `function insertTextAtCursor(el, text){` |
| 1205 | function | `insertPlaceholderFromChip` | `function insertPlaceholderFromChip(chip){` |
| 1216 | function | `bind` | `function bind(){` |
| 1258 | const function | `handler` | `const handler = () => {` |
| 1398 | function | `updateDurationModeUi` | `function updateDurationModeUi(){` |
| 1406 | function | `updateDurationSoundInfo` | `function updateDurationSoundInfo(){` |
| 1416 | function | `updateRuleSoundButton` | `function updateRuleSoundButton(){` |
| 1430 | function | `normalizeSoundUrl` | `function normalizeSoundUrl(url){` |
| 1442 | function | `ensurePreviewAudio` | `function ensurePreviewAudio(){` |
| 1453 | function | `updateSoundButtonStates` | `function updateSoundButtonStates(){` |
| 1465 | function | `playSoundUrl` | `function playSoundUrl(url, btn){` |
| 1499 | function | `normalizeCropDefaultsOnEditorStart` | `function normalizeCropDefaultsOnEditorStart(settings){` |
| 1512 | function | `readDisplaySettings` | `function readDisplaySettings(){` |
| 1513 | const arrow | `get` | `const get = key => root.querySelector(\`[data-display-key="${key}"]\`)?.value;` |
| 1514 | const function | `num` | `const num = (key, fallback) => Number(get(key) \|\| fallback);` |
| 1519 | function | `setDisplayRangeValue` | `function setDisplayRangeValue(key, value){` |
| 1527 | function | `centerTopGraphicCrop` | `function centerTopGraphicCrop(){` |
| 1537 | function | `defaultDisplayProfileSettings` | `function defaultDisplayProfileSettings(){` |
| 1548 | function | `normalizeGraphicOutline` | `function normalizeGraphicOutline(value){` |
| 1554 | function | `findDisplayProfileNameDuplicate` | `function findDisplayProfileNameDuplicate(name, ignoreId){` |
| 1560 | function | `assertDisplayProfileName` | `function assertDisplayProfileName(name, ignoreId){` |
| 1568 | async function | `createDisplayProfile` | `async function createDisplayProfile(){` |
| 1584 | async function | `saveDisplayProfile` | `async function saveDisplayProfile(){` |
| 1605 | async function | `deleteDisplayProfile` | `async function deleteDisplayProfile(){` |
| 1619 | async function | `playDisplayProfilePreview` | `async function playDisplayProfilePreview(){` |
| 1629 | async function | `replayAlert` | `async function replayAlert(eventUid){` |
| 1636 | async function | `openEditRule` | `async function openEditRule(ruleId){` |
| 1667 | function | `readChatBlockForm` | `function readChatBlockForm(){` |
| 1679 | async function | `saveChatBlock` | `async function saveChatBlock(){` |
| 1689 | function | `readVariantForm` | `function readVariantForm(){` |
| 1709 | async function | `saveVariant` | `async function saveVariant(){` |
| 1719 | function | `readPresetForm` | `function readPresetForm(){` |
| 1735 | async function | `savePreset` | `async function savePreset(){` |
| 1745 | function | `rulePayloadFromState` | `function rulePayloadFromState(r, enabledOverride){` |
| 1777 | async function | `toggleRuleEnabled` | `async function toggleRuleEnabled(id){` |
| 1787 | async function | `saveRule` | `async function saveRule(){` |
| 1797 | async function | `testRule` | `async function testRule(id){` |
| 1815 | async function | `liveTestRule` | `async function liveTestRule(id){` |
| 1826 | function | `openRulePreviewPopout` | `function openRulePreviewPopout(){` |
| 1841 | function | `postRulePreviewAlert` | `function postRulePreviewAlert(alert){` |
| 1844 | const function | `send` | `const send = () => {` |
| 1855 | function | `buildRulePreviewAlert` | `function buildRulePreviewAlert(r){` |
| 1878 | const arrow | `tpl` | `const tpl = v => renderPreviewTemplate(v \|\| '', ctx);` |
| 1920 | function | `findPreviewVariantForRule` | `function findPreviewVariantForRule(r){` |
| 1921 | const function | `rows` | `const rows = (state.textVariants \|\| []).filter(v => Number(v.enabled ?? 1) === 1 && v.source === r.source && v.type_key === r.type_key);` |
| 1925 | function | `formatPreviewAmount` | `function formatPreviewAmount(amount, type, source){` |
| 1934 | function | `numOrNull` | `function numOrNull(id){ const v = document.getElementById(id)?.value; return v === '' \|\| v === undefined ? null : Number(v); }` |
| 1935 | function | `valOrNull` | `function valOrNull(id){ const v = document.getElementById(id)?.value; return v === '' \|\| v === undefined ? null : Number(v); }` |
| 1940 | function | `renderDesignPreview` | `function renderDesignPreview(){` |
| 1951 | function | `designPreviewMarkup` | `function designPreviewMarkup(st, popout){` |
| 1963 | function | `applyPreviewVars` | `function applyPreviewVars(el, st){` |
| 1977 | function | `previewViewportScale` | `function previewViewportScale(viewport, popout){` |
| 1984 | function | `previewCardBasePx` | `function previewCardBasePx(st){ return Math.round(Math.max(560, Math.min(1600, Number(st.cardWidthPx \|\| 1120)))); }` |
| 1985 | function | `previewCardEstimatedHeight` | `function previewCardEstimatedHeight(st){ return Math.round(Math.max(180, Math.min(520, Number(st.cardHeightPx \|\| 300)))); }` |
| 1986 | function | `previewPositionMetrics` | `function previewPositionMetrics(st){ return { x:Number(st.positionX \|\| 50), y:Number(st.positionY \|\| 50) }; }` |
| 1988 | function | `buildDashboardPreviewAlert` | `function buildDashboardPreviewAlert(st){` |
| 2005 | const function | `source` | `const source = (variant && variant.source) \|\| 'twitch';` |
| 2006 | const function | `type` | `const type = (variant && variant.type_key) \|\| 'bits';` |
| 2007 | const arrow | `tpl` | `const tpl = v => renderPreviewTemplate(v \|\| '', ctx);` |
| 2031 | function | `renderPreviewTemplate` | `function renderPreviewTemplate(template, ctx){` |
| 2038 | function | `postPreviewAlertToFrame` | `function postPreviewAlertToFrame(container, st){` |
| 2041 | const function | `send` | `const send = () => {` |
| 2049 | function | `openDesignPopout` | `function openDesignPopout(){` |
| 2060 | function | `updateDesignPopout` | `function updateDesignPopout(){` |

## `htdocs/dashboard/modules/controlhome.js`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 14 | function | `render` | `function render(){` |
| 41 | async function | `loadAll` | `async function loadAll(){ render(); }` |

## `htdocs/dashboard/modules/obs.js`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 59 | function | `dataOf` | `function dataOf(res){ return res && typeof res === 'object' && Object.prototype.hasOwnProperty.call(res, 'data') ? res.data : res; }` |
| 60 | function | `esc` | `function esc(v){ return window.CGN?.esc ? window.CGN.esc(v) : String(v ?? ''); }` |
| 61 | function | `isOnline` | `function isOnline(){ return !!(state.status && state.status.obsConnected); }` |
| 62 | function | `isDetected` | `function isDetected(){ return !!(state.status && state.status.obsDetected); }` |
| 63 | function | `time` | `function time(){ return new Date().toLocaleTimeString('de-DE', { hour:'2-digit', minute:'2-digit', second:'2-digit' }); }` |
| 64 | function | `sceneNameOf` | `function sceneNameOf(item){ return String(item?.sceneName \|\| item?.name \|\| '').trim(); }` |
| 65 | function | `isInternalScene` | `function isInternalScene(name){ return String(name \|\| '').trim().startsWith('_'); }` |
| 66 | function | `normalScenes` | `function normalScenes(){ return state.scenes.filter(item => { const name = sceneNameOf(item); return name && (!state.config.hideInternalScenesOnMain \|\| !isInternalScene(name)); }); }` |
| 67 | function | `internalScenes` | `function internalScenes(){ return state.scenes.filter(item => isInternalScene(sceneNameOf(item))); }` |
| 68 | function | `fastSeconds` | `function fastSeconds(){ return Math.round(Number(state.config.fastRefreshMs \|\| DEFAULT_CONFIG.fastRefreshMs) / 1000); }` |
| 69 | function | `fullSeconds` | `function fullSeconds(){ return Math.round(Number(state.config.fullRefreshMs \|\| DEFAULT_CONFIG.fullRefreshMs) / 1000); }` |
| 70 | function | `clampNumber` | `function clampNumber(value, min, max, fallback){ const n = Number(value); if (!Number.isFinite(n)) return fallback; return Math.min(max, Math.max(min, Math.round(n))); }` |
| 72 | function | `sanitizeLocalConfig` | `function sanitizeLocalConfig(input = {}) {` |
| 85 | function | `cleanRouteError` | `function cleanRouteError(err, fallback = 'Route nicht erreichbar') {` |
| 94 | async function | `optionalApi` | `async function optionalApi(path, fallback = null, options = {}){` |
| 99 | async function | `loadDashboardConfig` | `async function loadDashboardConfig() {` |
| 112 | async function | `saveDashboardConfig` | `async function saveDashboardConfig(payload) {` |
| 129 | async function | `loadAll` | `async function loadAll(loadConfigFirst = false){` |
| 175 | async function | `loadFullSilent` | `async function loadFullSilent(){` |
| 221 | async function | `loadFast` | `async function loadFast(){` |
| 244 | function | `updateFastView` | `function updateFastView(){` |
| 296 | function | `setText` | `function setText(selector, value){` |
| 301 | async function | `switchScene` | `async function switchScene(sceneName){` |
| 317 | async function | `saveReplay` | `async function saveReplay(){` |
| 329 | function | `aliasFor` | `function aliasFor(sceneName){` |
| 334 | function | `statsObj` | `function statsObj(){` |
| 338 | function | `streamObj` | `function streamObj(){` |
| 342 | function | `recordObj` | `function recordObj(){` |
| 346 | function | `replayObj` | `function replayObj(){` |
| 350 | function | `firstNumber` | `function firstNumber(...values){` |
| 358 | function | `fmtNumber` | `function fmtNumber(value, decimals = 0){` |
| 364 | function | `fmtCompact` | `function fmtCompact(value){` |
| 370 | function | `fmtPercent` | `function fmtPercent(value){` |
| 376 | function | `calcPercent` | `function calcPercent(part, total){` |
| 383 | function | `fmtDrop` | `function fmtDrop(value, percent){` |
| 393 | function | `fmtMs` | `function fmtMs(value){` |
| 399 | function | `fmtMb` | `function fmtMb(value){` |
| 405 | function | `fmtGb` | `function fmtGb(value){` |
| 411 | function | `fmtFps` | `function fmtFps(value){` |
| 417 | function | `buildPerf` | `function buildPerf(){` |
| 441 | function | `yesNo` | `function yesNo(active, yes='Aktiv', no='Inaktiv'){` |
| 445 | function | `render` | `function render(){` |
| 473 | function | `renderTabNav` | `function renderTabNav(){` |
| 477 | function | `renderStatusLine` | `function renderStatusLine(current, perf, streamActive, recordActive){` |
| 497 | function | `renderActivePanel` | `function renderActivePanel(ctx){` |
| 506 | function | `renderOverviewPanel` | `function renderOverviewPanel(ctx){` |
| 519 | function | `renderScenesPanel` | `function renderScenesPanel(ctx){` |
| 527 | function | `renderOverlaysPanel` | `function renderOverlaysPanel(ctx){` |
| 534 | function | `renderAudioPanel` | `function renderAudioPanel(ctx){` |
| 544 | function | `renderReplayPanel` | `function renderReplayPanel(ctx){` |
| 553 | function | `renderConfigPanel` | `function renderConfigPanel(){` |
| 559 | function | `renderBrowserSourceList` | `function renderBrowserSourceList(list){` |
| 568 | function | `bindCommonEvents` | `function bindCommonEvents(){` |
| 579 | function | `renderConfigEditor` | `function renderConfigEditor(){` |
| 593 | function | `collectAndSaveConfig` | `function collectAndSaveConfig(){` |
| 605 | function | `renderPerfStats` | `function renderPerfStats(perf){` |
| 618 | function | `renderOverviewStats` | `function renderOverviewStats(normal, internal, browserCount, sourceCount){` |
| 631 | function | `renderSceneCards` | `function renderSceneCards(current, scenes){` |
| 646 | function | `classifyScene` | `function classifyScene(name){` |
| 655 | function | `isObsModuleVisible` | `function isObsModuleVisible(){` |
| 662 | function | `resetRefreshTimers` | `function resetRefreshTimers(){` |
| 680 | async function | `init` | `async function init(){` |

## `htdocs/dashboard/modules/sound.js`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 15 | function | `esc` | `function esc(v){ return window.CGN?.esc ? window.CGN.esc(v) : String(v ?? ''); }` |
| 16 | async function | `api` | `async function api(path, options){ return window.CGN.api(API + path, options \|\| {}); }` |
| 17 | function | `button` | `function button(label, action, extraClass){ return \`<button type="button" class="${extraClass \|\| ''}" data-sound-action="${esc(action)}">${esc(label)}</button>\`; }` |
| 19 | function | `renderShell` | `function renderShell(){` |
| 62 | function | `render` | `function render(){` |
| 78 | function | `renderStatus` | `function renderStatus(){` |
| 95 | function | `getOutputState` | `function getOutputState(){` |
| 99 | function | `modeFlags` | `function modeFlags(mode){` |
| 105 | function | `renderOutput` | `function renderOutput(){` |
| 153 | function | `renderCurrent` | `function renderCurrent(){` |
| 172 | function | `renderPolicy` | `function renderPolicy(){` |
| 191 | function | `checked` | `function checked(value){ return value === false ? '' : 'checked'; }` |
| 192 | function | `numValue` | `function numValue(value, fallback){ const n = Number(value); return Number.isFinite(n) ? n : fallback; }` |
| 194 | function | `renderSettings` | `function renderSettings(){` |
| 212 | const arrow | `cat` | `const cat = key => categoryDefaults[key] \|\| {};` |
| 380 | function | `priorityField` | `function priorityField(label, id, value, fallback){` |
| 389 | function | `categoryRow` | `function categoryRow(label, suffix, prefix, data, fallbackPriority){` |
| 409 | function | `readNumber` | `function readNumber(id, fallback, min, max){` |
| 416 | function | `readBool` | `function readBool(id, fallback){` |
| 422 | async function | `saveRuntimeSettings` | `async function saveRuntimeSettings(){` |
| 434 | const arrow | `cat` | `const cat = key => categoryDefaults[key] \|\| {};` |
| 436 | function | `readCategory` | `function readCategory(prefix, data, fallbackPriority){` |
| 540 | function | `renderSounds` | `function renderSounds(){` |
| 560 | function | `renderQueue` | `function renderQueue(){` |
| 579 | async function | `saveOutput` | `async function saveOutput(){` |
| 610 | function | `applySoundSection` | `function applySoundSection(){` |
| 624 | function | `bindActions` | `function bindActions(){` |
| 657 | async function | `loadAll` | `async function loadAll(force){` |
| 675 | function | `mount` | `function mount(){` |

## `htdocs/dashboard/modules/streamdesk.js`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 39 | async function | `loadConfig` | `async function loadConfig(){` |
| 47 | async function | `loadStatus` | `async function loadStatus(){` |
| 55 | function | `cfg` | `function cfg(){` |
| 65 | function | `currentSceneName` | `function currentSceneName(){` |
| 70 | function | `obsConnected` | `function obsConnected(){` |
| 75 | async function | `postSceneSwitch` | `async function postSceneSwitch(endpoint, sceneName){` |
| 82 | async function | `switchScene` | `async function switchScene(sceneName, confirmSwitch){` |
| 108 | function | `normalizeLogin` | `function normalizeLogin(value){ return String(value \|\| '').trim().replace(/^@+/, '').replace(/[^a-zA-Z0-9_]/g, '').toLowerCase(); }` |
| 109 | function | `firstExisting` | `function firstExisting(obj, keys){ for (const key of keys) { const value = obj && obj[key]; if (value !== undefined && value !== null && value !== '') return value; } return ''; }` |
| 110 | function | `unwrapUserPayload` | `function unwrapUserPayload(payload){` |
| 119 | function | `endpointsForUserinfo` | `function endpointsForUserinfo(login){ const userCfg = cfg().userinfo \|\| {}; const endpoints = Array.isArray(userCfg.endpoints) && userCfg.endpoints.length ? userCfg.endpoints : fallbackConfig.userinfo.endpoints; return endpoints.map(endpoint => String(endpoint).replace('{login}', encodeURIComponent(login)).replace('{user}', encodeURIComponent(login))); }` |
| 120 | async function | `fetchUserinfo` | `async function fetchUserinfo(login){` |
| 128 | async function | `openUserinfoFromInput` | `async function openUserinfoFromInput(){` |
| 137 | function | `closeUserinfoModal` | `function closeUserinfoModal(){ state.userinfo.opened = false; render(); }` |
| 138 | function | `formatDate` | `function formatDate(value){ if (!value) return '—'; const d = new Date(value); if (Number.isNaN(d.getTime())) return String(value); return d.toLocaleString('de-DE', { dateStyle:'medium', timeStyle:'short' }); }` |
| 139 | function | `formatBool` | `function formatBool(value){ if (value === true \|\| value === 'true' \|\| value === 1) return 'Ja'; if (value === false \|\| value === 'false' \|\| value === 0) return 'Nein'; return '—'; }` |
| 140 | function | `userFieldRows` | `function userFieldRows(user){` |
| 161 | function | `renderUserinfoModal` | `function renderUserinfoModal(){` |
| 182 | function | `renderSceneButton` | `function renderSceneButton(s, current){` |
| 191 | function | `render` | `function render(){` |
| 216 | async function | `loadAll` | `async function loadAll(){ await loadConfig(); await loadStatus(); state.loadedAt = new Date(); render(); }` |

## `htdocs/overlays/_overlay-alert1.html`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 387 | function | `getQueryParams` | `function getQueryParams() {` |
| 414 | function | `configureAvatar` | `function configureAvatar(data) {` |
| 429 | function | `getBitsTierConfig` | `function getBitsTierConfig(bits) {` |
| 437 | function | `selectSound` | `function selectSound(data) {` |
| 480 | function | `buildText` | `function buildText(data) {` |
| 563 | function | `playAlertSound` | `function playAlertSound(src, durationOverrideSec, onEnded) {` |
| 581 | function | `safeEnd` | `function safeEnd() {` |
| 607 | function | `showAlert` | `function showAlert(data) {` |

## `htdocs/overlays/_overlay-alerts-v2.html`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 1685 | function | `stageMetrics` | `function stageMetrics() {` |
| 1687 | const function | `offsetX` | `const offsetX = (window.innerWidth - 1920 * scale) / 2;` |
| 1688 | const function | `offsetY` | `const offsetY = (window.innerHeight - 1080 * scale) / 2;` |
| 1692 | function | `applyCardRenderMetrics` | `function applyCardRenderMetrics(card, settings) {` |
| 1706 | function | `updateStageScale` | `function updateStageScale() {` |
| 1718 | function | `connect` | `function connect() {` |
| 1740 | function | `preparedAlertId` | `function preparedAlertId(alert, envelope = {}) {` |
| 1753 | function | `prepareAlert` | `function prepareAlert(alert, envelope = {}) {` |
| 1759 | function | `soundVisualEventId` | `function soundVisualEventId(item) {` |
| 1768 | function | `isAlertVisualItem` | `function isAlertVisualItem(item) {` |
| 1774 | function | `handleSoundSystemEvent` | `function handleSoundSystemEvent(data) {` |
| 1792 | function | `send` | `function send(payload) {` |
| 1796 | function | `playAlert` | `function playAlert(alert) {` |
| 1892 | function | `displaySettings` | `function displaySettings(alert) {` |
| 1894 | const function | `pick` | `const pick = (v, allowed, fallback) => allowed.includes(String(v \|\| '').toLowerCase()) ? String(v).toLowerCase() : fallback;` |
| 1895 | const function | `num` | `const num = (v, fallback, min, max) => Math.min(max, Math.max(min, Number(v ?? fallback) \|\| fallback));` |
| 1896 | const function | `color` | `const color = (v, fallback) => /^#[0-9a-f]{6}$/i.test(String(v \|\| '').trim()) ? String(v).trim() : fallback;` |
| 1935 | function | `displayClasses` | `function displayClasses(settings) {` |
| 1953 | function | `cardWidth` | `function cardWidth(settings) {` |
| 1958 | function | `cardHeight` | `function cardHeight(settings) {` |
| 1964 | function | `buildAvatarSlot` | `function buildAvatarSlot(src, name, isLogo = false) {` |
| 1971 | function | `firstInitial` | `function firstInitial(name) {` |
| 1976 | function | `chooseBadgeImage` | `function chooseBadgeImage(alert, settings = {}) {` |
| 1982 | function | `chooseAvatar` | `function chooseAvatar(alert) {` |
| 1990 | function | `chooseBadgeSvg` | `function chooseBadgeSvg(alert, settings = {}) {` |
| 2016 | function | `svgCgnCore` | `function svgCgnCore() {` |
| 2020 | function | `svgBadgeOrbit` | `function svgBadgeOrbit() {` |
| 2024 | function | `svgBadgeHex` | `function svgBadgeHex() {` |
| 2028 | function | `svgBadgeShield` | `function svgBadgeShield() {` |
| 2032 | function | `svgBadgeWave` | `function svgBadgeWave() {` |
| 2036 | function | `svgBadgeCgn` | `function svgBadgeCgn() {` |
| 2040 | function | `svgBadgeDotgrid` | `function svgBadgeDotgrid() {` |
| 2044 | function | `svgBadgeTriad` | `function svgBadgeTriad() {` |
| 2048 | function | `svgBadgeSlash` | `function svgBadgeSlash() {` |
| 2052 | function | `svgBadgeDoubleRing` | `function svgBadgeDoubleRing() {` |
| 2056 | function | `svgBadgeCross` | `function svgBadgeCross() {` |
| 2060 | function | `svgBadgeCube` | `function svgBadgeCube() {` |
| 2064 | function | `svgBadgeBolt` | `function svgBadgeBolt() {` |
| 2068 | function | `svgBadgeRing` | `function svgBadgeRing() {` |
| 2072 | function | `svgBadgePulse` | `function svgBadgePulse() {` |
| 2076 | function | `svgBadgeMinimal` | `function svgBadgeMinimal() {` |
| 2080 | function | `svgHeart` | `function svgHeart() {` |
| 2084 | function | `svgDiamond` | `function svgDiamond() {` |
| 2088 | function | `svgCrown` | `function svgCrown() {` |
| 2092 | function | `svgPortal` | `function svgPortal() {` |
| 2096 | function | `svgGift` | `function svgGift() {` |
| 2100 | function | `svgSpark` | `function svgSpark() {` |
| 2104 | function | `buildSource` | `function buildSource(alert) {` |
| 2111 | function | `buildDisplay` | `function buildDisplay(alert) {` |
| 2137 | function | `amountText` | `function amountText(alert) {` |
| 2146 | function | `defaultTitle` | `function defaultTitle(alert) {` |
| 2157 | function | `buildCelebrationLayer` | `function buildCelebrationLayer(alert) {` |
| 2203 | const function | `lane` | `const lane = (i * 37 + 13) % 100;` |
| 2230 | function | `normalizeCelebrationStrength` | `function normalizeCelebrationStrength(value) {` |
| 2237 | function | `normalizeCelebrationType` | `function normalizeCelebrationType(value) {` |
| 2250 | function | `clearAlert` | `function clearAlert(reason, ack = true) {` |
| 2270 | function | `escapeHtml` | `function escapeHtml(v) {` |
| 2274 | function | `escapeAttr` | `function escapeAttr(v) {` |
| 2278 | function | `escapeCss` | `function escapeCss(v) {` |

## `htdocs/overlays/_overlay-birthday.html`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 339 | function | `delayedAudioStart` | `function delayedAudioStart() {` |
| 349 | function | `startAutoHide` | `function startAutoHide() {` |
| 360 | function | `spawnDots` | `function spawnDots() {` |
| 380 | function | `spawnConfetti` | `function spawnConfetti(count = 130) {` |
| 404 | function | `spawnBalloons` | `function spawnBalloons(count = 12) {` |
| 418 | function | `spawnNameParticles` | `function spawnNameParticles(count = 16) {` |
| 425 | const function | `angle` | `const angle = (360 / count) * i;` |

## `htdocs/overlays/_overlay-challenge_neu.html`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 90 | function | `addChallenge` | `function addChallenge(challenge) {` |
| 96 | function | `runNext` | `function runNext() {` |
| 106 | function | `showChallenge` | `function showChallenge(challenge, onDone) {` |
| 136 | function | `updateTime` | `function updateTime() {` |
| 151 | function | `finish` | `function finish() {` |

## `htdocs/overlays/_overlay-challenge_status.html`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 124 | function | `formatTime` | `function formatTime(secs) {` |
| 131 | function | `playUrl` | `function playUrl(url) {` |
| 147 | function | `fallbackSound` | `function fallbackSound(mode) {` |
| 153 | function | `normalizeEntry` | `function normalizeEntry(entry) {` |
| 168 | function | `escapeHtml` | `function escapeHtml(value) {` |
| 177 | function | `buildChallengeHTML` | `function buildChallengeHTML(entry, kind) {` |
| 193 | function | `ensureBox` | `function ensureBox(kind, entry) {` |
| 205 | function | `removeBox` | `function removeBox(box) {` |
| 213 | function | `updateCountdown` | `function updateCountdown(box, entry) {` |
| 230 | function | `renderState` | `function renderState(state, event) {` |
| 267 | function | `handleChallengeMessage` | `function handleChallengeMessage(msg) {` |

## `htdocs/overlays/_overlay-clip_player.html`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 185 | function | `qs` | `function qs(n){ return new URLSearchParams(location.search).get(n); }` |
| 187 | async function | `setAvatarAndName` | `async function setAvatarAndName(user) {` |
| 192 | const function | `login` | `const login = (user \|\| "").replace(/^@+/, "").trim();` |
| 210 | const function | `displayName` | `const displayName = (u.display_name \|\| login).trim();` |
| 211 | const function | `avatarUrl` | `const avatarUrl   = (u.profile_image_url \|\| "").trim();` |
| 226 | async function | `loadClip` | `async function loadClip(clipId) {` |
| 262 | async function | `play` | `async function play(mp4) {` |

## `htdocs/overlays/_overlay-deathcounter-v2.html`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 332 | function | `stopMarqueeFor` | `function stopMarqueeFor(trackEl, innerEl) {` |
| 339 | function | `startMarqueeFor` | `function startMarqueeFor(trackEl, innerEl, shift) {` |
| 363 | function | `ensureMarqueeLoop` | `function ensureMarqueeLoop() {` |
| 366 | const function | `tick` | `const tick = (ts) => {` |
| 406 | function | `setTextAsSpans` | `function setTextAsSpans(el, text) {` |
| 408 | const function | `safe` | `const safe = (text \|\| "").trim() \|\| "---";` |
| 418 | function | `playNameExplosion` | `function playNameExplosion(el, text) {` |
| 431 | function | `animateCount` | `function animateCount(el) {` |
| 437 | function | `applyMarquee` | `function applyMarquee(trackEl, innerEl) {` |
| 467 | function | `normalizeWsUrl` | `function normalizeWsUrl() {` |
| 472 | function | `extractOverlayVisible` | `function extractOverlayVisible(payload) {` |
| 479 | function | `setOverlayVisible` | `function setOverlayVisible(visible) {` |
| 484 | function | `mapPlayersById` | `function mapPlayersById(players) {` |
| 492 | function | `getDisplayPlayers` | `function getDisplayPlayers(state, overlayPayload) {` |
| 508 | function | `getSession` | `function getSession(player, currentGame) {` |
| 512 | function | `getName` | `function getName(player, fallback) {` |
| 516 | function | `buildRenderSignature` | `function buildRenderSignature(state, overlayPayload) {` |
| 550 | function | `maybeRender` | `function maybeRender(state, overlayPayload) {` |
| 560 | function | `makeName` | `function makeName(roleKey, nameText, extra = false) {` |
| 580 | function | `makeCount` | `function makeCount(roleKey, value, extra = false) {` |
| 590 | function | `makeSep` | `function makeSep() {` |
| 594 | function | `updateAnimations` | `function updateAnimations(roleKey, nameText, countValue) {` |
| 623 | function | `clearRefs` | `function clearRefs() {` |
| 627 | function | `render` | `function render(state, overlayPayload) {` |
| 685 | async function | `fetchJson` | `async function fetchJson(url) {` |
| 691 | async function | `syncAll` | `async function syncAll() {` |
| 705 | function | `handleWsMessage` | `function handleWsMessage(msg) {` |
| 720 | function | `connectWs` | `function connectWs() {` |

## `htdocs/overlays/_overlay-easteregg_winner.html`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 127 | function | `qp` | `function qp(name, def="") {` |

## `htdocs/overlays/_overlay-ende.html`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 775 | function | `debugLog` | `function debugLog(message, data) {` |
| 781 | function | `safeJson` | `function safeJson(value) {` |
| 786 | function | `escapeHtml` | `function escapeHtml(value) {` |
| 795 | function | `buildListHTML` | `function buildListHTML(title, items) {` |
| 802 | function | `sortAndFilterCredits` | `function sortAndFilterCredits(data) {` |
| 804 | const function | `lower` | `const lower = (s) => (s \|\| "").toLowerCase();` |
| 805 | function | `accept` | `function accept(u) {` |
| 830 | function | `getEventCategory` | `function getEventCategory(data, key, ignore, excludeSet = new Set()) {` |
| 834 | const function | `lname` | `const lname = (name \|\| "").toLowerCase();` |
| 891 | function | `animateVerticalScroll` | `function animateVerticalScroll(listId, html, pauseTime = 1500) {` |
| 925 | function | `buildRaidSubline` | `function buildRaidSubline(data) {` |
| 939 | function | `scrollSubline` | `function scrollSubline(text) {` |
| 952 | const function | `duration` | `const duration = (distance / scrollSpeed) * 1000;` |

## `htdocs/overlays/_overlay-megashoutout.html`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 129 | function | `getUrlParam` | `function getUrlParam(name) {` |
| 133 | function | `updateFromStreamerBot` | `function updateFromStreamerBot() {` |

## `htdocs/overlays/_overlay-pause.html`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 880 | function | `dlog` | `function dlog(...args) {` |
| 884 | function | `escapeDisplayText` | `function escapeDisplayText(value) {` |
| 888 | function | `setChatStatus` | `function setChatStatus(text, live) {` |
| 894 | function | `createChatTextNode` | `function createChatTextNode(textValue) {` |
| 901 | function | `appendChatSegments` | `function appendChatSegments(container, item) {` |
| 936 | function | `renderChatList` | `function renderChatList(messages, markNewest) {` |
| 960 | function | `renderDemoChat` | `function renderDemoChat() {` |
| 966 | function | `addChatMessage` | `function addChatMessage(item) {` |
| 978 | function | `clearChatMessages` | `function clearChatMessages() {` |
| 983 | function | `wsUrl` | `function wsUrl() {` |
| 988 | function | `normalizeChatItem` | `function normalizeChatItem(item) {` |
| 997 | function | `isChatItemLike` | `function isChatItemLike(item) {` |
| 1004 | function | `findChatArrays` | `function findChatArrays(value, depth = 0) {` |
| 1019 | function | `chatSignature` | `function chatSignature(items) {` |
| 1023 | function | `pickChatItems` | `function pickChatItems(payload) {` |
| 1070 | function | `extractChatSnapshotItems` | `function extractChatSnapshotItems(payload) {` |
| 1094 | async function | `refreshChatSnapshot` | `async function refreshChatSnapshot() {` |
| 1147 | function | `requestChatSnapshot` | `function requestChatSnapshot(ws) {` |
| 1159 | function | `startChatSnapshotPolling` | `function startChatSnapshotPolling() {` |
| 1165 | function | `connectChatWebSocket` | `function connectChatWebSocket() {` |
| 1225 | async function | `fetchOverlayData` | `async function fetchOverlayData() {` |
| 1235 | async function | `setData` | `async function setData() {` |
| 1241 | const function | `bgFilename` | `const bgFilename = (game && map[game]) ? map[game] : (map[DEFAULT_GAME] \|\| DEFAULT_BACKGROUND);` |
| 1260 | const arrow | `clean` | `const clean=v=>String(v==null?'':v).replace(/\s+/g,' ').trim();` |
| 1261 | function | `st` | `function st(t,live){ if(status){ status.textContent=t\|\|''; status.classList.toggle('live',!!live); } }` |
| 1262 | function | `msg` | `function msg(title,body){ list.innerHTML=''; const r=document.createElement('div'); r.className='chatMsg chatPlaceholder'; const u=document.createElement('div'); u.className='chatUser'; u.textContent=title; const x=document.createElement('div'); x.className='chatText'; x.textContent=body; r.append(u,x); list.appendChild(r); }` |
| 1263 | function | `norm` | `function norm(i){ if(!i\|\|typeof i!=='object')return null; const seg=Array.isArray(i.segments)?i.segments:[]; const text=clean(i.text\|\|i.message\|\|i.body\|\|''); const user=clean(i.user\|\|i.displayName\|\|i.display_name\|\|i.login\|\|i.userName\|\|i.username\|\|'Chat'); if(!text&&!seg.length)return null; return {...i,user,text,segments:seg}; }` |
| 1264 | function | `append` | `function append(parent,item){ let e=0,t=0; if(!item.segments.length){ const s=document.createElement('span'); s.className='chatSegmentText'; s.textContent=item.text\|\|''; parent.appendChild(s); return {e,t:item.text?1:0}; } for(const seg of item.segments){ if(seg&&seg.type==='emote'&&seg.url){ const im=document.createElement('img'); im.className='chatEmote'; im.src=seg.url; im.alt=''; im.title=seg.name\|\|'emote'; im.referrerPolicy='no-referrer'; im.loading='lazy'; im.decoding='async'; im.onerror=()=>im.remove(); parent.appendChild(im); e++; } else { const val=String((seg&&seg.text)\|\|''); if(val){ const s=document.createElement('span'); s.className='chatSegmentText'; s.textContent=val; parent.appendChild(s); t++; } } } return {e,t}; }` |
| 1265 | function | `render` | `function render(items){ const arr=(items\|\|[]).map(norm).filter(Boolean).slice(-max); if(!arr.length)return false; list.innerHTML=''; for(const it of arr){ const r=document.createElement('div'); r.className='chatMsg'; const u=document.createElement('div'); u.className='chatUser'; u.textContent=it.user; const x=document.createElement('div'); x.className='chatText'; const s=append(x,it); if((it.text\|\|'').length>160)r.classList.add('long'); if(s.e>0&&s.t===0)r.classList.add('onlyEmotes'); r.append(u,x); list.appendChild(r); } return true; }` |
| 1266 | async function | `json` | `async function json(url){ const res=await fetch(url+(url.includes('?')?'&':'?')+'_='+Date.now(),{cache:'no-store',headers:{Accept:'application/json'}}); const raw=await res.text(); if(!res.ok)throw new Error(url+' HTTP '+res.status+' '+raw.slice(0,120)); try{return JSON.parse(raw)}catch(e){throw new Error(url+' JSON: '+raw.slice(0,120));} }` |
| 1267 | async function | `load` | `async function load(){ let err=''; for(const ep of ['/api/overlay/chat/debug','/api/overlay/chat/status']){ try{ const d=await json(ep); const items=(Array.isArray(d.lastChatItems)&&d.lastChatItems)\|\|(Array.isArray(d.debug?.lastChatItems)&&d.debug.lastChatItems)\|\|(Array.isArray(d.recentMessages)&&d.recentMessages)\|\|(Array.isArray(d.messages)&&d.messages)\|\|(Array.isArray(d.items)&&d.items)\|\|[]; if(render(items)){ st('Letzte Chatnachrichten geladen',true); if(debug)console.log('[pause STEP110] loaded',ep,items.length); return true; } err=ep+' enthält keine lastChatItems[]'; }catch(e){ err=e&&e.message?e.message:String(e); if(debug)console.warn('[pause STEP110] failed',ep,e); } } st('Kein Chat-Snapshot',false); msg('Live-Chat',debug?err:'Noch keine letzten Chatnachrichten gefunden.'); return false; }` |

## `htdocs/overlays/_overlay-start-v2-neon-galaxy.html`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 1859 | const function | `qid` | `const qid = (id) => document.getElementById(id);` |
| 1861 | function | `cacheBust` | `function cacheBust(u) {` |
| 1865 | function | `dlog` | `function dlog(...a) {` |
| 1872 | function | `setNowPlaying` | `function setNowPlaying(n) {` |
| 1879 | function | `setLoading` | `function setLoading(text, visible) {` |
| 1889 | function | `formatTime` | `function formatTime(s) {` |
| 1896 | function | `startCounter` | `function startCounter(totalSeconds) {` |
| 1907 | const function | `left` | `const left = (end - performance.now()) / 1000;` |
| 1921 | async function | `safeJson` | `async function safeJson(u) {` |
| 1934 | async function | `fetchOverlayData` | `async function fetchOverlayData() {` |
| 1943 | async function | `fetchStreamInfo` | `async function fetchStreamInfo() {` |
| 1953 | async function | `fetchBackgrounds` | `async function fetchBackgrounds() {` |
| 1961 | async function | `fetchStartOverlayConfig` | `async function fetchStartOverlayConfig() {` |
| 1966 | function | `applyStartOverlayConfig` | `function applyStartOverlayConfig(j) {` |
| 2004 | function | `setBackgroundForGame` | `function setBackgroundForGame(g) {` |
| 2014 | function | `toggleTT` | `function toggleTT(title) {` |
| 2035 | function | `runMarquee` | `function runMarquee(text) {` |
| 2056 | const function | `dur` | `const dur = (distance / MARQUEE_SPEED) * 1000;` |
| 2062 | function | `step` | `function step(ts) {` |
| 2101 | function | `buildSequence` | `function buildSequence(schema) {` |
| 2127 | function | `norm` | `function norm(value) {` |
| 2131 | function | `itemKey` | `function itemKey(item) {` |
| 2135 | function | `findByFileOrName` | `function findByFileOrName(fileName, fallbackNamePart) {` |
| 2172 | function | `pickTwo` | `function pickTwo(arr) {` |
| 2200 | async function | `startAudioOnce` | `async function startAudioOnce() {` |
| 2230 | const function | `delayBeforeStart` | `const delayBeforeStart = (!hasDurations \|\| AUDIO_NOW) ? 0 : Math.max(0, finalSeconds - totalWithGaps);` |
| 2252 | function | `playIndex` | `function playIndex(i) {` |
| 2279 | function | `playNextWithGap` | `function playNextWithGap() {` |
| 2318 | function | `escapeDisplayText` | `function escapeDisplayText(value) {` |
| 2322 | function | `setChatStatus` | `function setChatStatus(text, live) {` |
| 2330 | function | `createChatTextNode` | `function createChatTextNode(textValue) {` |
| 2337 | function | `appendChatSegments` | `function appendChatSegments(container, item) {` |
| 2379 | function | `renderChatList` | `function renderChatList(messages, markNewest) {` |
| 2415 | function | `renderDemoChat` | `function renderDemoChat() {` |
| 2421 | function | `addChatMessage` | `function addChatMessage(item) {` |
| 2445 | function | `clearChatMessages` | `function clearChatMessages() {` |
| 2450 | function | `wsUrl` | `function wsUrl() {` |
| 2455 | function | `connectChatWebSocket` | `function connectChatWebSocket() {` |
| 2542 | function | `getFollowStartIndex` | `function getFollowStartIndex() {` |
| 2554 | function | `pickNextLeftRotatorIndex` | `function pickNextLeftRotatorIndex(currentIndex) {` |
| 2562 | function | `applyLeftRotatorMessage` | `function applyLeftRotatorMessage(item) {` |
| 2570 | function | `startLeftRotator` | `function startLeftRotator() {` |
| 2596 | async function | `updateOverlay` | `async function updateOverlay() {` |
| 2610 | async function | `init` | `async function init() {` |

## `htdocs/overlays/_overlay-start-v2.html`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 190 | const function | `qid` | `const qid=(id)=>document.getElementById(id);` |
| 191 | const function | `cacheBust` | `const cacheBust=(u)=>u+(u.includes("?")?"&":"?")+"t="+Date.now();` |
| 192 | const function | `dlog` | `const dlog=(...a)=>{ if(!DEBUG) return; const box=qid("debug"); box.style.display="block"; box.textContent+=a.join(" ")+"\n"; };` |
| 193 | function | `setNowPlaying` | `function setNowPlaying(n){ const el=qid("nowPlaying"); if(!SHOW_NP) return; el.style.display="block"; el.textContent="Now Playing: "+n; }` |
| 194 | function | `buildRunner` | `function buildRunner(){` |
| 208 | const function | `animatePath` | `const animatePath = (el, dashLen, phase) => {` |
| 230 | function | `placeCounter` | `function placeCounter(){` |
| 232 | const function | `mid` | `const mid=(av.top-cont.top)/2; const box=qid("counterBox"); box.style.top=(Math.round(mid-box.offsetHeight/2))+"px";` |
| 234 | function | `formatTime` | `function formatTime(s){ s=Math.max(0,Math.ceil(s)); const m=Math.floor(s/60), sec=s%60; return (m<10?"0":"")+m+":"+(sec<10?"0":"")+sec; }` |
| 235 | function | `startCounter` | `function startCounter(totalSeconds){` |
| 243 | async function | `safeJson` | `async function safeJson(u){` |
| 250 | async function | `fetchOverlayData` | `async function fetchOverlayData(){` |
| 257 | async function | `fetchStreamInfo` | `async function fetchStreamInfo(){` |
| 265 | async function | `fetchBackgrounds` | `async function fetchBackgrounds(){` |
| 271 | function | `setBackgroundForGame` | `function setBackgroundForGame(g){` |
| 275 | function | `toggleTT` | `function toggleTT(title){` |
| 281 | function | `runMarquee` | `function runMarquee(text){` |
| 286 | function | `step` | `function step(ts){ if(stopMarquee){runningText=null;return} if(startT===null) startT=ts; let t=(ts-startT)/dur; if(t>1) t=1; let x=startX+(endX-startX)*t; sub.style.transform=\`translateX(${x}px)\`;` |
| 291 | function | `buildSequence` | `function buildSequence(schema){` |
| 297 | function | `pickTwo` | `function pickTwo(arr){ if(arr.length<=1) return arr.slice(0,1); const i=Math.floor(Math.random()*arr.length); let j=Math.floor(Math.random()*arr.length); if(j===i) j=(j+1)%arr.length; return [arr[i],arr[j]]; }` |
| 309 | async function | `startAudioOnce` | `async function startAudioOnce(){` |
| 327 | function | `playIndex` | `function playIndex(i){` |
| 336 | function | `playNextWithGap` | `function playNextWithGap(){` |
| 352 | async function | `updateOverlay` | `async function updateOverlay(){` |
| 360 | async function | `init` | `async function init(){` |

## `htdocs/overlays/_overlay-start.html`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 83 | const function | `qid` | `const qid=(id)=>document.getElementById(id);` |
| 84 | const function | `cacheBust` | `const cacheBust=(u)=>u+(u.includes("?")?"&":"?")+"t="+Date.now();` |
| 85 | const function | `dlog` | `const dlog=(...a)=>{ if(!DEBUG) return; const box=qid("debug"); box.style.display="block"; box.textContent+=a.join(" ")+"\\n"; };` |
| 86 | function | `setNowPlaying` | `function setNowPlaying(n){ const el=qid("nowPlaying"); if(!SHOW_NP) return; el.style.display="block"; el.textContent="Now Playing: "+n; }` |
| 89 | function | `placeCounter` | `function placeCounter(){` |
| 91 | const function | `mid` | `const mid=(av.top-cont.top)/2; const box=qid("counterBox"); box.style.top=(Math.round(mid-box.offsetHeight/2))+"px";` |
| 93 | function | `formatTime` | `function formatTime(s){ s=Math.max(0,Math.ceil(s)); const m=Math.floor(s/60), sec=s%60; return (m<10?"0":"")+m+":"+(sec<10?"0":"")+sec; }` |
| 94 | function | `startCounter` | `function startCounter(totalSeconds){` |
| 102 | async function | `safeJson` | `async function safeJson(u){` |
| 109 | async function | `fetchOverlayData` | `async function fetchOverlayData(){` |
| 116 | async function | `fetchStreamInfo` | `async function fetchStreamInfo(){` |
| 124 | async function | `fetchBackgrounds` | `async function fetchBackgrounds(){` |
| 130 | function | `setBackgroundForGame` | `function setBackgroundForGame(g){` |
| 134 | function | `toggleTT` | `function toggleTT(title){` |
| 141 | function | `runMarquee` | `function runMarquee(text){` |
| 146 | function | `step` | `function step(ts){ if(stopMarquee){runningText=null;return} if(startT===null) startT=ts; let t=(ts-startT)/dur; if(t>1) t=1; let x=startX+(endX-startX)*t; sub.style.transform=\`translateX(${x}px)\`;` |
| 153 | function | `buildSequence` | `function buildSequence(schema){` |
| 159 | function | `pickTwo` | `function pickTwo(arr){ if(arr.length<=1) return arr.slice(0,1); const i=Math.floor(Math.random()*arr.length); let j=Math.floor(Math.random()*arr.length); if(j===i) j=(j+1)%arr.length; return [arr[i],arr[j]]; }` |
| 171 | async function | `startAudioOnce` | `async function startAudioOnce(){` |
| 191 | function | `playIndex` | `function playIndex(i){` |
| 200 | function | `playNextWithGap` | `function playNextWithGap(){` |
| 217 | async function | `updateOverlay` | `async function updateOverlay(){` |
| 225 | async function | `init` | `async function init(){` |

## `htdocs/overlays/_overlay-tts.html`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 163 | function | `wsUrl` | `function wsUrl() {` |
| 168 | function | `show` | `function show(item) {` |
| 175 | function | `hide` | `function hide() {` |
| 179 | async function | `markDone` | `async function markDone(id) {` |
| 187 | function | `stopAudio` | `function stopAudio(markAsDone) {` |
| 217 | function | `connect` | `function connect() {` |

## `htdocs/overlays/_overlay-vip30.html`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 324 | function | `getQueryParams` | `function getQueryParams() {` |
| 332 | function | `configureAvatar` | `function configureAvatar(data) {` |
| 347 | function | `playVipSound` | `function playVipSound(onEnded) {` |
| 357 | function | `safeEnd` | `function safeEnd() {` |
| 377 | function | `showVipAlert` | `function showVipAlert(data) {` |

## `htdocs/overlays/25-10-08 - Alerts-läuft.html`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 152 | const function | `type` | `const type=(q.get('type')\|\|'follow').toLowerCase();` |
| 173 | const function | `rand` | `const rand=(a,b)=>Math.random()*(b-a)+a;` |
| 174 | function | `bezier` | `function bezier(p0,p1,p2,p3,t){` |
| 179 | function | `edgePoint` | `function edgePoint(w,h){` |
| 186 | function | `spawnSpark` | `function spawnSpark(x,y){` |
| 198 | function | `fly` | `function fly(p0,p1,p2,p3,duration){` |
| 202 | function | `step` | `function step(ts){` |

## `htdocs/overlays/fireworks.js`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 13 | const function | `IS_HIGH_END_DEVICE` | `const IS_HIGH_END_DEVICE = (() => {` |
| 30 | function | `getDefaultScaleFactor` | `function getDefaultScaleFactor() {` |
| 80 | function | `fullscreenEnabled` | `function fullscreenEnabled() {` |
| 86 | function | `isFullscreen` | `function isFullscreen() {` |
| 91 | function | `toggleFullscreen` | `function toggleFullscreen() {` |
| 226 | function | `togglePause` | `function togglePause(toggle) {` |
| 240 | function | `toggleSound` | `function toggleSound(toggle) {` |
| 248 | function | `toggleMenu` | `function toggleMenu(toggle) {` |
| 256 | function | `updateConfig` | `function updateConfig(nextConfig) {` |
| 266 | function | `configDidUpdate` | `function configDidUpdate() {` |
| 285 | const function | `isRunning` | `const isRunning = (state=store.state) => !state.paused && !state.menuOpen;` |
| 287 | const function | `soundEnabledSelector` | `const soundEnabledSelector = (state=store.state) => state.soundEnabled;` |
| 289 | const function | `canPlaySoundSelector` | `const canPlaySoundSelector = (state=store.state) => isRunning(state) && soundEnabledSelector(state);` |
| 291 | const function | `qualitySelector` | `const qualitySelector = () => +store.state.config.quality;` |
| 292 | const function | `shellNameSelector` | `const shellNameSelector = () => store.state.config.shell;` |
| 294 | const function | `shellSizeSelector` | `const shellSizeSelector = () => +store.state.config.size;` |
| 295 | const function | `finaleSelector` | `const finaleSelector = () => store.state.config.finale;` |
| 296 | const function | `skyLightingSelector` | `const skyLightingSelector = () => +store.state.config.skyLighting;` |
| 297 | const function | `scaleFactorSelector` | `const scaleFactorSelector = () => store.state.config.scaleFactor;` |
| 407 | function | `renderApp` | `function renderApp(state) {` |
| 435 | function | `handleStateChange` | `function handleStateChange(state, prevState) {` |
| 451 | function | `getConfigFromDOM` | `function getConfigFromDOM() {` |
| 466 | const function | `updateConfigNoEvent` | `const updateConfigNoEvent = () => updateConfig();` |
| 520 | function | `randomColorSimple` | `function randomColorSimple() {` |
| 526 | function | `randomColor` | `function randomColor(options) {` |
| 552 | function | `whiteOrGold` | `function whiteOrGold() {` |
| 558 | function | `makePistilColor` | `function makePistilColor(shellColor) {` |
| 563 | const function | `crysanthemumShell` | `const crysanthemumShell = (size=1) => {` |
| 590 | const function | `ghostShell` | `const ghostShell = (size=1) => {` |
| 612 | const function | `strobeShell` | `const strobeShell = (size=1) => {` |
| 631 | const function | `palmShell` | `const palmShell = (size=1) => {` |
| 644 | const function | `ringShell` | `const ringShell = (size=1) => {` |
| 663 | const function | `crossetteShell` | `const crossetteShell = (size=1) => {` |
| 678 | const function | `floralShell` | `const floralShell = (size=1) => ({` |
| 688 | const function | `fallingLeavesShell` | `const fallingLeavesShell = (size=1) => ({` |
| 700 | const function | `willowShell` | `const willowShell = (size=1) => ({` |
| 710 | const function | `crackleShell` | `const crackleShell = (size=1) => {` |
| 728 | const function | `horsetailShell` | `const horsetailShell = (size=1) => {` |
| 744 | function | `randomShellName` | `function randomShellName() {` |
| 748 | function | `randomShell` | `function randomShell(size) {` |
| 755 | function | `shellFromConfig` | `function shellFromConfig(size) {` |
| 763 | function | `randomFastShell` | `function randomFastShell() {` |
| 792 | function | `init` | `function init() {` |
| 798 | function | `setOptionsForSelect` | `function setOptionsForSelect(node, options) {` |
| 841 | function | `fitShellPositionInBoundsH` | `function fitShellPositionInBoundsH(position) {` |
| 846 | function | `fitShellPositionInBoundsV` | `function fitShellPositionInBoundsV(position) {` |
| 850 | function | `getRandomShellPositionH` | `function getRandomShellPositionH() {` |
| 854 | function | `getRandomShellPositionV` | `function getRandomShellPositionV() {` |
| 858 | function | `getRandomShellSize` | `function getRandomShellSize() {` |
| 875 | function | `launchShellFromConfig` | `function launchShellFromConfig(event) {` |
| 890 | function | `seqRandomShell` | `function seqRandomShell() {` |
| 903 | function | `seqRandomFastShell` | `function seqRandomFastShell() {` |
| 914 | function | `seqTwoRandom` | `function seqTwoRandom() {` |
| 934 | function | `seqTriple` | `function seqTriple() {` |
| 961 | function | `seqPyramid` | `function seqPyramid() {` |
| 968 | function | `launchShell` | `function launchShell(x, useSpecial) {` |
| 1003 | function | `seqSmallBarrage` | `function seqSmallBarrage() {` |
| 1012 | function | `launchShell` | `function launchShell(x, useSpecial) {` |
| 1018 | const function | `height` | `const height = (Math.cos(x*5*Math.PI + PI_HALF) + 1) / 2;` |
| 1030 | const function | `offset` | `const offset = (count + 1) / barrageCount / 2;` |
| 1062 | function | `startSequence` | `function startSequence() {` |
| 1112 | function | `handlePointerStart` | `function handlePointerStart(event) {` |
| 1141 | function | `handlePointerEnd` | `function handlePointerEnd(event) {` |
| 1146 | function | `handlePointerMove` | `function handlePointerMove(event) {` |
| 1154 | function | `handleKeydown` | `function handleKeydown(event) {` |
| 1176 | function | `handleResize` | `function handleResize() {` |
| 1203 | function | `updateSpeedFromEvent` | `function updateSpeedFromEvent(event) {` |
| 1207 | const function | `newSpeed` | `const newSpeed = (event.x - edge) / (mainStage.width - edge * 2);` |
| 1220 | function | `updateGlobals` | `function updateGlobals(timeStep, lag) {` |
| 1241 | function | `update` | `function update(frameTime, lag) {` |
| 1353 | function | `render` | `function render(speed) {` |
| 1452 | function | `colorSky` | `function colorSky(speed) {` |
| 1497 | function | `createParticleArc` | `function createParticleArc(start, arcLength, count, randomness, particleFactory) {` |
| 1518 | function | `createBurst` | `function createBurst(count, particleFactory, startAngle=0, arcLength=PI_2) {` |
| 1556 | function | `crossetteEffect` | `function crossetteEffect(star) {` |
| 1571 | function | `floralEffect` | `function floralEffect(star) {` |
| 1591 | function | `fallingLeavesEffect` | `function fallingLeavesEffect(star) {` |
| 1616 | function | `crackleEffect` | `function crackleEffect(star) {` |
| 1793 | const function | `starFactory` | `const starFactory = (angle, speedMult) => {` |
| 1945 | const function | `soundScale` | `const soundScale = (1 - sizeDifferenceFromMaxSize / maxDiff) * 0.3 + 0.7;` |
| 1981 | function | `createParticleCollection` | `function createParticleCollection() {` |
| 2102 | function | `convertDataURIToBinary` | `function convertDataURIToBinary(dataURI) {` |
| 2163 | function | `checkStatus` | `function checkStatus(response) {` |
| 2289 | function | `setLoadingStatus` | `function setLoadingStatus(status) {` |
| 2328 | function | `fireRandom` | `function fireRandom() {` |
| 2364 | function | `enqueueFireworks` | `function enqueueFireworks(intensity, mode) {` |
| 2374 | function | `playNextFromQueue` | `function playNextFromQueue() {` |
| 2416 | function | `connectWebsocket` | `function connectWebsocket() {` |

## `htdocs/overlays/MyMath.js`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 13 | const function | `MyMath` | `const MyMath = (function MyMathFactory(Math) {` |

## `htdocs/overlays/sound_system_overlay.html`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 52 | function | `setStatus` | `function setStatus(text){ if (status) status.textContent = text \|\| 'Sound-System Overlay'; }` |
| 54 | async function | `post` | `async function post(path, payload){` |
| 60 | async function | `getJson` | `async function getJson(path){` |
| 66 | function | `stopBeep` | `function stopBeep(){` |
| 74 | function | `stopAudio` | `function stopAudio(){` |
| 80 | function | `normalizeVolume` | `function normalizeVolume(value){` |
| 86 | function | `getAudioContext` | `function getAudioContext(){` |
| 93 | async function | `unlockAudio` | `async function unlockAudio(){` |
| 116 | async function | `playGeneratedBeep` | `async function playGeneratedBeep(item){` |
| 167 | async function | `playFileSound` | `async function playFileSound(item){` |
| 188 | async function | `playSound` | `async function playSound(item){` |
| 208 | function | `handleMessage` | `function handleMessage(message){` |
| 228 | async function | `pollStatus` | `async function pollStatus(){` |
| 244 | function | `connect` | `function connect(){` |

## `htdocs/overlays/Stage-0.1.4.js`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 42 | const function | `Ticker` | `const Ticker = (function TickerFactory(window) {` |
| 68 | function | `queueFrame` | `function queueFrame() {` |
| 76 | function | `frameHandler` | `function frameHandler(timestamp) {` |
| 102 | const function | `Stage` | `const Stage = (function StageFactory(window, document, Ticker) {` |
| 109 | function | `Stage` | `function Stage(canvas) {` |

## `htdocs/overlays/vip_sound_overlay.html`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 335 | function | `parseMs` | `function parseMs(value, fallback) {` |
| 351 | function | `getCssVarMs` | `function getCssVarMs(name, fallback) {` |
| 365 | function | `postJson` | `function postJson(url, payload) {` |
| 373 | function | `initialsFromName` | `function initialsFromName(name) {` |
| 374 | const function | `cleaned` | `const cleaned = (name \|\| "").trim();` |
| 382 | function | `escapeRegExp` | `function escapeRegExp(value) {` |
| 386 | function | `normalizeLowerText` | `function normalizeLowerText(rawText, displayName) {` |
| 411 | function | `resolveOverlayText` | `function resolveOverlayText(overlay) {` |
| 443 | function | `setAvatar` | `function setAvatar(url, displayName) {` |
| 467 | function | `fitLowerText` | `function fitLowerText() {` |
| 476 | function | `applyOverlayData` | `function applyOverlayData(overlay) {` |
| 483 | function | `clearTimers` | `function clearTimers() {` |
| 494 | function | `resetAudio` | `function resetAudio() {` |
| 504 | function | `fullyHide` | `function fullyHide() {` |
| 517 | function | `finalizeOverlay` | `function finalizeOverlay() {` |
| 526 | function | `startOutro` | `function startOutro() {` |
| 546 | async function | `startAudioAfterIntro` | `async function startAudioAfterIntro() {` |
| 575 | function | `startOverlay` | `function startOverlay(overlay) {` |
| 600 | async function | `pollState` | `async function pollState() {` |
| 619 | function | `buildRunner` | `function buildRunner() {` |
| 640 | const function | `x` | `const x = (t - 0.5) / 0.5;` |
| 674 | function | `init` | `function init() {` |

## `htdocs/overlays/ws-client.js`

| Line | Type | Name | Snippet |
|---:|---|---|---|
| 15 | function | `pickWsUrl` | `function pickWsUrl(){` |
| 28 | const function | `proto` | `const proto = (typeof location !== "undefined" && location.protocol === "https:") ? "wss" : "ws";` |
| 31 | function | `connect` | `function connect(){` |
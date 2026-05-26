# Hug/Rehug-Modul - Deep Dive

Stand: 2026-05-26  
Quelle: Analyse des Uploads `backend.zip` / Datei `backend/modules/hug.js`.  
STEP: `STEP478_MODULE_DOCS_INTEGRATIONS_COMMUNITY_DEEP_DIVE`

## Zweck

Hug-/Rehug-Community-System mit SQLite-Usern, Paarstatistiken, Pending-Rehug, Textpaaren, Dashboard-Editoren und Chatbefehlen.

## Datei

- `backend/modules/hug.js`

## Erkannte API-Routen

| Methode | Pfad |
|---|---|
| `POST` | `/hug/action` |
| `POST` | `/api/hug/action` |
| `POST` | `/hug/stats` |
| `POST` | `/api/hug/stats` |
| `GET` | `/hug/cmd` |
| `GET` | `/api/hug/cmd` |
| `GET` | `/hug/statscmd` |
| `GET` | `/api/hug/statscmd` |
| `GET` | `/hug/top` |
| `GET` | `/api/hug/top` |
| `GET` | `/hug/reload` |
| `GET` | `/api/hug/reload` |
| `POST` | `/api/hug/command` |
| `GET` | `/api/hug/command` |
| `GET` | `/api/hug/status` |
| `GET` | `/api/hug/db/status` |
| `GET` | `/api/dashboard/community/hug/status` |
| `GET` | `/api/hug/config` |
| `GET` | `/api/hug/settings` |
| `GET` | `/api/hug/routes` |
| `GET` | `/api/hug/integration-check` |
| `POST` | `/api/hug/reload` |
| `GET` | `/api/hug/text-store/status` |
| `GET` | `/api/dashboard/community/hug/text-store/status` |
| `POST` | `/api/hug/text-store/reload` |
| `GET` | `/api/hug/db/output-mode` |
| `POST` | `/api/hug/db/output-mode` |
| `GET` | `/api/hug/types` |
| `GET` | `/api/hug/texts` |
| `GET` | `/api/hug/admin/text-pairs` |
| `GET` | `/api/dashboard/community/hug/text-pairs` |
| `POST` | `/api/hug/admin/text-pairs` |
| `POST` | `/api/dashboard/community/hug/text-pairs` |
| `GET` | `/api/hug/admin/hug-all-texts` |
| `GET` | `/api/dashboard/community/hug/hug-all-texts` |
| `POST` | `/api/hug/admin/hug-all-texts` |
| `POST` | `/api/dashboard/community/hug/hug-all-texts` |
| `GET` | `/api/hug/admin/response-texts` |
| `GET` | `/api/dashboard/community/hug/response-texts` |
| `POST` | `/api/hug/admin/response-texts` |
| `POST` | `/api/dashboard/community/hug/response-texts` |
| `GET` | `/api/hug/admin/top-title-texts` |
| `GET` | `/api/dashboard/community/hug/top-title-texts` |
| `POST` | `/api/hug/admin/top-title-texts` |
| `POST` | `/api/dashboard/community/hug/top-title-texts` |
| `GET/POST` | `/api/hug/command` |
| `GET/POST` | `/api/hug/admin/text-pairs` |
| `GET/POST` | `/api/dashboard/community/hug/text-pairs` |
| `GET/POST` | `/api/hug/admin/hug-all-texts` |
| `GET/POST` | `/api/dashboard/community/hug/hug-all-texts` |
| `GET/POST` | `/api/hug/admin/response-texts` |
| `GET/POST` | `/api/dashboard/community/hug/response-texts` |
| `GET/POST` | `/api/hug/admin/top-title-texts` |
| `GET/POST` | `/api/dashboard/community/hug/top-title-texts` |

## Erkannte Hauptfunktionen / interne Bereiche

- `outputResponse`
- `resolveUserByLogin`
- `executeAction`
- `handleCmd`
- `handleAction`
- `handleStatsCore`
- `handleStatsCmd`
- `handleStats`
- `handleTop`
- `handleReload`
- `handleCommand`
- `nowIso`
- `nowMs`
- `clean`
- `normalizeLogin`
- `readJsonIfExists`
- `clone`
- `deepMerge`
- `ensureSchema`
- `columnExists`
- `ensureHugTextPairSchema`
- `rowToTextPair`
- `getTextPairs`
- `getTextPairById`
- `insertTextPairIfMissing`
- `migrateTextPairsFromLegacyTexts`
- `pickTextPairForType`
- `pickWeightedTextPair`
- `pickWeightedHugTypeWithPairs`
- `saveTextPair`
- `deleteTextPair`
- `getTextPairEditorPayload`
- `handleTextPairsPayload`
- `count`
- `getSettingFromDb`
- `saveSettings`
- `saveMainSettingIfMissing`
- `upsertHugType`
- `insertTextIfMissing`
- `importJsonIfEmpty`
- `getTexts`
- `getTextsForEditor`
- `saveHugTextItem`
- `deleteHugTextItem`
- `getHugAllTextEditorPayload`
- `handleHugAllTextPayload`
- `getResponseTextEditorPayload`
- `handleResponseTextPayload`
- `getTopTitleTextEditorPayload`
- `handleTopTitleTextPayload`
- `pickWeighted`
- `pickText`
- `loadCache`
- `getCache`
- `renderTemplate`
- `responseText`
- `getRehugWindowMinutes`
- `getTypeById`
- `pickWeightedHugType`
- `mergeResult`
- `createUserIdentityMismatchError`
- `isUserIdentityMismatch`
- `ensureHugUser`
- `ensurePairRow`
- `getUserEnabled`
- `getStatsByUserId`
- `cleanupExpiredPendingForTarget`
- `cleanupExpiredPendingGlobal`
- `makeActor`
- `readCommandPayload`

## Erkannte Datenbanktabellen

- `hug_users`
- `hug_pair_stats`
- `hug_pending_rehugs`
- `hug_settings`
- `hug_types`
- `hug_texts`
- `hug_text_pairs`

## Wichtige Abhängigkeiten

- `SQLite Tabellen hug_*`
- `Twitch-Userauflösung`
- `Text-/Settings-Helper-Muster`
- `Dashboard Community Routen`

## Runtime-/State-Themen

- Das Modul wird über `backend/server.js`/Modul-Initialisierung geladen.
- Status-/Config-/Routes-/Integration-Check-Routen sind, soweit vorhanden, als primäre Diagnosepunkte zu verwenden.
- Echte Runtime-Werte müssen am Live-System über die Statusrouten geprüft werden; diese Doku beschreibt den aus Dateien erkennbaren Stand.

## Dashboard-/Overlay-Anbindung

- Dashboard-Dateien waren in diesem Upload nicht vollständig enthalten. Deshalb ist die Dashboard-Anbindung hier nur aus Backend-Routen ableitbar.
- Vor UI-Änderungen müssen die echten Dateien unter `htdocs/dashboard/` geprüft werden.
- Vor Overlay-Änderungen müssen die echten Dateien unter `htdocs/overlays/` geprüft werden.

## Risiken / Regeln

- `Datenbestand wurde aus Legacy importiert; DB nicht neu bauen/überschreiben.`
- `Text-Editoren und Hug-All-Texte sind produktive Chat-Ausgaben.`
- `Consent-Logik aktuell bewusst nicht als Einzelfall-Consent gebaut.`

## Sinnvolle Tests

- `GET /api/hug/status`
- `GET /api/hug/types`
- `GET /api/hug/admin/text-pairs`
- `GET /api/hug/integration-check`

## Offene Punkte

- Modul-Doku nach jedem funktionalen STEP aktualisieren.
- Dashboard-Dateien beim nächsten passenden UI-STEP ergänzend dokumentieren.
- Config-/Message-Dateien aus dem echten Repo/Live-Stand gegen diese Doku gegenprüfen.

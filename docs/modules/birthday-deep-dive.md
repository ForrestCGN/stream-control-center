# Birthday-Modul - Deep Dive

Stand: 2026-05-26  
Quelle: Analyse des Uploads `backend.zip` / Datei `backend/modules/birthday.js`.  
STEP: `STEP478_MODULE_DOCS_INTEGRATIONS_COMMUNITY_DEEP_DIVE`

## Zweck

Geburtstags-System mit Userregistrierung, automatischer kleiner Chat-Gratulation, manuell auslösbarer großer Show, Sound-System-Kopplung, MediaPicker/Assets und Dashboard-Admin.

## Datei

- `backend/modules/birthday.js`

## Erkannte API-Routen

| Methode | Pfad |
|---|---|
| `GET` | `/api/birthday/status` |
| `GET` | `/api/birthday/today` |
| `GET` | `/api/birthday/show/state` |
| `GET` | `/api/birthday/show/queue` |
| `POST` | `/api/birthday/show/queue/clear-stale` |
| `POST` | `/api/birthday/show/stop` |
| `POST` | `/api/birthday/admin/show/upload` |
| `POST` | `/api/birthday/admin/show/import-media` |
| `GET` | `/api/birthday/admin/show/assets` |
| `POST` | `/api/birthday/admin/show/recheck` |
| `GET` | `/api/birthday/admin/show/parties` |
| `POST` | `/api/birthday/admin/show/parties` |
| `POST` | `/api/birthday/admin/show/profile` |
| `GET` | `/api/birthday/admin/resolve-user` |
| `GET` | `/api/birthday/admin/users` |
| `POST` | `/api/birthday/admin/user` |
| `POST` | `/api/birthday/admin/user/delete` |
| `GET` | `/api/birthday/admin/settings` |
| `POST` | `/api/birthday/admin/settings` |
| `GET` | `/api/birthday/admin/texts` |
| `POST` | `/api/birthday/admin/texts` |
| `POST` | `/api/birthday/command` |
| `POST` | `/api/birthday/reload` |

## Erkannte Hauptfunktionen / interne Bereiche

- `cleanupStaleBirthdayShowQueue`
- `playBirthdayIntro`
- `playBirthdaySong`
- `enqueueBirthdaySoundBundle`
- `startBirthdayShow`
- `syncBirthdayShowFromSoundSystem`
- `assignBirthdayParty`
- `resolveTwitchUserInfo`
- `checkBirthdayUserPresence`
- `resolveBirthdayTarget`
- `isLiveByTagebuchState`
- `writeDiaryEntry`
- `sendChat`
- `maybeAutoGreetFromChat`
- `maybeHandleBirthdayChatCommandFallback`
- `birthdayWrappedHandleChatMessage`
- `handleBirthdayCommand`
- `updateBirthdayShowUploadReference`
- `importBirthdayMediaAssetFromRegistry`
- `importBirthdayMediaAsset`
- `handleBirthdayAssetUpload`
- `nowIso`
- `clean`
- `cleanLogin`
- `boolValue`
- `intValue`
- `deepMerge`
- `flattenSettingsObject`
- `setNestedValue`
- `readJsonIfExists`
- `writeJsonIfMissing`
- `configPath`
- `applyDbSettings`
- `loadRuntimeConfig`
- `textEditorOptions`
- `loadRuntimeMessages`
- `getConfig`
- `getMessages`
- `reloadRuntime`
- `pickSingleChatText`
- `renderText`
- `localParts`
- `formatBirthday`
- `calculateAgeForDate`
- `buildBirthdayContext`
- `textKeyWithAge`
- `publicShowState`
- `clearShowTimers`
- `scheduleShowTimer`
- `canStartParty`
- `normalizeAssetUrl`
- `safeRelativeMediaFile`
- `mediaInfoForSoundFile`
- `renderTemplate`
- `pickShowAsset`
- `mapShowQueueRow`
- `listBirthdayShowQueue`
- `nextShowQueuePosition`
- `findPendingBirthdayShowForLogin`
- `upsertShowQueueEntry`
- `updateShowQueueStatus`
- `cleanupOldShowQueueRows`
- `markPendingBirthdayShowsStale`
- `itemLooksLikeBirthdaySoundWork`
- `soundStateHasBirthdayWork`
- `soundPlayBase`
- `soundBundleItemBase`
- `buildBirthdaySoundBundle`
- `soundBundleResultStarted`
- `soundBundleResultQueued`

## Erkannte Datenbanktabellen

- `birthday_users`
- `birthday_greetings_log`
- `birthday_show_events`
- `birthday_show_profiles`
- `birthday_parties`
- `birthday_show_queue`
- `command_definitions`
- `media_assets`
- `sound_loudness_files`

## Wichtige Abhängigkeiten

- `SQLite Tabellen birthday_*`
- `Sound-System /api/sound/*`
- `Media-Modul / media_assets`
- `Twitch Userinfo/Presence`
- `Tagebuch-Eintrag`
- `command_definitions`

## Runtime-/State-Themen

- Das Modul wird über `backend/server.js`/Modul-Initialisierung geladen.
- Status-/Config-/Routes-/Integration-Check-Routen sind, soweit vorhanden, als primäre Diagnosepunkte zu verwenden.
- Echte Runtime-Werte müssen am Live-System über die Statusrouten geprüft werden; diese Doku beschreibt den aus Dateien erkennbaren Stand.

## Dashboard-/Overlay-Anbindung

- Dashboard-Dateien waren in diesem Upload nicht vollständig enthalten. Deshalb ist die Dashboard-Anbindung hier nur aus Backend-Routen ableitbar.
- Vor UI-Änderungen müssen die echten Dateien unter `htdocs/dashboard/` geprüft werden.
- Vor Overlay-Änderungen müssen die echten Dateien unter `htdocs/overlays/` geprüft werden.

## Risiken / Regeln

- `Große Geburtstagsshow darf nur manuell/gezielt ausgelöst werden.`
- `Sound-System-Kopplung nicht nebenbei umbauen.`
- `Geburtstagsdaten sind personenbezogen; sparsam anzeigen und nicht unnötig exportieren.`

## Sinnvolle Tests

- `GET /api/birthday/status`
- `GET /api/birthday/today`
- `GET /api/birthday/show/state`
- `GET /api/birthday/admin/users`
- `GET /api/birthday/admin/settings`

## Offene Punkte

- Modul-Doku nach jedem funktionalen STEP aktualisieren.
- Dashboard-Dateien beim nächsten passenden UI-STEP ergänzend dokumentieren.
- Config-/Message-Dateien aus dem echten Repo/Live-Stand gegen diese Doku gegenprüfen.

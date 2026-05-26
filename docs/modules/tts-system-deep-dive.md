# TTS-System Deep Dive

> Stand: 2026-05-26 / STEP477. Quelle: aktueller Upload `backend.zip`. Vor Codeänderungen weiterhin die echte Datei aus GitHub/dev oder Live vollständig prüfen.

## Zweck

`backend/modules/tts_system.js` verwaltet Chat-TTS und Alert-TTS. Es übernimmt Textannahme, Rollen-/Permission-Prüfung, Queue, Voice-Auswahl, Google/Piper-Synthese, Sound-System-Ausgabe, Overlay-State, Admin-Settings, Textverwaltung, Events und Statistik.

## API-Routen

| Methode | Route |
|---|---|
| `ALL` | `/api/tts/run` |
| `ALL` | `/api/tts/say` |
| `ALL` | `/api/tts/done` |
| `GET` | `/api/tts/status` |
| `GET` | `/api/tts/overlay-state` |
| `ALL` | `/api/tts/on` |
| `ALL` | `/api/tts/off` |
| `ALL` | `/api/tts/stop` |
| `ALL` | `/api/tts/clear` |
| `ALL` | `/api/tts/reload` |
| `ALL` | `/api/tts/command` |
| `GET` | `/api/tts/settings` |
| `POST` | `/api/tts/settings/upsert` |
| `GET` | `/api/tts/config` |
| `GET` | `/api/tts/voices` |
| `GET` | `/api/tts/routes` |
| `GET` | `/api/tts/integration-check` |
| `GET` | `/api/tts/admin/settings` |
| `POST` | `/api/tts/admin/settings` |
| `GET` | `/api/tts/admin/texts` |
| `POST` | `/api/tts/admin/texts` |
| `GET` | `/api/tts/events` |
| `GET` | `/api/tts/stats` |
| `GET` | `/api/tts/stats/users` |
| `ALL` | `/api/tts/prepare-alert` |
| `ALL` | `/api/tts/synthesize` |

## Hauptfunktionen / interne Bereiche

- Config: `init`, `loadJson`, `saveJson`, `reloadAllConfig`, `applyDbSettingsToConfig`.
- DB: `ensureDbSchema`, `seedDbSettings`, `listDbSettingsMap`, `loadDbMessages`, `listAdminTexts`, `setAdminTexts`.
- Queue: `sayWithData`, `startNext`, `stop`, `clear`, `done`, `sortQueue`.
- Synthese: `synthesize`, `synthesizeGoogle`, `synthesizePiper`, Fallback-Voice-Logik.
- Sound-System: `playChatTtsViaSoundSystem`, `waitForChatTtsPlaybackSlot`.
- Alert-TTS: `prepareAlertTts`.
- Statistik: `recordUsageDaily`, `insertTtsEvent`.

## Datenbanktabellen

| Tabelle | Zweck | Wichtige Spalten |
|---|---|---|
| `tts_events` | TTS-Event-Historie | `event_uid`, `source`, `mode`, `status`, `user_login`, `text`, `voice_id`, `engine`, `audio_file`, `audio_url`, `duration_ms`, `error`, `created_at`, `started_at`, `finished_at` |
| `tts_usage_daily` | tägliche Nutzungsstatistik | `usage_date`, `source`, `mode`, `engine`, `requests_total`, `requests_ok`, `requests_failed`, `chars_total`, `duration_ms_total` |

Zusätzlich nutzt das Modul Settings-/Text-Helper.

## Tests

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/tts/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/tts/routes"
Invoke-RestMethod "http://127.0.0.1:8080/api/tts/integration-check"
Invoke-RestMethod "http://127.0.0.1:8080/api/tts/voices"
```

## Offene Punkte

- Google/Piper-Readiness lokal prüfen, ohne Secrets zu dokumentieren.
- Sound-System-Playback-Slots mit Alerts/VIP-Sounds koordinieren.

# CURRENT SYSTEM STATUS

Stand: 2026-05-06

## Zweck

Diese Datei ist der aktuelle Einstiegspunkt fuer den Projektstand.

Historische Analyse-Snapshots liegen unter:

- `docs/system-inspection/2026-05-03/`
- `docs/backend/`
- `docs/dashboard/`
- `docs/overlays/`
- `docs/database/`

Diese Snapshots bleiben historische Staende und werden nicht blind ueberschrieben.

## Single Source of Truth

Branch:

- `dev`

Repo:

- `D:\Git\stream-control-center`

Live:

- `D:\Streaming\stramAssets`

GitHub:

- `https://github.com/ForrestCGN/stream-control-center`

Aktueller Arbeitsgrundsatz:

- GitHub/dev ist Single Source of Truth.
- Live wird ueber `tools\easy\01_LIVE_AKTUALISIEREN_VON_GITHUB.cmd` aktualisiert.
- Nach manuellem Entpacken eines STEP-ZIPs ist der Standardabschluss:
  ```powershell
  .\stepdone.cmd "commit beschreibung"
  ```
- Nach abgeschlossenen Blocks werden `docs/current/CURRENT_SYSTEM_STATUS.md` und `project-state/*` aktualisiert.
- Keine Secrets, `.env`, SQLite-/DB-Dateien, Backups, ZIPs oder Tokens committen.
- Keine Funktionalitaet entfernen.

## Aktueller Standardablauf nach ZIP-Entpacken

ZIPs werden manuell nach Repo-Root entpackt:

```text
D:\Git\stream-control-center
```

Danach Standardabschluss:

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "feat: kurze passende commit beschreibung"
```

Das Script macht Syntaxcheck, Git-Add, Sicherheitscheck, Commit, Push nach `origin/dev` und Live-Deploy ueber das bekannte Script.

## Zuletzt abgeschlossene Hauptbereiche

### SoundAlerts / Sound-System - STEP192 bis STEP192.3

Aktueller Stand:

- `soundalerts_bridge` laeuft live auf Version `0.1.5`.
- SoundAlerts Bridge ist erfolgreich mit Sound-System und Dashboard verbunden.
- Echter SoundAlerts-Chattrigger wurde erfolgreich getestet:
  - `ForrestCGN spielt Fahrstuhl Sound fuer 0 Bits!`
- Sound-System bekam korrekt:
  - `source = soundalerts_bridge`
  - `requestedBy = ForrestCGN`
  - `file = soundalerts/video/3cgn.mp4`
  - `category = channel_reward`
  - `outputTarget = overlay`
  - `priority = 70`
  - `volume = 100`

Aktive SoundAlerts-DB-Strukturen:

- `soundalerts_bridge_events`
- `soundalerts_bridge_entries`
- `soundalerts_bridge_meta`
- `soundalerts_bridge_settings`

Aktive SoundAlerts-Regeln:

- DB ist Hauptspeicher fuer dashboardfaehige SoundAlert-Eintraege und technische Settings.
- JSON `config/soundalerts_bridge.json` bleibt Seed/Fallback/Notfall.
- `.env` bleibt fuer Secrets/Tokens/private Keys.
- Neue DB-Logik soll nach Moeglichkeit ueber `backend/core/database.js` oder vorhandene Helper laufen.
- MariaDB ist vorbereitet, aber noch nicht komplett implementiert: `backend/core/database.js` braucht spaeter einen echten MariaDB-Adapter.

Aktive SoundAlerts-Dateien:

- `backend/modules/soundalerts_bridge.js`
- `htdocs/dashboard/modules/soundalerts.js`
- `config/soundalerts_bridge.json`

Aktive SoundAlerts-Routen:

- `GET /api/soundalerts/status`
- `GET /api/soundalerts/settings`
- `POST /api/soundalerts/settings`
- `GET /api/soundalerts/entries`
- `POST /api/soundalerts/entries`
- `GET /api/soundalerts/config`
- `POST /api/soundalerts/config`

Aktueller getesteter Eintrag:

```json
{
  "id": "fahrstuhl_sound",
  "enabled": true,
  "status": "active",
  "soundAlertName": "Fahrstuhl Sound",
  "label": "Fahrstuhl Sound",
  "file": "soundalerts/video/3cgn.mp4",
  "mediaType": "video",
  "category": "channel_reward",
  "outputTarget": "overlay",
  "volume": 100
}
```

Wichtige SoundAlerts-Dokus:

- `project-state/STEP192_1_SOUNDALERTS_ENTRIES_DB_2026-05-06.md` falls lokal vorhanden
- `project-state/STEP192_1_1_SOUNDALERTS_DEFAULTS_SAVE_CLEANUP_2026-05-06.md`
- `project-state/STEP192_2_SOUNDALERTS_SETTINGS_DB_2026-05-06.md`
- `project-state/STEP192_2_1_SOUNDALERTS_DB_CORE_PORTABILITY_2026-05-06.md`
- `project-state/STEP192_3_SOUNDALERTS_DOC_SYNC_2026-05-06.md`

Bewusst offen fuer SoundAlerts:

- STEP193 SoundAlerts Inbox / Auto Entries.
- Neue unbekannte SoundAlerts automatisch als DB-Eintrag sichtbar machen.
- Datei fehlt/vorhanden sauber als Status abbilden.
- Upload/Zuordnung direkt aus dem Eintrag heraus.
- Admin-Config UI fuer SoundAlerts spaeter sauber vom Sound-System trennen.
- Grosse Video-Uploads optional ueber DB-Setting erhoehen.
- Echter MariaDB-Adapter spaeter in `backend/core/database.js`.

### Clip-System - STEP183 bis STEP187.5

Aktueller Stand:

- Das Clip-System ist im Backend bis STEP187 vorbereitet.
- `backend/modules/clips.js` ist das zentrale Clip-Modul.
- Bestehende Routen bleiben erhalten:
  - `GET /api/clip/status`
  - `GET /api/clip/title`
  - `GET/POST /api/clip/register`
  - `GET /api/clip/history`
- Neue/aktuelle Backend-Create-Routen:
  - `GET/POST /api/clip/create`
  - `GET /api/clip/job/:jobId`
- Twitch-Readiness ist vorhanden ueber:
  - `GET /api/twitch/auth/validate`
  - `GET /twitch/auth/validate`
  - `GET /auth/validate`
- Twitch-Token ist live bestaetigt:
  - User: `forrestcgn`
  - User-ID/Broadcaster-ID: `127709954`
  - Scope `clips:edit`: vorhanden
- OBS-Readiness ist live bestaetigt:
  - `GET /api/obs/replay/status`
  - Replay Buffer aktiv, wenn OBS entsprechend laeuft
- Discord-Posting nutzt die vorhandene Discord-Bridge, keine eigene Discord-Verbindung.
- Discord-Ziel ist dashboardfaehig vorbereitet:
  - `discordChannelMode = key|custom`
  - `discordChannelKey`
  - `discordChannelId`
- Clip-Settings liegen in `clip_settings`.
- Clip-Texte liegen variantenfaehig in `module_text_variants` mit `module = clips`.
- JSON-Dateien bleiben Seed/Fallback:
  - `config/clip_system.json`
  - `config/messages/clips.json`
- `clip_history` laeuft auf Schema-Version `3`.

Wichtige Clip-Fachregel:

```text
Twitch-Clip: ca. 30 Sekunden, sofort bei !clip ausloesen.
OBS-Replay: 60 Sekunden lokal, 30 Sekunden vor !clip und 30 Sekunden nach !clip.
Daher: SaveReplayBuffer erst 30 Sekunden nach !clip ausloesen.
```

Bewusst offen fuer Clip:

- Echter Live-Test von `/api/clip/create` waehrend aktivem Twitch-Stream.
- Streamer.bot-Action danach auf einen Backend-Call reduzieren.
- Clip-Dashboard bauen.

### Hug / Rehug - STEP181 bis STEP182.6

Aktueller Stand:

- Hug/Rehug Backend laeuft auf `schemaVersion = 3`.
- Neue gekoppelte Textpaare liegen in `hug_text_pairs`.
- `hug_pending_rehugs` speichert `pair_id`.
- Dashboard-Bedienung wurde vereinfacht: Textpaar / Text / Antwort-Text statt Typen-Komplexitaet.
- Hug/Rehug-Paare, Chatweite Hugs, Systemantworten und Toplisten sind im Dashboard editierbar.

Aktive Dateien:

- `backend/modules/hug.js`
- `htdocs/dashboard/modules/hug.js`
- `htdocs/dashboard/modules/hug.css`
- `config/hug_system.json`
- `config/messages/hug.json`

### Tagebuch / Todo - STEP176 bis STEP180

Kernstatus:

- Tagebuch nutzt DB-Settings ueber `tagebuch_settings`.
- Todo nutzt DB-Settings ueber `todo_settings`.
- Tagebuch- und Todo-Texte liegen dashboardfaehig und variantenfaehig in `module_text_variants`.
- `module_texts` bleibt als Legacy-/Kompatibilitaetsschicht erhalten.
- JSON-Dateien bleiben Seed/Fallback.
- Dashboard-Module fuer Tagebuch und Todo sind im Community-Bereich aktiv.

### Sound / Alert / TTS

Referenz:

- `project-state/STEP172_SOUND_ALERT_TTS_STATUS_CURRENT_2026-05-05.md`

Kernstatus:

- Alert-Hauptsound laeuft ueber Sound-System.
- Alert-TTS laeuft als eigenes Sound-System-Item hinter Alert-Hauptsound.
- Chat-TTS wartet, bis Alert-Kette idle ist.
- Overlay bleibt bis nach Alert-TTS sichtbar.
- Sound-System bleibt Audio-Wahrheit.

### VIP / VIP-Sound Dashboard

Aktueller VIP-Dashboard-Block ist bis STEP175.5 dokumentiert.

Aktive VIP-Dateien:

- `backend/modules/vip_sound_overlay.js`
- `htdocs/dashboard/modules/vip.js`
- `htdocs/dashboard/modules/vip.css`
- `htdocs/overlays/vip_sound_overlay_v2.html`

Fachliche VIP-Regel:

- Nur Twitch VIP oder Twitch Mod ist berechtigt.
- Keine Berechtigung aus lokalen Overrides.
- Keine Berechtigung aus Daily-Usage, Events oder Historie.

## Aktive Dashboard-Module

- Stream-Desk
- Control-Uebersicht
- Alerts V2
- OBS Details
- Sound-System
- SoundAlerts
- Hug-System
- Tagebuch
- Todo
- VIP-System
- Admin Configs

Clip-Dashboard ist noch offen.

## Modulstandard

Fuer alle kuenftigen Dashboard-Module gilt als Zielstandard:

1. Dashboardfaehige Settings liegen primaer in DB.
2. Dashboardfaehige Texte liegen primaer in DB.
3. JSON-Dateien bleiben technische Config, Import oder Fallback.
4. Dashboard greift nie direkt auf SQLite oder Dateien zu.
5. Dashboard nutzt nur Backend-APIs.
6. Vorhandene Helper werden genutzt, keine Parallelstrukturen.
7. Harte Texte im Code sind nur Seed-Defaults, nicht dauerhafte Quelle.
8. Keine Funktionalitaet entfernen.
9. Neue DB-Logik nach Moeglichkeit ueber `backend/core/database.js` oder vorhandene Helper aufbauen.

### Globaler DB-Portability-Standard

Fuer alle Module gilt ab jetzt verbindlich:

- SQLite ist aktuell die aktive Datenbank und bleibt der funktionierende Standard/Fallback.
- Neue Module und neue DB-Features muessen so geplant werden, dass sie spaeter auf MariaDB umgestellt werden koennen.
- Neue DB-Zugriffe sollen nicht direkt an `sqlite_core.js` gekoppelt werden, wenn eine Nutzung ueber `backend/core/database.js` oder vorhandene Helper moeglich ist.
- Dashboardfaehige Settings sollen ueber `helper_settings.js` oder eine gleichwertige zentrale Settings-Schicht laufen.
- Dashboardfaehige Texte sollen ueber `helper_texts.js` oder eine gleichwertige zentrale Text-Schicht laufen.
- SQLite-spezifische SQL-Syntax darf bei neuen Arbeiten nicht unnoetig in Modulcode verteilt werden. Wenn sie noetig ist, muss sie dokumentiert und spaeter zentral kapselbar bleiben.
- MariaDB wird erst aktiv genutzt, wenn der echte Adapter in `backend/core/database.js` implementiert und getestet ist. Bis dahin duerfen Module nicht so gebaut werden, dass SQLite kaputtgeht.

Aktuelle Helper-Lage:

- `helper_settings.js` ist DB-Settings-Standard.
- `helper_texts.js` unterstuetzt zentrale DB-Modultexte und Textvarianten via `module_texts`/`module_text_variants`; JSON bleibt Seed/Fallback.
- `helper_messages.js` wird fuer Platzhalter-/Message-Handling genutzt.
- `obs_shared.js` ist die vorhandene OBS-WebSocket-Schicht.
- `discordBridge` aus `discord.js` ist die vorhandene Discord-Schicht.
- Twitch-/OAuth-/Helix-Logik bleibt in `twitch.js`.
- `backend/core/database.js` ist die Zielschicht fuer spaetere DB-Portabilitaet; MariaDB-Adapter ist geplant, aber noch nicht implementiert.

## Wichtige Regeln

- Keine Funktionalitaet entfernen.
- Vor Aenderungen echten Dateistand pruefen.
- GitHub/dev und Live bewusst synchron halten.
- Keine Secrets committen.
- Keine SQLite-Dateien committen.
- Alle Module langfristig MariaDB-tauglich planen; SQLite bleibt aktuell aktiv und muss weiter funktionieren.
- Keine Backups/Altdateien committen.
- Historische Analyse-Snapshots nicht ueberschreiben.
- Aktuellen Stand in `docs/current/CURRENT_SYSTEM_STATUS.md` und `project-state/*` aktuell halten.
- Nach jedem abgeschlossenen Block STEP-Doku schreiben.
- Bei Hug/Rehug muessen Text und Antwort immer gekoppelt bleiben.
- Beim Clip-System muss OBS lokal 60 Sekunden speichern: 30s vor `!clip`, 30s nach `!clip`.

## Offene Punkte

### SoundAlerts

- STEP193 SoundAlerts Inbox / Auto Entries.
- Automatische Erkennung unbekannter SoundAlerts.
- Statuslogik fuer `new_detected`, `missing_file`, `file_matched`, `ready`.
- Dashboard-Anbindung fuer neue/inbox Eintraege.
- Datei hochladen/zuweisen direkt aus einem erkannten Eintrag.

### Clip-System

- Echter Live-Test von `/api/clip/create` waehrend aktivem Stream.
- Danach Streamer.bot-Action reduzieren.
- Danach Clip-Dashboard bauen.

### Hug / Rehug

- Finaler Browser-UX-Check fuer alle vier Text-Kategorien.
- Optional Audit-Logging fuer Textaenderungen.

### VIP

- Echte 7-/30-Tage-Statistik backendseitig ergaenzen.
- Upload-UX nur behutsam weiter verbessern.

### System allgemein

- Provider-/Settings-Ausgaben maskieren.
- `liveAlert`/`livealert` Duplikat in Alert-Settings spaeter bereinigen.
- Dashboard-Rollen/Rechte und Audit-Logging vorbereiten.
- Fireworks spaeter neu aufbauen.
- Alerts-Modul spaeter behutsam splitten.
- Overlays langfristig mit einheitlichem Overlay-Client standardisieren.
- Echten MariaDB-Adapter spaeter in `backend/core/database.js` implementieren.

## Naechster empfohlener Schritt

1. SoundAlerts Inbox / Auto Entries planen und bauen:
   - unbekannte SoundAlerts automatisch in DB sichtbar machen
   - Datei fehlt/vorhanden als Status speichern
   - Dashboard soll Eintraege direkt bearbeiten/zuweisen koennen
2. Danach weiterhin Clip-Live-Test beim naechsten aktiven Stream offen halten.

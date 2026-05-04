# Changelog

## 2026-05-04

### STEP046 - Alert-Sounds frueh in Sound-System-Queue eingereiht

- `backend/modules/alert_system.js` angepasst.
- Alert-Hauptsound wird jetzt frueher beim Alert-Enqueue an das Sound-System uebergeben.
- Ziel: Alerts mit hoeherer Prioritaet koennen wartende Chat-TTS-Sounds ueberholen.
- Sound-System-Prio wurde isoliert getestet:
  - `alert` Prioritaet 80 vor `tts` Prioritaet 50.
  - `sortByPriority=true`.
  - `allowParallel=false`.
  - `maxParallel=1`.
- Realtest bestaetigt:
  - Crew-Sound laeuft zuerst fertig.
  - Danach Alert-Sound.
  - Danach Chat-TTS.
- Abschlussstatus sauber:
  - Sound-System current/queue leer.
  - TTS playing/current/queue leer.
  - Alert current/queue leer.
- Keine Funktionalitaet entfernt.

### STEP045 - Chat-TTS Queue mit Sound-System synchronisiert

- `backend/modules/tts_system.js` erweitert.
- Chat-TTS laeuft weiterhin ueber Sound-System.
- TTS-interne Freigabe wurde auf Sound-System-Status vorbereitet.
- DB-Setting `chatTts.doneMode = sound_system_status` vorgesehen.
- Ziel: Sound-System bleibt Audio-Wahrheit; TTS-Queue soll nicht nur auf lokale Dauer-Timer vertrauen.
- Keine Overlay-Audio-Ausgabe fuer Chat-TTS im Sound-System-Modus.

### STEP044.8 - TTS Overlay adaptive Breite

- `htdocs/overlays/_overlay-tts.html` angepasst.
- TTS-Overlay nutzt adaptive Breite:
  - kurze Texte wirken nicht verloren.
  - lange Texte koennen bis zur Maximalbreite wachsen.
  - sehr lange Texte bleiben per Clamp begrenzt.
  - lange Anzeigenamen bleiben einzeilig mit Ellipsis.
- Avatar/Layout bleibt stabil.

### STEP044.7 - TTS Overlay Border-/Avatar-Tweak

- Innere Umrandung im TTS-Overlay entfernt.
- Aeusserer Neon-Rahmen bleibt erhalten.
- Avatar leicht vergroessert.
- Long-Text-Verhalten blieb erhalten.
- Spaetere Dashboard-Settings fuer Overlay-Optik vorgemerkt.

### STEP044.6 - TTS Overlay Avatar, Displayname und Position korrigiert

- TTS-Overlay zeigt Avatar-Kreis statt generischem Mikrofon-Orb.
- Avatar/Displayname werden ueber Visualdaten und Userinfo-Fallback aufgeloest.
- Anzeigename wird bevorzugt gegenueber Login angezeigt.
- Position wurde hoeher gesetzt, damit die Card nicht am unteren Rand klebt.

### STEP044.5 - TTS Overlay Layout bereinigt

- `TEXT TO SPEECH`-Titel entfernt.
- Rollen-Badge wie `BROADCASTER` entfernt.
- Voice-/Engine-Footer im normalen Streambetrieb ausgeblendet.
- Debug-Informationen nur noch bei Debug-Parametern vorgesehen.

### STEP044.4 - TTS Overlay ueber Sound-System Visual State

- Chat-TTS-Overlay wurde nach VIP-Prinzip umgebaut.
- Sound-System ist Anzeigequelle:
  - TTS-System erzeugt Audio.
  - TTS-System gibt Audio an `/api/sound/play`.
  - Sound-System spielt Audio.
  - TTS-Overlay pollt `/api/sound/status`.
  - Overlay zeigt nur Sound-System-current mit `visual.module = tts_overlay`.
- Kein Audio mehr aus dem TTS-Overlay im Sound-System-Modus.

### STEP044.3 - TTS Overlay-State Endpoint vorbereitet

- `GET /api/tts/overlay-state` vorbereitet.
- Backendgefuehrter TTS-Overlay-State wurde getestet, aber spaeter durch Sound-System-Visual-State als stabileren VIP-Ansatz abgeloest.

### STEP044.2 - TTS Overlay Poll-Fallback vorbereitet

- TTS-Overlay bekam Polling-Fallback fuer visuelle Anzeige.
- Zwischenstand, spaeter durch Sound-System-Visual-State ersetzt.

### STEP044.1 - TTS Visual vor Sound-System Playback vorbereitet

- Visual-Event fuer Chat-TTS wurde frueher ausgeliefert.
- Zwischenstand, spaeter durch Sound-System-Visual-State ersetzt.

### STEP044 - Chat-TTS ueber Sound-System vorbereitet

- Normales Chat-TTS kann ueber Sound-System ausgegeben werden.
- TTS-Overlay wurde auf reine Anzeige im Sound-System-Modus vorbereitet.
- DB-Setting `chatTts` eingefuehrt/vorgesehen:
  - `playbackMode`
  - `soundSystemPlayUrl`
  - `soundSystemOutputTarget`
  - `doneMode`
  - `fallbackToOverlay`
- Ziel: Chat-TTS Audio nicht mehr vom OBS-Browseroverlay abhaengig machen.

### STEP043 - TTS generierte Dateien unter Sound-System-Basis abgelegt

- Generierte TTS-Dateien werden unter `htdocs/assets/sounds/tts/generated/` abgelegt.
- Dateien sind dadurch direkt ueber Sound-System-kompatible Pfade nutzbar.
- `soundSystemFile` wird als relativer Sound-System-Pfad zurueckgegeben.

### STEP042 - Alert-TTS Vorbereitung und Timing-Support

- Alert-TTS fuer Ko-fi/Tipeee vorbereitet.
- `/api/tts/prepare-alert` erstellt Audio und liefert Dauerinformationen.
- Alert-System nutzt TTS-Dauer zur Anzeigezeitberechnung.
- Alert bleibt bis nach TTS-Ausgabe sichtbar.
- Alert-TTS kann nach dem Alert-Hauptsound abgespielt werden.

### STEP041 - TTS / Alert / Sound-System Analyseplan

- Ist-Analyse fuer TTS, Sound-System und Alerts vorbereitet.
- Zielrichtung festgelegt:
  - dashboardfaehige Werte in DB.
  - `helper_settings.js` fuer DB-Settings.
  - `helper_config.js` fuer JSON/Fallbacks/Imports.
  - ENV/Secrets nur fuer Secrets/systemnahe Pfade.

### Dependency - Google Text-to-Speech Manifest gesichert

- `package.json` und `package-lock.json` ins Repo uebernommen.
- `@google-cloud/text-to-speech` als Node-Dependency gesichert.
- Grund: Google-TTS muss nach frischem Deploy/Setup reproduzierbar installiert werden koennen.
- `node_modules` wurde nicht committed.

### STEP040 - VIP Backend Reference / Dashboard Ready Status

- Neuer Referenzstand fuer den spaeteren VIP-Dashboard-Chat angelegt:
  - `project-state/STEP040_VIP_BACKEND_REFERENCE_DASHBOARD_READY_2026-05-04.md`
- VIP-Backend-Block als dashboard-ready dokumentiert.
- Live-Version des VIP-Moduls: `1.8.5`.
- Dokumentiert wurden:
  - aktueller VIP-Ablauf
  - Datenbanktabellen
  - Dashboard-faehige APIs
  - Settings-/Config-Strategie
  - getestete Live-Punkte
  - offene Dashboard-Punkte
- Wichtige Arbeitsregel ergaenzt:
  - Dashboard-faehige Werte primaer in DB.
  - JSON-Dateien nur fuer technische Configs, Fallbacks oder Imports.
  - Dashboard liest/schreibt nur ueber Backend-APIs.
  - Bestehende Systeme spaeter pruefen und ggf. schrittweise angleichen.
- Keine Codeaenderung.
- Keine SQLite-/Secret-/Backup-Dateien committed.

### STEP039 - VIP Admin-/Test-Routen vorbereitet

- `backend/modules/vip_sound_overlay.js` auf Version `1.8.5` aktualisiert.
- Neue Dashboard-/Admin-Routen:
  - `GET /api/vip-sound/admin/summary`
  - `POST /api/vip-sound/admin/reset-daily`
  - `GET /api/vip-sound/admin/reset-daily`
  - `POST /api/vip-sound/test`
  - `POST /api/vip-sound/admin/test`
- Live getestet:
  - `/api/vip-sound/admin/summary` liefert Status, Settings, Rollen, Daily-Usage, Events und Stats.
  - `/api/vip-sound/admin/reset-daily` loescht heutige Daily-Usage.
- Keine SQLite-/Secret-/Backup-Dateien committed.

### STEP038 - VIP Settings Write API vorbereitet

- `backend/modules/vip_sound_overlay.js` auf Version `1.8.4` aktualisiert.
- Neue Routen:
  - `POST /api/vip-sound/settings/upsert`
  - `POST /api/vip-sound/settings/delete`
  - `POST /api/vip-sound/settings/reset-defaults`
- Live getestet:
  - `fileExtension` wurde erfolgreich per API in `vip_sound_settings` aktualisiert.
- Dashboard-Schreibweg fuer VIP-Settings ist vorbereitet.
- Keine SQLite-/Secret-/Backup-Dateien committed.

### STEP037 - VIP nutzt zentralen Settings-Helper

- `backend/modules/vip_sound_overlay.js` auf Version `1.8.3` aktualisiert.
- VIP nutzt jetzt `backend/modules/helpers/helper_settings.js` fuer Settings.
- Lesereihenfolge bleibt:
  1. Datenbank
  2. JSON-Fallback ueber `helper_config.js`
  3. Code-Default
- Live getestet:
  - Settings kommen weiterhin aus der Datenbank.
  - JSON-Fallback wird korrekt angezeigt.
- Keine SQLite-/Secret-/Backup-Dateien committed.

### STEP036 - Zentraler Settings-Helper vorbereitet

- Neue Datei `backend/modules/helpers/helper_settings.js` ergaenzt.
- Zweck: zentrale DB-Settings-Schicht fuer dashboardfaehige Modul-Einstellungen.
- Nutzt bestehende Layer:
  - `backend/core/database.js` fuer SQLite/DB-Zugriff
  - `backend/modules/helpers/helper_config.js` fuer JSON-Config-Fallbacks
- Trennung bleibt bewusst erhalten:
  - `helper_config.js` fuer Dateien/JSON
  - `helper_settings.js` fuer DB-Settings + optionale Datei-Fallbacks
- Unterstuetzte Werttypen: `string`, `number`, `boolean`, `json`.
- Keine bestehende Modul-Funktionalitaet geaendert.
- Keine SQLite-/Secret-/Backup-Dateien committed.

### STEP035 - VIP Text API vorbereitet

- `backend/modules/vip_sound_overlay.js` auf Version `1.8.2` aktualisiert.
- Neue Routen:
  - `GET /api/vip-sound/texts`
  - `GET /api/vip-sound/texts/event-keys`
  - `POST /api/vip-sound/texts/upsert`
  - `POST /api/vip-sound/texts/toggle`
  - `POST /api/vip-sound/texts/delete`
- Live getestet:
  - Texte werden gelesen.
  - Event-Keys werden gruppiert.
  - Falscher `accepted_mod`-Text wurde in der Live-DB deaktiviert.
- Keine SQLite-/Secret-/Backup-Dateien committed.

### STEP034.1 - VIP Rollen-Config-Pfad korrigiert

- `backend/modules/vip_sound_overlay.js` auf Version `1.8.1` aktualisiert.
- Rollen-Fallback-Pfad wird korrekt ueber `helper_config.js` aufgeloest.
- Live getestet:
  - `D:\Streaming\stramAssets\config\vip_sound_roles.json`
  - `configFallback.exists = true`
- Keine SQLite-/Secret-/Backup-Dateien committed.

### STEP034 - VIP Rollen-Fallbacks in DB vorbereitet

- `backend/modules/vip_sound_overlay.js` auf Version `1.8.0` aktualisiert.
- Neue Tabelle:
  - `vip_sound_role_overrides`
- Neue Routen:
  - `GET /api/vip-sound/roles`
  - `POST /api/vip-sound/roles/upsert`
  - `POST /api/vip-sound/roles/delete`
  - `POST /api/vip-sound/roles/import-config`
- Rollen-Erkennung laeuft ueber:
  1. Twitch-Erkennung
  2. DB-Rollen-Fallbacks
  3. JSON-Import-/Fallback-Quelle
- Keine SQLite-/Secret-/Backup-Dateien committed.

### STEP033 - VIP Events-/Statistikbasis vorbereitet

- `backend/modules/vip_sound_overlay.js` auf Version `1.7.9` aktualisiert.
- Schema-Version auf `3` erweitert.
- Neue Tabelle:
  - `vip_sound_events`
- Neue Routen:
  - `GET /api/vip-sound/events`
  - `GET /api/vip-sound/events/recent`
  - `GET /api/vip-sound/stats`
- Live getestet:
  - Event wurde geschrieben.
  - Stats liefern akzeptierte Events, SoundType und Top-User.
- Keine SQLite-/Secret-/Backup-Dateien committed.

### STEP032 - VIP Sounddatei-Settings aktiv genutzt

- `backend/modules/vip_sound_overlay.js` auf Version `1.7.8` aktualisiert.
- Aktiv aus `vip_sound_settings` genutzt:
  - `enabled`
  - `soundBaseDir`
  - `fileNameMode`
  - `fileExtension`
- Bestehendes Verhalten bleibt gleich, Quelle ist jetzt DB-basiert.
- Live getestet:
  - `vip/araglor.mp3` wurde gefunden.
  - Mod-Sound lief.
  - Daily-Usage wurde bei Self-Trigger geschrieben.
- Keine SQLite-/Secret-/Backup-Dateien committed.

### STEP031 - VIP DB-Settings-Basis vorbereitet

- `backend/modules/vip_sound_overlay.js` auf Version `1.7.7` aktualisiert.
- Schema-Version auf `2` erweitert.
- Neue Tabelle:
  - `vip_sound_settings`
- Neue Routen:
  - `GET /api/vip-sound/settings`
  - `GET /api/vip-sound/config`
- `helper_config.js` wird als JSON-Fallback-Layer genutzt.
- Live getestet:
  - `settingsRows = 8`
  - DB-backed Settings funktionieren.
- Keine SQLite-/Secret-/Backup-Dateien committed.

### STEP030 - VIP Referenzstand dokumentiert

- VIP-Zwischenstand nach STEP029 dokumentiert.
- Keine Codeaenderung.
- Keine SQLite-/Secret-/Backup-Dateien committed.

### STEP029 - VIP Daily-Usage API Semantik korrigiert

- `backend/modules/vip_sound_overlay.js` auf Version `1.7.6` aktualisiert.
- `/api/vip-sound/daily-usage` zeigt ohne Filter alle Eintraege.
- `/api/vip-sound/daily-usage/today` zeigt nur heute.
- `/api/vip-sound/daily-usage/reset` loescht ohne Filter alle Eintraege.
- `/api/vip-sound/daily-usage/reset-today` loescht nur heute.
- Live getestet.
- Keine SQLite-/Secret-/Backup-Dateien committed.

### STEP028 - VIP Daily-Usage API vorbereitet

- `backend/modules/vip_sound_overlay.js` auf Version `1.7.5` aktualisiert.
- Neue Daily-Usage-Routen ergaenzt.
- Zweck: Tests und spaeteres Dashboard ohne temporaere SQLite-Loeschscripts.
- Keine SQLite-/Secret-/Backup-Dateien committed.

### STEP027 - VIP-Texte auf Heimaufsicht umgestellt

- Sichtbare Default-Chattexte sagen jetzt `Heimaufsicht` statt `Heimleitung`.
- Interne Style-ID `heimleitung` bleibt unveraendert.
- Keine Daily-Usage-, Sound-System-, Twitch-Rollen-, Override- oder Overlay-Logik geaendert.
- Keine SQLite-/Secret-/Backup-Dateien committed.

### STEP026 - VIP Twitch-Rollenhelper vorbereitet

- Neue Datei `backend/modules/helpers/helper_twitch_roles.js` ergaenzt.
- Zieluser-Rollenpruefung fuer VIP-Sounds nutzt zuerst Twitch.
- `config/vip_sound_roles.json` bleibt Fallback/Override erhalten.
- Keine SQLite-/Secret-/Backup-Dateien committed.

### STEP023 - VIP Streamer.bot -> Sound-System -> Overlay V2 getestet

- Echter Streamer.bot-Command `!vip` wurde neu auf den neuen Backend-/Sound-System-Ablauf aufgebaut.
- Neue/saubere Streamer.bot-Action nutzt nur noch Fetch URL auf:
  - `/api/vip-sound/command`
- Alte direkte Legacy-Overlay-Ausloesung wurde vom normalen `!vip`-Ablauf getrennt.
- OBS-Browserquelle fuer VIP wurde auf Overlay V2 gesetzt:
  - `/overlays/vip_sound_overlay_v2.html`
- Live-Test erfolgreich.
- Keine Backend-Codeaenderung in STEP023.
- Keine SQLite-/Secret-/Backup-Dateien committed.

## 2026-05-03

### STEP017 - VIP-Sounds ueber Sound-System queued

- `backend/modules/vip_sound_overlay.js` auf Version `1.7.0` aktualisiert.
- VIP-Command prueft vor Daily-Usage Sounddatei und Duplicate.
- VIP-Command sendet bei vorhandener MP3 einen Request an:
  - `POST /api/sound/play`
- Daily-Usage wird erst geschrieben, wenn das Sound-System den Request akzeptiert.
- Live getestet mit `araglor`.

### STEP016.1 - VIP-Chat-Ausgabe ueber Heimleitungs-Bot

- `backend/modules/vip_sound_overlay.js` auf Version `1.6.1` aktualisiert.
- VIP-Command-Antworten werden ueber `helper_chat_output.js` gesendet.
- Streamer.bot soll die Antwort nicht mehr selbst posten.

### STEP016 - VIP-Daily-Usage und DB-Message-Templates

- `backend/modules/vip_sound_overlay.js` auf Version `1.6.0` aktualisiert.
- Neue Routen:
  - `GET/POST /api/vip-sound/command`
  - `GET/POST /api/vip-sound-overlay/command`
  - `GET /api/vip-sound/db/status`
  - `GET /api/vip-sound-overlay/db/status`
- Neue Tabellen in bestehender `app.sqlite`:
  - `vip_sound_daily_usage`
  - `vip_sound_message_templates`

### STEP015 - VIP-/Sound-/Overlay-Planung dokumentiert

- VIP-Zielrichtung dokumentiert.
- Keine Codeaenderung.

## 2026-05-01

### Repository bootstrap

- Repository `ForrestCGN/stream-control-center` eingerichtet.
- Branch `dev` angelegt.
- `.gitignore` angelegt.
- Projektstatus-Dateien vorbereitet.

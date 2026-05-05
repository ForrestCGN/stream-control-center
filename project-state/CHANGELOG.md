# Changelog

## 2026-05-05

### STEP172 - Sound / Alert / TTS Status Current

- Aktueller Sound-/Alert-/TTS-Stand als neue Referenz dokumentiert:
  - `project-state/STEP172_SOUND_ALERT_TTS_STATUS_CURRENT_2026-05-05.md`
- Zentrale Einstiegspunkte auf den aktuellen Stand nachgezogen:
  - `docs/current/CURRENT_SYSTEM_STATUS.md`
  - `project-state/CURRENT_STATUS.md`
  - `project-state/CHANGELOG.md`
  - `project-state/FILES.md`
  - `project-state/NEXT_STEPS.md`
- Live bestaetigt:
  - `alert_system` Version `3`
  - `alert_system` Step `171`
  - Queue leer
  - Current null
  - Overlay-Client verbunden
  - Schema-Version `5`
- Dokumentiert wurden die relevanten Fix-Commits:
  - `6f9bccf fix: restore alert tts playback through sound system`
  - `c2f77cb fix: keep alert tts behind alert sound`
  - `de4671c fix: delay chat tts until alert queue is idle`
  - `8743042 fix: respect sound output target in overlay`
  - `1fc3523 docs: save step171 step172 sound alert tts status`
- Aktueller Soll-Ablauf dokumentiert:
  - Alert-Hauptsound ueber Sound-System
  - Alert-TTS als eigenes Sound-System-Item hinter Alert-Hauptsound
  - Chat-TTS wartet, bis Alert-Kette idle ist
  - Overlay bleibt bis nach Alert-TTS sichtbar
  - Sound-System bleibt Audio-Wahrheit
- Keine Codeaenderung in diesem Doku-STEP.

## 2026-05-04

### STEP047 - VIP Dashboard Base

- Neues Dashboard-Modul fuer VIP angelegt:
  - `htdocs/dashboard/modules/vip.js`
  - `htdocs/dashboard/modules/vip.css`
- Dashboard-Registrierung ergaenzt:
  - `htdocs/dashboard/app.js`
  - `htdocs/dashboard/index.html`
- VIP-System ist jetzt in der Community-Sektion sichtbar.
- VIP-Overlay-Link zeigt auf `/overlays/vip_sound_overlay_v2.html`.
- VIP-Dashboard nutzt bestehende Backend-APIs, kein direkter SQLite-/Dateizugriff.
- Vorhandene VIP-APIs werden genutzt fuer:
  - Status/Summary
  - Settings
  - Texte
  - Rollen
  - Daily-Usage
  - Events/Stats
  - Admin-Testausloesung
- VIP-Settings bleiben in `vip_sound_settings`.
- VIP-Texte bleiben in `vip_sound_message_templates`.
- VIP-Rollen-Fallbacks bleiben in `vip_sound_role_overrides`.
- VIP-Events bleiben in `vip_sound_events`.
- Kein Backend-Umbau in diesem STEP.
- Kein VIP-Song-Upload in diesem STEP.
- Modulstandard dokumentiert:
  - Settings in DB.
  - Texte in DB.
  - JSON nur technische Config, Import oder Fallback.
  - Dashboard nur ueber Backend-APIs.
  - vorhandene Helper nutzen, keine Parallelstrukturen.
- Tests:
  - `node -c htdocs/dashboard/modules/vip.js` erfolgreich.
  - `GET /api/vip-sound/admin/summary` erfolgreich.
  - `GET /api/vip-sound/settings` erfolgreich.
  - `GET /api/vip-sound/texts?limit=5` erfolgreich.
- `docs/current/CURRENT_SYSTEM_STATUS.md` wurde auf VIP `1.8.5`/STEP047 aktualisiert.

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

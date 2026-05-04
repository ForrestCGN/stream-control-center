# Changelog

## 2026-05-04

### STEP027 - VIP-Texte auf Heimaufsicht umgestellt

- `backend/modules/vip_sound_overlay.js` aktualisiert.
- Sichtbare Default-Chattexte sagen jetzt `Heimaufsicht` statt `Heimleitung`.
- Interne Style-ID `heimleitung` bleibt unveraendert, damit bestehende SQLite-Daten und Queries kompatibel bleiben.
- Bestehende Live-SQLite-Texte muessen einmalig per UPDATE angepasst werden.
- Keine Daily-Usage-, Sound-System-, Twitch-Rollen-, Override- oder Overlay-Logik geaendert.
- Neue STEP-Doku:
  - `project-state/STEP027_VIP_HEIMAUFSICHT_TEXTS_2026-05-04.md`
- Keine SQLite-/Secret-/Backup-Dateien committed.

### STEP026 - VIP Twitch-Rollenhelper vorbereitet

- Neue Datei `backend/modules/helpers/helper_twitch_roles.js` ergänzt.
- Projekt-Doku aktualisiert: Live-Aktualisierung erfolgt verbindlich ueber `tools\easy\01_LIVE_AKTUALISIEREN_VON_GITHUB.cmd`.
- Arbeitsregel ergaenzt: Wenn GitHub/Tools grosse Dateien kuerzen, stellt Forrest die echte Datei bereit; diese wird dann als Bearbeitungsbasis genutzt.
- `backend/modules/vip_sound_overlay.js` auf Version `1.7.4` vorbereitet.
- Zieluser-Rollenprüfung für VIP-Sounds nutzt jetzt zuerst Twitch:
  - Login-Auflösung über `/helix/users`
  - Moderatorprüfung über `/helix/moderation/moderators`
  - Ergebnis-Cache 10 Minuten
- `config/vip_sound_roles.json` bleibt als Fallback/Override erhalten.
- Erwartetes Verhalten:
  - `!vip @araglor` wird automatisch als Mod-Sound erkannt, wenn Twitch `araglor` als Moderator zurückgibt.
- Keine SQLite-Datei ersetzt.
- Keine Secrets/Tokens committed.
- Neue STEP-Doku angelegt:
  - `project-state/STEP026_VIP_TWITCH_ROLE_HELPER_2026-05-04.md`

### STEP023 - VIP Streamer.bot -> Sound-System -> Overlay V2 getestet

- Echter Streamer.bot-Command `!vip` wurde neu auf den neuen Backend-/Sound-System-Ablauf aufgebaut.
- Neue/saubere Streamer.bot-Action nutzt nur noch Fetch URL auf:
  - `/api/vip-sound/command`
- Alte direkte Legacy-Overlay-Ausloesung wurde vom normalen `!vip`-Ablauf getrennt.
- OBS-Browserquelle fuer VIP wurde auf Overlay V2 gesetzt:
  - `/overlays/vip_sound_overlay_v2.html`
- Live-Test erfolgreich:
  - `!vip @araglor` startete Sound ueber `sound_system`.
  - `sound_system.current.visual.module = vip_sound_overlay` war gesetzt.
  - OBS zeigte VIP Overlay V2 korrekt an.
  - Chat-Ausgabe kam ueber Heimaufsicht/Bot.
  - Nach Soundende war `sound_system.current = null`, Queue leer und `device.lastOk = true`.
- Neue STEP-Doku angelegt:
  - `project-state/STEP023_VIP_STREAMERBOT_SOUNDSYSTEM_OVERLAY_2026-05-04.md`
- Keine Backend-Codeaenderung in STEP023.
- Keine SQLite-/Secret-/Backup-Dateien committed.

### STEP022 - Streamer.bot VIP-Argumente geprueft

- Echte Streamer.bot 1.0.4 Command-Argumente mit temporärem Debug-Command geprüft.
- Ergebnis: Kein Code-Fix erforderlich.
- Relevante Felder werden passend geliefert:
  - `userName` fuer Actor-Login
  - `user` fuer Actor-DisplayName
  - `input0` fuer Target-Login ohne Mention-Zeichen
  - `rawInput` fuer rohe Eingabe
  - `isModerator` fuer Override-Erkennung
- Das bestehende VIP-Modul erkennt `isModerator` bereits in `actorCanOverride()`.
- Neue STEP-Doku angelegt:
  - `project-state/STEP022_STREAMERBOT_VIP_ARGS_2026-05-04.md`
- Keine Codeaenderung in STEP022.
- Keine SQLite-/Secret-/Backup-Dateien committed.

### STEP021 - Sound-System RequestId in VIP-Response gefixt

- `backend/modules/vip_sound_overlay.js` auf Version `1.7.1` aktualisiert.
- `soundSystemRequestId` wird jetzt aus `soundQueue.response.item.requestId` uebernommen, wenn `result.requestId` und `response.requestId` leer sind.
- Ursache: Das Sound-System gab die ID bereits in `item.requestId` zurueck, VIP las dieses Feld bisher nicht aus.
- Live-Test erfolgreich:
  - Broadcaster-Override akzeptiert.
  - Sound-System startete den VIP-Sound.
  - `soundSystemRequestId` enthaelt jetzt eine gueltige `snd_...` ID.
- Neue STEP-Doku angelegt:
  - `project-state/STEP021_SOUND_SYSTEM_REQUEST_ID_2026-05-04.md`
- Keine Aenderung an Queue-, Daily-Usage-, Override- oder Sound-System-Logik.
- Keine SQLite-/Secret-/Backup-Dateien committed.

### STEP020 - VIP Override live getestet

- VIP-System im Live-System unter `D:\Streaming\stramAssets` getestet.
- Statusrouten erfolgreich geprüft:
  - `GET /api/vip-sound/status`
  - `GET /api/vip-sound-overlay/state`
  - `GET /api/vip-sound/db/status`
  - `GET /api/sound/status`
- Bestätigt:
  - VIP-Modul Version `1.7.0` läuft.
  - VIP-Overlay-State ist idle und hängt nicht.
  - VIP-DB-Schema ist bereit.
  - Sound-System Version `0.1.8` läuft.
- Funktionstests erfolgreich:
  - normale VIP-Auslösung für `araglor`
  - Duplicate-Block für `araglor`
  - Broadcaster-Override durch `forrestcgn`
  - abgelehnter Override durch normalen User
- Sound-System spielte `D:\Streaming\stramAssets\htdocs\assets\sounds\vip\araglor.mp3` über AudioDeviceHelper ab.
- Neue STEP-Doku angelegt:
  - `project-state/STEP020_VIP_OVERRIDE_LIVE_TEST_2026-05-04.md`
- Offener Folgepunkt:
  - `soundSystemRequestId` ist in der VIP-Response noch leer.
- Keine Codeänderung in STEP020.
- Keine SQLite-/Secret-/Backup-Dateien committed.

### STEP019 - VIP Sound Override dokumentiert

- Mitgelieferte VIP-Override-Statusdateien beruecksichtigt und in den bestehenden Projektstand eingearbeitet.
- GitHub/dev geprueft: `backend/modules/vip_sound_overlay.js` enthaelt bereits die Override-Logik ueber `VIP_OVERRIDE_ALLOWED_ROLES`.
- GitHub/dev geprueft: `htdocs/overlays/vip_sound_overlay_v2.html` ist vorhanden und wertet Sound-System/WebSocket-Status fuer VIP-Visuals aus.
- Neue STEP-Doku angelegt:
  - `project-state/STEP019_VIP_SOUND_OVERRIDE_2026-05-04.md`
- Projektindex aktualisiert:
  - `project-state/FILES.md`
- Keine Codeaenderung in diesem Dokumentations-Commit.
- Keine SQLite-/Secret-/Backup-Dateien committed.

## 2026-05-03

### STEP017 - VIP-Sounds ueber Sound-System queued

- `backend/modules/vip_sound_overlay.js` auf Version `1.7.0` aktualisiert.
- VIP-Command prueft jetzt vor Daily-Usage:
  - Duplicate pro User/pro Stream-Tag.
  - vorhandene MP3 unter `htdocs/assets/sounds/vip/<Anzeigename>.mp3`.
- VIP-Command sendet bei vorhandener MP3 einen Request an:
  - `POST /api/sound/play`
- Daily-Usage wird erst geschrieben, wenn das Sound-System den Request akzeptiert.
- Wenn MP3 fehlt, wird keine Daily-Usage geschrieben und `sound_missing` ueber Heimleitungs-Bot gesendet.
- Chat-Ausgabe laeuft weiter ueber `helper_chat_output.js` / Bot.
- Live getestet mit `araglor`:
  - `vip/araglor.mp3` wurde ueber AudioDeviceHelper abgespielt.
  - Duplicate wurde danach korrekt geblockt.
  - `vip_sound_daily_usage` enthaelt `araglor` genau einmal.
- Neue STEP-Doku:
  - `project-state/STEP017_VIP_SOUND_SYSTEM_QUEUE_2026-05-03.md`

### STEP016.1 - VIP-Chat-Ausgabe ueber Heimleitungs-Bot

- `backend/modules/vip_sound_overlay.js` auf Version `1.6.1` aktualisiert.
- VIP-Command-Antworten werden ueber `helper_chat_output.js` gesendet.
- Streamer.bot soll die Antwort nicht mehr selbst posten.
- Response-Felder:
  - `send=false`
  - `streamerbot_send="0"`
  - `chatMessage=""`
- Live getestet mit Duplicate-Response fuer `araglor`.

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
- Standard-Heimleitungstexte werden nur geseedet, wenn Tabelle leer ist.
- Keine bestehende SQLite-Datei ersetzt.
- Keine Dashboard-/Overlay-Dateien geaendert.

### STEP015 - VIP-/Sound-/Overlay-Planung dokumentiert

- `project-state/STEP015_VIP_SOUND_OVERLAY_PLAN_2026-05-03.md` ergaenzt.
- Keine Codeaenderung.
- Keine Datenbankaenderung.
- Keine Live-Dateiaenderung.
- Repo/Live-SHA256 fuer relevante VIP-/Sound-/Helper-Dateien geprueft:
  - `backend/modules/sound_system.js`
  - `backend/modules/vip_sound_overlay.js`
  - `backend/modules/helpers/helper_messages.js`
  - `backend/modules/helpers/helper_texts.js`
  - `backend/modules/helpers/helper_chat_output.js`
  - `config/sound_system.json`
- VIP-Zielrichtung festgelegt:
  - Streamer.bot nimmt nur noch Befehle an und sendet Minimaldaten an Node.
  - Node/VIP prueft Daily-Usage pro User/pro Stream-Tag.
  - Heimleitungs-Zufallstexte werden spaeter in SQLite gespeichert und per Dashboard bearbeitbar.
  - Sound-System verwaltet Prioritaet und Queue.
  - VIP-Einblendung erscheint erst beim echten Soundstart, nicht beim Enqueue.
  - Keine Queue-Position mehr in VIP-Chatnachrichten.
  - VIP-Soundpfad wird konfigurierbar; aktueller Live-Pfad: `D:\Streaming\stramAssets\htdocs\assets\sounds\vip\`.

### STEP014 - Hug-System konsolidiert

- `backend/modules/hug.js` als finales aktives Hug/Rehug-Modul ergänzt.
- Hug nutzt jetzt die zentrale Core-Datenbank-Schicht:
  - `backend/core/database.js`
- Zusammengeführt in `hug.js`:
  - DB-Textstore / Initial-Import aus `config/messages/hug.json`
  - Hug/Rehug-Logik
  - zentrale Command-Route `GET/POST /api/hug/command`
  - Output-Modus-Umschalter `GET/POST /api/hug/db/output-mode`
  - Status-/Dashboard-Routen
  - bestehende Legacy-Routen für Streamer.bot-Kompatibilität
- `backend/modules/hug_command.js` entfernt, da Funktion jetzt in `hug.js` steckt.
- `backend/server.js` überspringt alte Hug-Zwischenmodule, damit keine doppelten Routen registriert werden:
  - `hug_00_api_db.js`
  - `hug_output_mode.js`
  - `hug_text_store.js`
  - `hug_system.js`
- Die alten Zwischenmodule bleiben vorerst im Repo als Verlauf/Backup, werden aber nicht mehr aktiv geladen.
- `/api/_status` zeigt zusätzlich `skippedModules`.

### STEP013 - Zentrale Core-Datenbank-Schicht vorbereitet

- `backend/core/database.js` ergänzt.
- `backend/modules/database_core.js` ergänzt.
- Neue Diagnose-Routen:
  - `GET /api/database/status`
  - `GET /api/system/database/status`
- Zweck:
  - Neue Module sollen langfristig nicht mehr direkt an `sqlite_core.js` hängen.
  - Aktuell wird SQLite über die zentrale Core-Schicht gekapselt.
  - MariaDB-Adapter ist strukturell vorbereitet, aber noch nicht implementiert.
- Wichtig:
  - Bestehende SQLite-Datenbank `data/sqlite/app.sqlite` wird nicht ersetzt.
  - Bestehende Module wurden noch nicht umgestellt.

### STEP012 - Zentrale Hug/Rehug Command-Route

- `backend/modules/hug_command.js` ergänzt.
- Neue Route:
  - `POST /api/hug/command`
  - `GET /api/hug/command` fuer einfache Tests
- Zweck: Streamer.bot muss künftig keine C#-URL-Bau-Scripte mehr ausführen.
- Streamer.bot sendet nur noch Command, Actor-Daten und Inputs an Node.
- Node entscheidet intern:
  - `!hug top`
  - `!hug top received`
  - `!hug top rehug`
  - `!hug reload`
  - `!hug all`
  - `!hug on/off`
  - `!hug stats [user]`
  - `!hug @user`
  - `!rehug @user`

### STEP011 - Hug-Output-Modus sicher umschaltbar

- `backend/modules/hug_output_mode.js` ergänzt.
- Neue Routen:
  - `GET /api/hug/db/output-mode`
  - `POST /api/hug/db/output-mode`
- Erlaubte Modi:
  - `streamerbot`
  - `central`
- Zweck: Hug/Rehug kontrolliert von Streamer.bot-Ausgabe auf zentrale Heimleitung-/Bot-Ausgabe umstellen.

### STEP010 - DB-backed Hug/Rehug API Bridge vorbereitet

- `backend/modules/hug_00_api_db.js` ergänzt.
- Bestehende Streamer.bot-GET-Routen werden vorgeschaltet weiter bedient:
  - `GET /api/hug/cmd`
  - `GET /api/hug/statscmd`
  - `GET /api/hug/top`
  - `GET /api/hug/reload`
- Hug-/Rehug-Texte, Response-Texte und Top-Titel werden aus SQLite gelesen:
  - `hug_types`
  - `hug_texts`
  - `hug_settings`
- Zentrale Chat-Ausgabe über `helper_chat_output.js` wird unterstützt.
- Das alte `backend/modules/hug_system.js` wurde nicht entfernt und nicht überschrieben.
- Neue Diagnose-Routen:
  - `GET /api/hug/db/status`
  - `GET /api/dashboard/community/hug/status`

### STEP009 - Hug-Text-Store in SQLite vorbereitet

- `backend/modules/hug_text_store.js` ergänzt.
- Neue Tabellen werden migrationssicher angelegt:
  - `hug_settings`
  - `hug_types`
  - `hug_texts`
- Bestehende Statistik-Tabellen bleiben unverändert:
  - `hug_users`
  - `hug_pair_stats`
  - `hug_pending_rehugs`
- Erstimport aus `config/messages/hug.json` in SQLite, aber nur wenn DB-Typen/Texte noch leer sind.
- Neue Diagnose-Routen:
  - `GET /api/hug/text-store/status`
  - `GET /api/dashboard/community/hug/text-store/status`
  - `POST /api/hug/text-store/reload`
- Bestehende Hug-/Rehug-Kommandos und Routen wurden nicht verändert.

### STEP008 - Zentrale Chat-Ausgabe vorbereitet

- `backend/modules/helpers/helper_chat_output.js` ergänzt.
- `backend/modules/chat_output.js` ergänzt.
- `config/chat_output.json` ergänzt.
- Neue Diagnose-/Test-Routen:
  - `GET /api/chat-output/status`
  - `POST /api/chat-output/send`
  - `POST /api/chat-output/reload`
- Ziel: zentrale Chat-Ausgabe für Backend-Module vorbereiten, bevorzugt über Bot/Heimleitung, optional Fallback auf Streamer-Account und Streamer.bot-Fallback.
- Bestehende Hug-/Rehug-Kommandos und Routen wurden nicht verändert.

## 2026-05-01

### Repository bootstrap

- Repository `ForrestCGN/stream-control-center` eingerichtet.
- Branch `dev` angelegt.
- `.gitignore` angelegt, damit Secrets, SQLite-Dateien, Logs, ZIPs und lokale Backups nicht versehentlich committet werden.
- Projektstatus-Dateien vorbereitet.

### Lokaler Chat-/ZIP-Stand vor Repo-Bootstrap

- STEP005: Userinfo im Stream-Desk funktioniert.
- STEP006: Admin > Configs und ENV-/Secrets-Strategie vorbereitet.
- STEP007: Stream-Desk QuickScenes / Config-UI vorbereitet.

## 2026-05-03 - STEP011/STEP012 Dokumentation synchronisiert

### STEP011 - Dokumentationsstruktur eingeführt

- Repo-Doku unter docs/ geordnet.
- Live-Doku unter D:\Streaming\stramAssets\docs geordnet.
- Aktueller Einstiegspunkt erstellt:
  - docs/current/CURRENT_SYSTEM_STATUS.md
- Historische Analyse-Snapshots einsortiert:
  - docs/backend/
  - docs/dashboard/
  - docs/database/
  - docs/overlays/
  - docs/system-inspection/2026-05-03/
- Lose Analyse-Dateien im Live-docs-Root archiviert:
  - D:\Streaming\stramAssets\archive\docs_root_cleanup_step011\

### STEP012 - project-state an CURRENT_SYSTEM_STATUS angeglichen

- project-state/CURRENT_STATUS.md aktualisiert.
- project-state/NEXT_STEPS.md aktualisiert.
- project-state/CHANGELOG.md aktualisiert.
- project-state/FILES.md aktualisiert.
- Keine Codeänderung.
- Keine Funktionalität entfernt.

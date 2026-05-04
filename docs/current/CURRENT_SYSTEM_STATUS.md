# CURRENT SYSTEM STATUS

Stand: 2026-05-04

## Zweck

Diese Datei ist der aktuelle Einstiegspunkt fuer den Projektstand.

Historische Analyse-Snapshots liegen unter:

- docs/system-inspection/2026-05-03/
- docs/backend/
- docs/dashboard/
- docs/overlays/
- docs/database/

## Aktueller Arbeitsstand

Branch:

- dev

Repo:

- D:\Git\stream-control-center

Live:

- D:\Streaming\stramAssets

GitHub:

- https://github.com/ForrestCGN/stream-control-center

## Zuletzt abgeschlossen

- STEP005 OBS API-Aliase /api/obs/*
- STEP006 OBS Dashboard Leserouten auf /api/obs/*
- STEP007 Mojibake in sound/adminconfigs repariert
- STEP008 Fireworks-Doppelroute dokumentiert, kein Umbau
- STEP010 OBS Dashboard Aktionen auf /api/obs/*
- STEP011 Doku-Struktur in Repo und Live vorbereitet
- STEP015 VIP-/Sound-/Overlay-Planung dokumentiert
- STEP016 VIP-Daily-Usage und DB-Message-Templates vorbereitet
- STEP016.1 VIP-Chat-Ausgabe auf helper_chat_output/Heimleitungs-Bot umgestellt
- STEP017 VIP-Sounds ueber Sound-System vor Daily-Usage queued
- STEP019 VIP Sound Override dokumentiert und Projektstatus aktualisiert
- STEP020 VIP Override live getestet
- STEP021 Sound-System RequestId in VIP-Response gefixt

## Aktueller sauberer Zustand

- GitHub/dev wurde fuer STEP021 aktualisiert.
- Aktuelles VIP-Modul: backend/modules/vip_sound_overlay.js
- VIP-Modul-Version im Repo/Live: 1.7.1
- Sound-System-Version live: 0.1.8
- VIP Override ist live bestaetigt.
- `soundSystemRequestId` wird jetzt korrekt in der VIP-Response ausgegeben.

Live-Routen geprueft:

- POST /api/vip-sound/command
- GET /api/vip-sound/status
- GET /api/vip-sound-overlay/state
- GET /api/vip-sound/db/status
- GET /api/sound/status

## VIP-System aktueller Stand

Dokumentation:

- project-state/STEP015_VIP_SOUND_OVERLAY_PLAN_2026-05-03.md
- project-state/STEP017_VIP_SOUND_SYSTEM_QUEUE_2026-05-03.md
- project-state/STEP019_VIP_SOUND_OVERRIDE_2026-05-04.md
- project-state/STEP020_VIP_OVERRIDE_LIVE_TEST_2026-05-04.md
- project-state/STEP021_SOUND_SYSTEM_REQUEST_ID_2026-05-04.md

Aktueller Ablauf fuer `/api/vip-sound/command`:

1. Actor-/Userdaten werden aufgeloest.
2. Optionaler Zieluser wird erkannt.
3. Wenn ein Zieluser angegeben wurde und Actor nicht identisch mit Zieluser ist, gilt der Request als Override-Versuch.
4. Override wird nur erlaubt, wenn die Actor-Rolle in `VIP_OVERRIDE_ALLOWED_ROLES` enthalten ist.
5. Standardrollen: `moderator,mod,broadcaster`.
6. Ohne Override wird Daily-Usage pro User/pro Stream-Tag geprueft.
7. Wenn User bereits genutzt hat:
   - kein Sound-System-Request
   - keine neue Daily-Usage
   - Duplicate-Nachricht ueber Heimleitungs-Bot
8. Wenn User noch nicht genutzt hat oder Override erlaubt ist:
   - VIP-MP3 wird gesucht
   - aktueller Fallback-Pfad: `D:\Streaming\stramAssets\htdocs\assets\sounds\vip\`
   - Dateiregel: `Anzeigename.mp3`
9. Wenn MP3 fehlt:
   - keine Daily-Usage
   - `sound_missing`-Nachricht ueber Heimleitungs-Bot
10. Wenn MP3 existiert:
   - POST an Sound-System `/api/sound/play`
   - Payload nutzt `file: "vip/<Anzeigename>.mp3"`
   - Kategorie `vip` oder `crew` je nach Soundtyp
   - Output `device`
11. Nur wenn Sound-System akzeptiert:
   - normale Ausloesung schreibt Daily-Usage
   - erlaubter Override ueberspringt Daily-Usage-Pruefung bewusst
   - Accepted-/Override-Nachricht ueber Heimleitungs-Bot
12. Die VIP-Response enthaelt nun:
   - eigene VIP-RequestId `requestId`
   - Sound-System-ID `soundSystemRequestId`

Chat-Ausgabe:

- laeuft ueber backend/modules/helpers/helper_chat_output.js
- Streamer.bot soll nicht mehr posten
- Response: `send=false`, `streamerbot_send="0"`, `chatMessage=""`

STEP020 Live-Test bestaetigt:

- VIP-Status idle: `phase=idle`, `visible=false`, `isActive=false`, `queuedCount=0`.
- VIP-Overlay-State idle und nicht haengend.
- VIP-DB bereit: Schema 1, 15 Message-Templates, 3 Daily-Usage-Rows nach Test.
- Sound-System bereit: Version 0.1.8, Device-Ausgabe aktiv.
- Normale VIP-Ausloesung fuer `araglor`: akzeptiert, Sound gestartet, Daily-Usage geschrieben.
- Broadcaster-Override durch `forrestcgn` fuer `araglor`: akzeptiert, Sound erneut gestartet, keine Daily-Usage geschrieben.
- Duplicate ohne Override fuer `araglor`: korrekt geblockt.
- Unerlaubter Override durch `normaluser`: korrekt geblockt.
- AudioDeviceHelper spielte `D:\Streaming\stramAssets\htdocs\assets\sounds\vip\araglor.mp3` erfolgreich ab.

STEP021 Live-Test bestaetigt:

- Broadcaster-Override wurde erneut getestet.
- Sound-System startete den VIP-Sound.
- `soundSystemRequestId` enthaelt jetzt eine gueltige `snd_...` ID.
- Keine Queue-, Daily-Usage-, Override- oder Sound-System-Logik wurde umgebaut.

## Doku-Struktur

Repo-Doku:

- D:\Git\stream-control-center\docs

Live-Doku:

- D:\Streaming\stramAssets\docs

Aktuelle Statusdatei:

- docs/current/CURRENT_SYSTEM_STATUS.md

Snapshots:

- docs/system-inspection/2026-05-03/
- docs/backend/
- docs/dashboard/
- docs/overlays/
- docs/database/

## Wichtige Regeln

- Keine Funktionalitaet entfernen.
- Vor Aenderungen echten Dateistand pruefen.
- GitHub/dev und Live bewusst synchron halten.
- Keine Secrets committen.
- Keine SQLite-Dateien committen.
- Doku-Snapshots nicht ueberschreiben, sondern neue CURRENT-Dateien pflegen.
- STEP-Dokus nach jedem abgeschlossenen Block schreiben.

## Offene Punkte

- Reale Streamer.bot-Rollen-/Badge-Parameter bei Produktion weiter beobachten.
- Falls noetig nur Rollenmapping erweitern, keine Sound-/Queue-Logik umbauen.
- VIP-Overlay-Startverhalten gegen echten Sound-System-Start weiter verifizieren.
- VIP-Soundpfad konfigurierbar ueber DB/Dashboard machen.
- VIP-Nachrichten spaeter im Dashboard bearbeitbar machen.
- Fireworks spaeter neu aufbauen.
- Dashboard-Modulstandard definieren.
- Hug-Textbearbeitung spaeter sauber neu planen.
- Alerts-Modul spaeter behutsam splitten.
- Overlays langfristig mit einheitlichem Overlay-Client standardisieren.

## Naechster empfohlener Schritt

Naechster kleiner VIP-Step:

1. Reale Streamer.bot-Argumente fuer Rollen/Badges pruefen.
2. Falls noetig nur `actorCanOverride()` Mapping erweitern.
3. Danach VIP-Overlay-Startverhalten mit echtem Sound-System-Start weiter verifizieren.

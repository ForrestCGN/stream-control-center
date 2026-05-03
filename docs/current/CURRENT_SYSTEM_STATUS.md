# CURRENT SYSTEM STATUS

Stand: 2026-05-03

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

## Aktueller sauberer Zustand

- Repo/dev ist sauber und auf origin/dev.
- STEP017 ist live getestet.
- Aktuelles VIP-Modul: backend/modules/vip_sound_overlay.js
- VIP-Modul-Version live: 1.7.0

Live-Routen geprueft:

- GET /api/_status
- GET /api/sound/status
- GET /api/vip-sound/status
- GET /api/vip-sound/db/status
- GET /api/vip-sound/command
- GET /api/vip-sound-overlay/state

## VIP-System aktueller Stand

Dokumentation:

- project-state/STEP015_VIP_SOUND_OVERLAY_PLAN_2026-05-03.md
- project-state/STEP017_VIP_SOUND_SYSTEM_QUEUE_2026-05-03.md

Aktueller Ablauf fuer `/api/vip-sound/command`:

1. Userdaten werden aufgeloest.
2. Daily-Usage wird geprueft.
3. Wenn User bereits genutzt hat:
   - kein Sound-System-Request
   - keine neue Daily-Usage
   - Duplicate-Nachricht ueber Heimleitungs-Bot
4. Wenn User noch nicht genutzt hat:
   - VIP-MP3 wird gesucht
   - aktueller Fallback-Pfad: `D:\Streaming\stramAssets\htdocs\assets\sounds\vip\`
   - Dateiregel: `Anzeigename.mp3`
5. Wenn MP3 fehlt:
   - keine Daily-Usage
   - `sound_missing`-Nachricht ueber Heimleitungs-Bot
6. Wenn MP3 existiert:
   - POST an `http://127.0.0.1:8080/api/sound/play`
   - Payload nutzt `file: "vip/<Anzeigename>.mp3"`
   - Kategorie `vip`
   - Output `device`
7. Nur wenn Sound-System akzeptiert:
   - Daily-Usage wird geschrieben
   - Accepted-Nachricht ueber Heimleitungs-Bot

Chat-Ausgabe:

- laeuft ueber backend/modules/helpers/helper_chat_output.js
- Streamer.bot soll nicht mehr posten
- Response: `send=false`, `streamerbot_send="0"`, `chatMessage=""`

Live-Test:

- `araglor` wurde erfolgreich ueber Sound-System abgespielt.
- AudioDeviceHelper spielte `D:\Streaming\stramAssets\htdocs\assets\sounds\vip\araglor.mp3`.
- Duplicate-Test fuer `araglor` blockte korrekt ohne Sound-System-Request.

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

- VIP-Overlay erst bei echtem Sound-System-Start anzeigen.
- `soundSystemRequestId` sauber aus `/api/sound/play` Response uebernehmen.
- VIP-Soundpfad konfigurierbar ueber DB/Dashboard machen.
- VIP-Nachrichten spaeter im Dashboard bearbeitbar machen.
- Fireworks spaeter neu aufbauen.
- Dashboard-Modulstandard definieren.
- Hug-Textbearbeitung spaeter sauber neu planen.
- Alerts-Modul spaeter behutsam splitten.
- Overlays langfristig mit einheitlichem Overlay-Client standardisieren.

## Naechster empfohlener Schritt

STEP018 klein halten:

1. Sound-System-Visualdaten fuer `vip_sound_overlay` auswerten.
2. VIP-Overlay erst bei echtem Soundstart anzeigen.
3. Keine neue parallele Sound-Queue bauen.
4. Bestehende alte `/enqueue`-Routen vorerst kompatibel lassen.

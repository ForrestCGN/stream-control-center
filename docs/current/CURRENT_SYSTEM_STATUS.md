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

## Aktueller sauberer Zustand

- Repo/dev war vor STEP015 sauber und auf origin/dev.
- STEP015 war reine Planung/Dokumentation ohne Codeaenderung.
- Repo/Live-SHA256 war fuer die relevanten VIP-/Sound-/Helper-Dateien identisch:
  - backend/modules/sound_system.js Same=True
  - backend/modules/vip_sound_overlay.js Same=True
  - backend/modules/helpers/helper_messages.js Same=True
  - backend/modules/helpers/helper_texts.js Same=True
  - backend/modules/helpers/helper_chat_output.js Same=True
  - config/sound_system.json Same=True

Live-Routen geprueft:

- GET /api/_status
- GET /api/sound/status
- GET /api/vip-sound/status
- GET /api/vip-sound-overlay/state

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

Aktueller VIP-Plan:

- project-state/STEP015_VIP_SOUND_OVERLAY_PLAN_2026-05-03.md

## Wichtige Regeln

- Keine Funktionalitaet entfernen.
- Vor Aenderungen echten Dateistand pruefen.
- GitHub/dev und Live bewusst synchron halten.
- Keine Secrets committen.
- Keine SQLite-Dateien committen.
- Doku-Snapshots nicht ueberschreiben, sondern neue CURRENT-Dateien pflegen.
- STEP-Dokus nach jedem abgeschlossenen Block schreiben.

## Offene Punkte

- STEP016 VIP-Minimalroute mit Daily-Usage und DB-Message-Templates planen/umsetzen.
- VIP-Sounds ueber Sound-System-Prioritaet/Queue fuehren.
- VIP-Einblendung erst bei echtem Soundstart anzeigen.
- VIP-Soundpfad konfigurierbar machen.
- VIP-Nachrichten spaeter im Dashboard bearbeitbar machen.
- Fireworks spaeter neu aufbauen.
- Dashboard-Modulstandard definieren.
- Hug-Textbearbeitung spaeter sauber neu planen.
- Alerts-Modul spaeter behutsam splitten.
- Overlays langfristig mit einheitlichem Overlay-Client standardisieren.

## Naechster empfohlener Schritt

STEP016 klein halten:

1. VIP-DB-Schema fuer Daily-Usage migrationssicher anlegen.
2. VIP-DB-Schema fuer Message-Templates migrationssicher anlegen.
3. Standard-Heimleitungstexte nur seed'en, wenn leer.
4. Neue/minimale VIP-Command-Route vorbereiten.
5. Duplicate-Pruefung einbauen.
6. chatMessage ueber helper_messages zurueckgeben.
7. Noch kein Dashboard- und Overlay-Umbau.

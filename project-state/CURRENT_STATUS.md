# CURRENT STATUS - stream-control-center

Stand: 2026-05-04

## Single Source of Truth

Repo:

- D:\Git\stream-control-center

GitHub:

- https://github.com/ForrestCGN/stream-control-center

Branch:

- dev

Live-System:

- D:\Streaming\stramAssets

Aktueller Doku-Einstieg:

- docs/current/CURRENT_SYSTEM_STATUS.md

## Aktueller Arbeitsstand

Der aktuelle Stand nach STEP022 ist auf GitHub/dev dokumentiert.

Zuletzt abgeschlossen:

- STEP005 OBS API-Aliase /api/obs/*
- STEP006 OBS Dashboard Leserouten auf /api/obs/*
- STEP007 Mojibake in sound/adminconfigs repariert
- STEP008 Fireworks-Doppelroute dokumentiert, kein Umbau
- STEP010 OBS Dashboard Aktionen auf /api/obs/*
- STEP011 Doku-Struktur in Repo und Live eingefuehrt
- STEP015 VIP-/Sound-/Overlay-Planung dokumentiert
- STEP016 VIP-Daily-Usage und DB-Message-Templates vorbereitet
- STEP016.1 VIP-Chat-Ausgabe auf helper_chat_output/Heimleitungs-Bot umgestellt
- STEP017 VIP-Sounds ueber Sound-System vor Daily-Usage queued
- STEP019 VIP Sound Override dokumentiert und Projektstatus aktualisiert
- STEP020 VIP Override live getestet
- STEP021 Sound-System RequestId in VIP-Response gefixt
- STEP022 Streamer.bot VIP-Argumente geprueft

## Repo/Live-Abgleich

Zuletzt fuer STEP022:

- Echte Streamer.bot 1.0.4 Command-Argumente mit temporaerem Debug-Command geprueft.
- Code wurde in STEP022 nicht geaendert.
- GitHub/dev wurde mit der STEP022-Doku aktualisiert.
- Keine SQLite-/Secret-/Backup-Dateien committed.

## VIP-/Sound-/Overlay-Stand

Dokumentiert in:

- project-state/STEP015_VIP_SOUND_OVERLAY_PLAN_2026-05-03.md
- project-state/STEP017_VIP_SOUND_SYSTEM_QUEUE_2026-05-03.md
- project-state/STEP019_VIP_SOUND_OVERRIDE_2026-05-04.md
- project-state/STEP020_VIP_OVERRIDE_LIVE_TEST_2026-05-04.md
- project-state/STEP021_SOUND_SYSTEM_REQUEST_ID_2026-05-04.md
- project-state/STEP022_STREAMERBOT_VIP_ARGS_2026-05-04.md

Aktueller Modulstand:

- backend/modules/vip_sound_overlay.js
- Version im Repo/Live: 1.7.1

Kernentscheidungen / aktueller Ablauf:

- Streamer.bot nimmt nur noch Befehle an und uebergibt Minimaldaten an Node.
- VIP-Command prueft Daily-Usage pro User/pro Stream-Tag.
- VIP-Command sucht Sounddatei unter `D:\Streaming\stramAssets\htdocs\assets\sounds\vip\`.
- Dateiregel aktuell: `Anzeigename.mp3`.
- Wenn Datei fehlt, wird keine Daily-Usage geschrieben.
- Wenn Datei existiert, wird `/api/sound/play` genutzt.
- Nur wenn das Sound-System akzeptiert, wird Daily-Usage geschrieben.
- Chat-Ausgabe erfolgt ueber helper_chat_output / Heimleitungs-Bot.
- Streamer.bot soll `chatMessage` nicht mehr selbst posten.
- Response fuer Streamer.bot: `send=false`, `streamerbot_send="0"`, `chatMessage=""`.
- VIP-Override: Mods/Broadcaster duerfen fuer Zieluser erneut ausloesen.
- Override-Rollen werden ueber `VIP_OVERRIDE_ALLOWED_ROLES` gesteuert.
- Standardrollen: `moderator,mod,broadcaster`.
- `soundSystemRequestId` wird korrekt aus der Sound-System-Response uebernommen.

STEP022 Ergebnis:

- Streamer.bot liefert `userName` fuer Actor-Login.
- Streamer.bot liefert `user` fuer Actor-DisplayName.
- Streamer.bot liefert `input0` fuer Target-Login ohne Mention-Zeichen.
- Streamer.bot liefert `rawInput` fuer rohe Eingabe.
- Streamer.bot liefert `isModerator` fuer Override-Erkennung.
- Das VIP-Modul prueft `isModerator` bereits in `actorCanOverride()`.
- Kein Code-Fix noetig.

## Doku-Struktur

Repo-Doku:

- D:\Git\stream-control-center\docs

Live-Doku:

- D:\Streaming\stramAssets\docs

Aktuelle Statusdatei:

- docs/current/CURRENT_SYSTEM_STATUS.md

Historische Analyse-Snapshots:

- docs/backend/Backend_Systemuebersicht_2026-05-03.txt
- docs/dashboard/DASHBOARD_SYSTEMUEBERSICHT_IST_STAND_2026-05-03.txt
- docs/database/ForrestCGN_Datenbank_Uebersicht_app_sqlite_2026-05-03.txt
- docs/overlays/overlay_iststand_analyse.txt
- docs/system-inspection/2026-05-03/SYSTEM_INSPEKTION_MASTER_TODO_v1_1_FINAL_GITHUB_2026-05-03.txt

## Wichtige Regeln

- Keine Funktionalitaet entfernen.
- Vor Aenderungen echten Dateistand pruefen.
- GitHub/dev und Live bewusst synchron halten.
- Keine Secrets committen.
- Keine SQLite-Dateien committen.
- Keine Backups/Altdateien committen.
- Historische Analyse-Snapshots nicht ueberschreiben.
- Aktuellen Stand in docs/current/CURRENT_SYSTEM_STATUS.md und project-state aktuell halten.
- Nach jedem abgeschlossenen Block STEP-Doku schreiben.

## Bewusst offen

- Optional echten Mod-Account testen, ob auch dort `isModerator` geliefert wird.
- Debug-Command `!vipdebug` in Streamer.bot wieder entfernen oder deaktivieren.
- VIP-Overlay-Startverhalten gegen echten Sound-System-Start weiter verifizieren.
- VIP-Soundpfad ueber DB/Dashboard konfigurierbar machen.
- VIP-Dashboard fuer Texte/Settings.
- Fireworks spaeter neu aufbauen.
- Dashboard-Modulstandard definieren.
- Hug-Textbearbeitung spaeter sauber neu planen.
- Alerts-Modul spaeter behutsam splitten.
- Overlays langfristig mit einheitlichem Overlay-Client standardisieren.
- tools/sync_streamassets_to_repo.ps1 spaeter pruefen.

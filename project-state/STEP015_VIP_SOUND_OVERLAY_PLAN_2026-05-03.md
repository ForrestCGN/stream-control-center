# STEP015 - VIP-/Sound-/Overlay-Planung

Stand: 2026-05-03

## Art des STEP

Planung und Ist-Stand-Dokumentation. Keine Codeaenderung, keine Datenbankaenderung, keine Live-Dateiaenderung, keine Funktionalitaet entfernt.

## Gepruefte Grundlage

Repo/Branch:

- D:\Git\stream-control-center
- dev
- HEAD: 93ae086 Sync project-state with current system status
- git status: clean

Live-System:

- D:\Streaming\stramAssets

Gepruefte Live-Routen:

- GET /api/_status
- GET /api/sound/status
- GET /api/vip-sound/status
- GET /api/vip-sound-overlay/state

Repo/Live-SHA256 identisch fuer:

- backend/modules/sound_system.js
- backend/modules/vip_sound_overlay.js
- backend/modules/helpers/helper_messages.js
- backend/modules/helpers/helper_texts.js
- backend/modules/helpers/helper_chat_output.js
- config/sound_system.json

## Aktueller VIP-Ist-Stand

Aktives Modul:

- backend/modules/vip_sound_overlay.js

Aktive API-Prefixe:

- /api/vip-sound
- /api/vip-sound-overlay

Live-Status:

- Version: 1.5.2
- Phase: idle
- visible: false
- queuedCount: 0
- client.connected: true

Aktueller Zustand:

- VIP-Modul hat eigene Queue.
- VIP-Modul verwaltet eigenen Overlay-State.
- VIP-Modul nimmt aktuell soundPath entgegen.
- VIP-Modul prueft Sounddateien aktuell selbst.
- VIP-Modul baut aktuell Browser-Audio-URLs selbst.
- VIP-Modul gibt aktuell Queue-Positionen aus.

Dieser Zustand wird nicht sofort entfernt, soll aber schrittweise umgebaut werden.

## Aktueller Sound-System-Ist-Stand

Aktives Modul:

- backend/modules/sound_system.js

API:

- /api/sound/*

Live-Status:

- enabled: true
- paused: false
- current: null
- queuedCount: 0
- client.connected: true

Relevante Konfiguration:

- priorities.vip = 60
- categoryDefaults.vip.priority = 60
- categoryDefaults.vip.queueIfBusy = true
- categoryDefaults.vip.parallelAllowed = false
- queue.sortByPriority = true
- queue.alertSync.enabled = true

Wichtiger Grundsatz:

- VIP-Sounds muessen ueber Prioritaet und Queue des Sound-Systems laufen.
- VIP-Einblendung darf erst beim echten Soundstart erscheinen, nicht beim Enqueue.

## Ziel: Streamer.bot

Streamer.bot soll kuenftig nur noch:

1. Befehl annehmen.
2. Minimaldaten an Node senden.
3. Node-Antwort lesen.
4. chatMessage ausgeben, falls Node eine Nachricht zurueckgibt.

Streamer.bot soll kuenftig nicht mehr:

- Soundpfade kennen.
- Queue-Positionen berechnen.
- Daily-Usage pruefen.
- Texte auswaehlen.
- Overlay starten.
- Prioritaeten kennen.

## Ziel: VIP-Modul

Das VIP-Modul soll kuenftig:

1. Minimalrequest entgegennehmen.
2. Userdaten aufloesen.
3. Daily-Usage pro User/pro Stream-Tag pruefen.
4. passenden Heimleitungs-Zufallstext aus SQLite waehlen.
5. Platzhalter ersetzen.
6. VIP-Sounddatei anhand konfigurierbarem Basisordner aufloesen.
7. Sound-Request an sound_system uebergeben.
8. einfache chatMessage fuer Streamer.bot zurueckgeben.

Das VIP-Modul soll kuenftig nicht mehr:

- eigene Sound-Queue am Sound-System vorbei verwalten.
- Overlay bereits beim Enqueue starten.
- Queue-Positionen ausgeben.
- absolute Soundpfade aus Streamer.bot erwarten.

## Ziel: Sound-System

Das Sound-System bleibt zustaendig fuer:

- Prioritaet
- Queue
- Cooldowns/Dedupe
- Interrupt-Regeln
- Parallel-Regeln
- echten Soundstart
- Soundende

Standard-Prioritaet aktuell:

- vip = 60

VIP darf Alerts nicht ungefragt unterbrechen. VIP darf in der Sound-Queue warten.

## Ziel: Overlay

VIP-Overlay zeigt nicht beim Enqueue. VIP-Overlay zeigt erst beim echten Soundstart. VIP-Overlay blendet nach Soundende wieder aus.

Bevorzugte technische Richtung:

- sound_system current.visual enthaelt VIP-Visualdaten.
- VIP-Overlay liest/reagiert auf den Sound-System-State oder abgeleiteten VIP-State.
- Keine zweite visuelle Startlogik neben dem Sound-System.

## Daily-Usage-Regel

Ein VIP-/Mod-Sound darf pro User nur einmal pro Stream-Tag ausgeloest werden.

Bei erneutem Versuch:

- Kein Sound-Request ans sound_system.
- Kein Overlay.
- Nur passende Duplicate-ChatMessage zurueckgeben.

Geplante Tabelle:

```sql
CREATE TABLE IF NOT EXISTS vip_sound_daily_usage (
  usage_date TEXT NOT NULL,
  user_login TEXT NOT NULL,
  user_display_name TEXT NOT NULL DEFAULT '',
  sound_type TEXT NOT NULL DEFAULT 'vip',
  source TEXT NOT NULL DEFAULT '',
  triggered_at TEXT NOT NULL,
  PRIMARY KEY (usage_date, user_login, sound_type)
);
```

Wichtig:

- Bestehende app.sqlite nur erweitern.
- Datenbank niemals neu bauen, ueberschreiben oder ersetzen.
- Migration nur sanft per CREATE TABLE IF NOT EXISTS bzw. bestehendem Migrationssystem.

## Heimleitungs-Zufallstexte

Nachrichten sollen im Heimleitungsstil formuliert sein, in SQLite gespeichert werden, spaeter im Dashboard bearbeitbar sein, mehrere Varianten pro Event-Key erlauben, aktivierbar/deaktivierbar sein und optional Gewichtung unterstuetzen.

Geplante Tabelle:

```sql
CREATE TABLE IF NOT EXISTS vip_sound_message_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_key TEXT NOT NULL,
  style TEXT NOT NULL DEFAULT 'heimleitung',
  message_text TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  weight INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(event_key, style, message_text)
);
```

Start-Event-Keys:

- accepted_vip
- accepted_mod
- duplicate_vip
- duplicate_mod
- system_disabled
- sound_missing
- error_generic

Platzhalter:

- {displayName}
- {login}
- {soundType}
- {trigger}
- {date}

Beispiel accepted_vip:

- @{displayName}, Heimleitung hat deinen VIP-Sound notiert. Wird abgespielt, sobald das System dich dranlaesst.
- @{displayName}, VIP-Antrag angenommen. Bitte im Wartebereich Platz nehmen, die Beschallung folgt.

Beispiel duplicate_vip:

- @{displayName}, Antrag abgelehnt. Dein VIP-Sound wurde heute bereits ordnungsgemaess verbraten.
- @{displayName}, Heimleitung sagt nein. Ein VIP-Sound pro Tag, wir sind hier nicht im Wunschkonzert.

## VIP-Soundpfad

Aktueller Live-Pfad:

- D:\Streaming\stramAssets\htdocs\assets\sounds\vip\

Aktuelle Dateiregel:

- Anzeigename.mp3

Ziel:

- Streamer.bot uebergibt keinen Soundpfad mehr.
- Basisordner wird konfigurierbar.
- bevorzugt relativer Pfad fuer Portabilitaet.

Geplante Konfiguration:

```json
{
  "vipSoundBaseDir": "htdocs/assets/sounds/vip",
  "fileNameMode": "displayName",
  "extension": ".mp3"
}
```

## Relevante vorhandene Helper

Vor Codeaenderung muessen vorhandene Helper genutzt werden, soweit passend.

Relevant:

- backend/modules/helpers/helper_core.js
- backend/modules/helpers/helper_config.js
- backend/modules/helpers/helper_messages.js
- backend/modules/helpers/helper_texts.js
- backend/modules/helpers/helper_chat_output.js
- backend/modules/helpers/helper_media.js
- backend/modules/helpers/helper_routes.js
- backend/modules/helpers/helper_state.js
- backend/modules/sqlite_core.js
- backend/core/database.js

Besonders relevant:

- helper_messages.js: Chatmessage saeubern, buildSendResponse/buildNoSendResponse/buildErrorResponse, Platzhalter ersetzen.
- helper_texts.js: vorhandene JSON-Textlistenlogik, aber VIP-Endziel ist SQLite.
- helper_chat_output.js: spaeter direkte Heimleitungs-/Bot-Ausgabe moeglich; erster Umbau bleibt Rueckgabe von chatMessage an Streamer.bot.

## Minimaler Streamer.bot-Request spaeter

```json
{
  "actorLogin": "forrestcgn",
  "actorDisplayName": "ForrestCGN",
  "type": "vip",
  "source": "streamerbot",
  "trigger": "!vip"
}
```

Optional spaeter bei Target-/Mod-Varianten:

```json
{
  "actorLogin": "forrestcgn",
  "actorDisplayName": "ForrestCGN",
  "targetLogin": "username",
  "targetDisplayName": "Username",
  "type": "mod",
  "source": "streamerbot",
  "trigger": "!modsound"
}
```

## Empfohlener naechster Code-STEP

STEP016 soll klein bleiben:

1. VIP-DB-Schema fuer Daily-Usage migrationssicher anlegen.
2. VIP-DB-Schema fuer Message-Templates migrationssicher anlegen.
3. Standard-Heimleitungstexte seeden, aber nur falls leer.
4. Neue/minimale VIP-Command-Route vorbereiten.
5. Duplicate-Pruefung einbauen.
6. chatMessage ueber helper_messages zurueckgeben.
7. Noch keine Dashboard-Seite.
8. Noch kein Overlay-Umbau.
9. Sound-System-Anbindung erst vorbereiten oder als separaten Folgestep machen.

Erste Zielkette:

- Streamer.bot -> Node -> Daily-Usage -> DB-Text -> chatMessage

Danach:

- Node -> sound_system -> VIP-Overlay bei echtem Soundstart

## Voraussichtlich betroffene Dateien fuer STEP016

Code:

- backend/modules/vip_sound_overlay.js
- backend/core/database.js oder backend/modules/sqlite_core.js, je nach finaler Pruefung
- backend/modules/helpers/helper_messages.js nur nutzen, nicht zwingend aendern

Doku:

- docs/current/CURRENT_SYSTEM_STATUS.md
- project-state/CURRENT_STATUS.md
- project-state/CHANGELOG.md
- project-state/FILES.md
- project-state/NEXT_STEPS.md
- neue STEP016-Doku

Nicht im ersten Code-STEP anfassen:

- htdocs/dashboard/modules/*
- htdocs/overlays/vip_sound_overlay.html
- backend/modules/sound_system.js
- backend/modules/alert_system.js

## Bewusst offen

- Finale Dashboard-Seite fuer VIP.
- Finale direkte Chat-Ausgabe ueber helper_chat_output.js.
- Finale Sound-System-Kopplung fuer echten Soundstart.
- Finale Overlay-Synchronisierung ueber sound_system current.visual.
- Umgang mit Sonderzeichen im Anzeigenamen-Dateinamen.
- Ob Mod-Sounds Prioritaet 60 oder 65 bekommen.

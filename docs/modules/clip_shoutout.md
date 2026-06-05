# Modul-Doku: clip_shoutout

Stand: 2026-06-05  
Aktuelle Version: `0.2.38`  
Aktueller stabiler CAN-Stand: `CAN-44.21.34`

## Zweck

`clip_shoutout` steuert das Clip-/Video-Shoutout-System für ForrestCGN. Das Modul verarbeitet manuelle Chat-Commands, DisplayQueue, OfficialQueue, Clip-Auswahl, Overlay-/Sound-Bundle-Ausgabe und Text-/Status-Routen.

## Aktueller Command-Stand

Der Command-Bereich ist seit CAN-44.21.34 stabil.

```text
!so  = Hauptbefehl
!vso = Alias
```

Nicht mehr aktiv:

```text
!clipso
!videoso
```

## Source of Truth

Für Chat-Commands ist `command_definitions` führend.

Wichtig:

```text
Direct-Intake liest Trigger aus command_definitions.
Alte Modul-Config darf Command-Definitionen nicht blind überschreiben.
Es darf nur einen aktiven clip_shoutout-Command-Eintrag geben.
```

Zielzustand:

```text
trigger      : so
aliases_json : ["vso"]
module_key   : clip_shoutout
action_key   : run
target_url   : /api/clip-shoutout/run
```

## Direct-Intake

Direct-Intake ist aktiv und nutzt keine versteckten DefaultTrigger mehr.

Status-Zielwert:

```text
directIntake.enabled                : True
directIntake.source                 : command_definitions
directIntake.commandDefinitionCount : 1
directIntake.fallbackUsed           : False
```

## Wichtige Routen

Runtime:

```text
GET/POST /api/clip-shoutout/run
GET/POST /api/clip/shoutout      (Legacy-Alias, behalten/markieren)
```

Status/Settings:

```text
GET      /api/clip-shoutout/status
GET/POST /api/clip-shoutout/settings
GET/POST /api/clip-shoutout/texts
GET      /api/clip-shoutout/texts/migration
```

Queue:

```text
GET  /api/clip-shoutout/queue
POST /api/clip-shoutout/display-queue/remove
POST /api/clip-shoutout/display-queue/retry
POST /api/clip-shoutout/queue/remove   (Legacy-Name für OfficialQueue)
POST /api/clip-shoutout/queue/retry    (Legacy-Name für OfficialQueue)
GET  /api/clip-shoutout/official/auth-status
```

Auto-/Inbound-/Debug-Routen bleiben vorhanden und wurden nicht entfernt.

## Stabiler Test

Nicht-live Live-Test bestanden:

```text
!so @pretos1 --force
!so @together_not_alone --force
!so @pretos1 --force
```

Erwartetes und bestätigtes Verhalten:

```text
1. erster Streamer wird angenommen/queued
2. zweiter Streamer wird queued
3. gleicher aktiver Streamer wird als already_active erkannt
```

## Nicht ändern ohne separate Analyse

```text
- Clip-Player
- sound_system_overlay.html
- DisplayQueue-Ablauf
- OfficialQueue-Ablauf
- Chattexte
- produktive SQLite-Daten
```

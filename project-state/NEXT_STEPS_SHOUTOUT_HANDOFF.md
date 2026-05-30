# NEXT STEPS – Übergabe zum Shoutout-System

Stand: 2026-05-30

## Aktueller abgeschlossener Vorblock

Der Event-Bus-/Bus-Diagnose-Bereich wurde bis STEP618B stabilisiert:

```text
STEP617C – Event-Bus Settings direkt in communication_bus.js integriert
STEP618  – Overlay-Clients im Bus-Dashboard sichtbar gemacht
STEP618B – Overlay-Client-Erkennung korrigiert
```

Gültig:

```text
backend/modules/communication_bus.js
htdocs/dashboard/modules/bus_diagnostics.js
htdocs/dashboard/modules/bus_diagnostics.css
```

Verworfen:

```text
backend/modules/communication_bus_settings.js
STEP617B_event_bus_config_tab_hotfix_v0.1.1
```

## Neuer Fokus

Forrest möchte am Shoutout-System weiterarbeiten.

## Arbeitsregel für den nächsten Chat

Vor Änderungen am Shoutout-System zuerst echte Dateien prüfen.

Keine Annahmen aus Erinnerung.

Keine neuen Parallelmodule, wenn bestehende Zuständigkeiten vorhanden sind.

Keine Funktionalität entfernen.

Keine Teilpatches.

## Zu prüfende Shoutout-Dateien

Die genauen Dateien müssen im nächsten Chat aus GitHub/dev geprüft werden. Mögliche relevante Bereiche:

```text
backend/modules/clip_shoutout.js
docs/system-inspection/SHOUTOUT_SYSTEM_CONSOLIDATION.md
htdocs/dashboard/modules/
config/
backend/modules/helpers/
```

Je nach tatsächlichem Ziel zusätzlich:

```text
Streamer.bot Actions / C# Scripts
OBS-Szenen / Browserquellen
Twitch API / Userdaten / Clips
Dashboard-Moduldateien
```

## Startfrage für den nächsten Arbeitsblock

Zuerst klären:

```text
Was genau soll am Shoutout-System als nächstes passieren?
```

Mögliche Richtungen:

```text
- bestehendes Mega-Shoutout-System prüfen
- Dashboard-Anbindung planen
- Clip-/Shoutout-System prüfen
- Streamer.bot-Integration aufräumen
- EventBus-Anbindung nur vorbereiten, nicht produktiv erzwingen
```

## Nicht automatisch machen

```text
- keine neue Moduldatei ohne Prüfung
- keine Runtime-/EventBus-Umschaltung ohne Plan
- keine OBS-/Streamer.bot-Änderungen ohne konkrete Dateien
- keine DB-Änderung ohne vorhandenes Schema-/Helper-Muster zu prüfen
```

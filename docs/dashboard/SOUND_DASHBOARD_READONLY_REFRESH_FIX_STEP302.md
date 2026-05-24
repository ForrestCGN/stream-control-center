# STEP302 – Sound Dashboard Bus-Monitor Readonly Refresh Fix

Stand: 2026-05-24

## Ziel

Der Button **Status neu laden** im Dashboard-Tab **SoundBus Monitoring** soll rein lesend bleiben.

Aus STEP301 wurde festgehalten: Der Bus-Monitor ist als Monitoring-/Diagnosefläche gedacht. Er darf Status lesen, aber keine steuernden Backend-Aktionen auslösen.

## Änderung

Geänderte Datei:

```text
htdocs/dashboard/modules/sound.js
```

Der Button im Bus-Monitor nutzt jetzt eine eigene Action:

```text
refresh-status
```

Diese Action ruft nur noch lesend auf:

```text
GET /api/sound/status
```

und rendert anschließend den vorhandenen Sound-Status neu.

## Bewusst nicht geändert

- Der globale Sound-System-Button **Neu laden** bleibt unverändert.
- `POST /api/sound/reload` bleibt für die bestehende Hauptaktion erhalten.
- Keine Backend-Routen geändert.
- Keine Sound-Queue geändert.
- Keine Bundle-/`activeBundleLock`-Logik geändert.
- Keine SoundBus-Event-Logik geändert.
- Keine Alert-/Discord-/TTS-/VIP-Module geändert.
- Keine DB-Migration.

## Test

Syntaxcheck:

```cmd
node --check htdocs/dashboard/modules/sound.js
```

Ergebnis: OK.

## Erwartung nach Deploy

Dashboard:

```text
System -> Sound-System -> Bus-Monitor -> Status neu laden
```

soll nur den Status aktualisieren und keinen `POST /api/sound/reload` mehr auslösen.


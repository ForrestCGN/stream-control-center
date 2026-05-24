# STEP303 – Sound Dashboard Bus-Monitor Auto Refresh

Stand: 2026-05-24

## Ziel

Der Sound Dashboard Bus-Monitor soll weiterhin rein lesend bleiben, aber seinen Status automatisch aktualisieren, solange der Tab `Bus-Monitor` aktiv ist.

## Änderung

Datei:

```text
htdocs/dashboard/modules/sound.js
```

Ergänzt wurde ein Auto-Refresh für den Bus-Monitor:

```text
alle 5 Sekunden
GET /api/sound/status
nur während der Tab Bus-Monitor aktiv ist
```

Der manuelle Button `Status neu laden` nutzt weiterhin nur:

```text
GET /api/sound/status
```

## Wichtig

Es wird kein Sound-Reload ausgelöst.

Nicht geändert:

```text
POST /api/sound/reload
POST /api/sound/stop
POST /api/sound/skip
POST /api/sound/clear
Sound-Queue
Bundle-/activeBundleLock-Logik
SoundBus-Event-Logik
Alert-/Discord-/TTS-/VIP-Module
DB
```

## Verhalten

- Auto-Refresh startet beim Wechsel in den Tab `Bus-Monitor`.
- Auto-Refresh stoppt beim Verlassen des Tabs.
- Parallele Refreshes werden verhindert.
- Die Anzeige zeigt die letzte Aktualisierungszeit.

## Test

Syntaxcheck:

```cmd
node --check htdocs/dashboard/modules/sound.js
```

Ergebnis: OK.

## Erwartung im Live-Test

```text
Dashboard -> System -> Sound-System -> Bus-Monitor
Auto-Refresh sichtbar
Status aktualisiert sich automatisch
keine Queue-Änderung
kein POST /api/sound/reload
soundBus.errors bleibt 0
```

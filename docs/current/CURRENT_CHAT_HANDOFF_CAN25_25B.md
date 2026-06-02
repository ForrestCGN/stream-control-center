# Current Chat Handoff - CAN25.25b

## Projekt

ForrestCGN `stream-control-center`

```text
Repo: https://github.com/ForrestCGN/stream-control-center
Branch: dev
Lokales Repo: D:\Git\stream-control-center
Live-Ziel: D:\Streaming\stramAssets
```

## Aktueller Stand

CAN-25.25b abgeschlossen: Bus-Diagnose / Bus-Matrix / Overlay-Monitor / Alert-Diagnose wurden weiter stabilisiert. Die Dokumentation wurde fuer einen neuen Chat aktualisiert.

## Wichtigste Regeln

```text
Keine Funktionalitaet entfernen.
Immer echte aktuelle Dateien/GitHub-dev/Live als Single Source of Truth pruefen.
Erst analysieren/planen, dann auf ausdrueckliches go umsetzen.
Keine produktive Aktion ohne separaten Go-Schritt.
Keine DB ueberschreiben oder neu bauen.
Keine Apply-/Patch-Scripts als Standardlieferung.
```

## Abgeschlossene CAN-25 Schritte seit CAN-25.4

```text
CAN-25.5  Sound-Shadow Summary Card liest echte Bus-Matrix-Row channelpoints.
CAN-25.6  Statusklarheit: Auto-Hook disabled ist erwartbar, kein Fehler.
CAN-25.7  Systeme-Tabelle kompakter.
CAN-25.8c Detailbereich lesbarer/full-width.
CAN-25.9  Rohdaten/Details UX Cleanup.
CAN-25.10 Sichtfilter.
CAN-25.11 Diagnose-Zusammenfassung.
CAN-25.12 Alert-System Diagnose-Zusammenfassung.
CAN-25.13 Overlay-Monitor Diagnose-Zusammenfassung.
CAN-25.15 Overlay-Monitor MODULE_VERSION Fix.
CAN-25.17 Overlay-Monitor Zeit-/Risk-Fix.
CAN-25.19 Alert Dry-Run objectValue Fix.
CAN-25.22 Overlay-Monitor scene-aware Status.
CAN-25.23 Overlay-Monitor Summary-Clarity.
CAN-25.24 Dashboard scene-aware Overlay-Monitor Anzeige.
CAN-25.25b Bus-Matrix Systeme wirklich kompakt.
```

## Relevante Dateien

```text
backend/modules/overlay_monitor.js
backend/modules/alert_system.js
htdocs/dashboard/modules/bus_diagnostics.js
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
docs/current/CURRENT_CHAT_HANDOFF_CAN25_25B.md
```

## Aktuelles Ergebnis Overlay-Monitor

Nach CAN-25.22/25.23 liefert `/api/overlay-monitor/client-control/status` scene-aware Felder:

```text
activeExpected
expectedInactive
expectedIdle
expectedNotActive
monitorStatus
monitorRisk
rawStatus
```

Bestaetigter Test:

```text
total: 10
online: 1
info: 9
warning: 0
error: 0
heartbeat: 10
stale: 0
dead: 0
expectedInactive: 7
expectedIdle: 2
expectedNotActive: 9
activeExpected: 1
```

Problemfaelle wurden korrekt eingeordnet:

```text
overlay:easteregg_winner_overlay -> expected_idle / info
overlay:frame_overlay            -> online / ok / activeExpected true
```

## Warum scene-aware noetig war

Die Overlay-HTML-Dateien `_rahmen.html` und `_overlay-easteregg_winner.html` laden `overlay_bus_client.js` korrekt und setzen `data-heartbeat-ms="5000"`. Das Flapping kam nicht aus kaputtem Heartbeat-Code, sondern wahrscheinlich durch OBS/Szenenaktivitaet: Browserquellen koennen je nach aktiver Szene pausieren/entladen. Daher darf nicht jede inaktive Quelle als echte Warning gelten.

## Aktuelles Dashboard-Ergebnis

CAN-25.24 brachte die scene-aware Felder ins Dashboard. Die erste Version verursachte eine Layout-Regression im SYSTEME-Bereich. CAN-25.25b hat das repariert:

```text
SYSTEME-Bereich wieder lesbar.
Command/ACK-Spalte ist kurz.
Keine langen Detailbloecke mehr in der Tabellenzelle.
Risiko/Nächster Schritt bleibt lesbar.
```

## Bekannte Beobachtungen / spaeter pruefen

```text
Doppelte lokale Struktur D:\Git\stream-control-center\htdocs\htdocs\... existiert.
Nicht blind loeschen, spaeter separat pruefen.

Dashboard SYSTEME-Bereich ist funktional wieder lesbar, kann spaeter aber optisch noch feiner/flacher werden.

Node-Log kann bei OBS-Szenenwechseln weiterhin WS disconnect/connect zeigen. Das ist nicht automatisch kritisch.
```

## Weiterhin verboten / nicht passiert

```text
Keine OBS-Reparatur.
Kein Browser-Source-Refresh.
Keine automatische Recovery.
Keine DB-Migration.
Kein Overlay-HTML-Umbau.
Kein Sound-Play.
Keine Queue-Aktion.
Keine Twitch-/Redemption-Write-Aktion.
Keine produktive Sound-Bus-Migration.
```

## Empfohlener Start im neuen Chat

```text
Wir machen mit dem stream-control-center weiter. Bitte lies zuerst docs/current/CURRENT_CHAT_HANDOFF_CAN25_25B.md und halte dich an den Master-Prompt. Aktueller Stand ist CAN-25.25b abgeschlossen. Nächster Schritt: CAN-26.0 GitHub/dev und Live-System abgleichen und Bus-Diagnose final gegenprüfen.
```

## Empfohlener CAN-26.0 Start

```text
CAN-26.0 - Abschluss-/Qualitaetscheck fuer Bus-Diagnose + Git/Live-Synchronisation
```

Pruefen:

```text
- GitHub/dev und Live-Dateien bewusst abgleichen.
- Dashboard Bus-Diagnose mit Strg+F5 laden.
- /api/overlay-monitor/client-control/status pruefen.
- SYSTEME-Bereich visuell pruefen.
- Keine produktiven Aktionen ausfuehren.
```

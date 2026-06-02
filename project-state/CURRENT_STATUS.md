# CURRENT_STATUS

## Stand: CAN-25.25b abgeschlossen

Dokumentation, TODO, Next Steps und Handoff wurden fuer einen neuen Chat aktualisiert.

## Aktueller Arbeitsbereich

```text
CAN-25: Dashboard/Bus-Diagnose, Bus-Matrix, Overlay-Monitor und Alert-/Sound-Diagnose
```

## Aktueller stabiler Stand

CAN-25 wurde von der Sound-Shadow Summary Card ueber Bus-Matrix-/Alert-/Overlay-Diagnose bis zur scene-aware Overlay-Monitor-Anzeige weitergefuehrt.

Abgeschlossen und live getestet:

```text
CAN-25.5  Sound-Shadow Summary Card liest echte matrix.rows[id="channelpoints"] Daten.
CAN-25.6  Sound-Shadow Statusklarheit fuer deaktivierten Auto-Hook.
CAN-25.7  Bus-Matrix Systeme-Tabelle kompakter.
CAN-25.8c Bus-Matrix Details lesbar/full-width.
CAN-25.9  Detail-/Rohdaten-UX Cleanup.
CAN-25.10 Bus-Matrix Sichtfilter.
CAN-25.11 Diagnose-Zusammenfassung.
CAN-25.12 Alert-System Diagnose-Zusammenfassung.
CAN-25.13 Overlay-Monitor Diagnose-Zusammenfassung.
CAN-25.15 Overlay-Monitor MODULE_VERSION Fix.
CAN-25.17 Overlay-Monitor Client-Control Zeit-/Risk-Fix.
CAN-25.19 Alert Dry-Run objectValue Fix.
CAN-25.22 Overlay-Monitor scene-aware Status.
CAN-25.23 Overlay-Monitor Summary-Clarity.
CAN-25.24 Dashboard nutzt scene-aware Overlay-Monitor-Felder.
CAN-25.25b Bus-Matrix Systeme wirklich kompakt.
```

## Letztes Testergebnis

CAN-25.23 Backend-Test nach scene-aware Overlay-Monitor:

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

Gezielte Problemfaelle:

```text
overlay:easteregg_winner_overlay -> expected_idle / info / rawStatus online
overlay:frame_overlay            -> online / ok / activeExpected true
```

CAN-25.25b Dashboard-Screenshot bestaetigte:

```text
SYSTEME-Bereich wieder lesbar und kompakt.
Command/ACK-Spalte zeigt kurze Summary statt langer Detailbloecke.
Risiko/Nächster Schritt bleibt lesbar.
```

## Wichtige Erkenntnisse

```text
Overlay-HTMLs fuer _rahmen und _overlay-easteregg_winner laden overlay_bus_client.js korrekt.
Beide senden Heartbeat alle 5000ms, wenn OBS/Browserquelle aktiv bleibt.
OBS/Szenenaktivitaet kann Browserquellen erwartbar pausieren/entladen.
Daher bewertet der Overlay-Monitor jetzt activeExpected, expectedInactive, expectedIdle und expectedNotActive.
```

## Weiterhin verboten / nicht passiert

```text
Keine OBS-Reparatur.
Kein Source-Refresh.
Keine automatische Recovery.
Keine DB-Migration.
Kein Overlay-HTML-Umbau.
Kein Sound-Play.
Keine Queue-Aktion.
Keine Twitch-/Redemption-Write-Aktion.
Keine produktive Sound-Bus-Migration.
```

## Naechster Schritt

```text
Neuer Chat: aktuellen Stand gegen GitHub/dev und Live pruefen, dann CAN-26 planen.
Empfohlener Fokus: CAN-26.0 Abschluss-/Qualitaetscheck fuer Bus-Diagnose + offene Dokumentations-/Git-Synchronisation pruefen.
```

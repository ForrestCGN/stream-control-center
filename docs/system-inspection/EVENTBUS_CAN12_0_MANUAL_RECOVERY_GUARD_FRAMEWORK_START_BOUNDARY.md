# CAN-12.0 - Manual Recovery Guard Framework Start Boundary

## Zweck

CAN-12.0 startet den Block fuer ein einheitliches Manual-Recovery-Guard-Framework.

Dieser Step ist reine Planung. Es wird noch kein Code geaendert.

## Ausgangslage

Abgeschlossen:

- CAN-8.x: Recovery-Preflight read-only Statusfelder und Dashboard-Anzeige
- CAN-9.x: dedizierte read-only Preflight-Route und Dashboard-Konsum
- CAN-10.x: `manual_diagnostics_refresh`
- CAN-11.x: `manual_status_resync_request`

Beide manuellen Aktionen bleiben read-only und fuehren keine Recovery aus.

## Warum ein Guard-Framework?

Bisher verwenden wir mehrere Guard-Begriffe:

- ReadOnlyGuard
- NoMutationGuard
- RouteSafetyGuard
- NoPrepareExecuteGuard
- DashboardOnlyGuard
- NoAutoRetryGuard
- ProductiveTouchGuard

Diese Begriffe sollen vereinheitlicht werden, bevor spaeter riskantere Recovery-Kandidaten geplant werden.

## Ziel von CAN-12.x

CAN-12.x soll definieren:

- welche Guards es gibt
- was jeder Guard prueft
- welche Felder jeder Guard erwartet
- wie Guard-Ergebnisse dargestellt werden
- wie Guard-Ergebnisse fuer spaetere Kandidaten wiederverwendet werden
- welche Guards fuer read-only Aktionen Pflicht sind
- welche Guards fuer produktive Aktionen zusaetzlich notwendig waeren

## Noch nicht Ziel

CAN-12.x startet noch keine echte Recovery.

Nicht erlaubt:

- keine POST-Route
- keine Command-Route
- keine Prepare-Route
- keine Execute-Route
- keine Recovery-Ausfuehrung
- keine Queue-Mutation
- keine Sound-Mutation
- keine Alert-Mutation
- keine Overlay-Mutation
- keine DB-Aenderung
- keine Config-Aenderung
- keine Streamer.bot-Aktion
- keine OBS-Aktion

## Guard-Kategorien

### Kategorie 1 - Read-only Guards

Pflicht fuer alle aktuellen Aktionen:

```text
ReadOnlyGuard
NoMutationGuard
RouteSafetyGuard
NoPrepareExecuteGuard
DashboardOnlyGuard
```

### Kategorie 2 - Timing / Loop Guards

Relevant fuer spaetere Buttons oder Watcher:

```text
NoAutoRetryGuard
NoTimerGuard
ManualOnlyGuard
```

### Kategorie 3 - Productive Touch Guards

Relevant, bevor produktive Module ueberhaupt angefasst werden duerfen:

```text
NoQueueTouchGuard
NoSoundTouchGuard
NoAlertTouchGuard
NoOverlayTouchGuard
NoObsTouchGuard
NoStreamerBotTouchGuard
```

### Kategorie 4 - Execution Guards

Noch blockiert, nur fuer spaetere Planung:

```text
PrepareAllowedGuard
ExecuteAllowedGuard
AuditRequiredGuard
ConfirmRequiredGuard
RollbackAvailableGuard
SafetyStopGuard
```

## Minimaler Guard-Ergebnisvertrag

Spaeter sollen Guards ein einheitliches Ergebnis liefern koennen:

```json
{
  "key": "readOnlyGuard",
  "label": "Read-only Guard",
  "ok": true,
  "severity": "ok",
  "blocking": true,
  "reason": "",
  "details": {},
  "source": "dashboard|route|preflight|candidate",
  "checkedAt": "ISO timestamp"
}
```

## Severity-Werte

Geplante Severity-Werte:

```text
ok
info
warning
blocked
error
```

## Blocking-Regel

Ein Guard mit `blocking: true` und `ok: false` muss eine spaetere Aktion blockieren.

Fuer aktuelle read-only Aktionen bedeutet das:

```text
keine Ausfuehrung
nur Fehleranzeige im Dashboard
```

## Dashboard-Zielbild

Spaeter soll das Dashboard Guard-Ergebnisse einheitlich anzeigen koennen:

```text
Guard
Status
Blocking
Severity
Reason
Source
CheckedAt
```

## CAN-12.1 Empfehlung

CAN-12.1 soll den Guard-Katalog detailliert planen:

```text
Manual Recovery Guard Catalog Plan
```

Darin sollen alle Guards mit:

- Zweck
- Input-Feldern
- Erfolgskriterium
- Fehlerkriterium
- Blocking-Verhalten
- Dashboard-Label
- Einsatzbereich

beschrieben werden.

## CAN-12.1 Grenze

CAN-12.1 bleibt reine Dokumentation.

Keine Code-Aenderung in CAN-12.1.

## Nicht geaendert

- Keine Backend-Datei geaendert
- Keine Dashboard-Datei geaendert
- Keine API-Route hinzugefuegt
- Keine Config geaendert
- Keine DB geaendert
- Keine Recovery ausgefuehrt
- Keine produktive Flow-Aenderung

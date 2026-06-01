# CAN-12.2 - Manual Recovery Guard Display Contract Plan

## Zweck

CAN-12.2 plant den einheitlichen Anzeigevertrag fuer Guard-Ergebnisse im Dashboard.

Dieser Step ist reine Planung. Es wird noch kein Code geaendert.

## Ausgangslage

CAN-12.1 hat den Guard-Katalog definiert.

Wichtige Guard-Kategorien:

```text
read_only
timing_loop
productive_touch
execution
audit_confirmation
safety_stop
```

## Ziel

Guard-Ergebnisse sollen spaeter einheitlich dargestellt werden koennen, unabhaengig davon, ob sie von:

- Dashboard-State
- Preflight-Route
- Recovery-Kandidat
- Guard-Framework
- spaeterem Backend-Check

kommen.

## Einheitlicher Guard-Eintrag

Jeder Guard soll spaeter so angezeigt werden koennen:

```json
{
  "key": "readOnlyGuard",
  "label": "Read-only",
  "category": "read_only",
  "ok": true,
  "severity": "ok",
  "blocking": true,
  "reason": "",
  "details": {},
  "source": "dashboard",
  "checkedAt": "ISO timestamp"
}
```

## GuardSummary

Zusaetzlich soll eine Zusammenfassung erzeugt werden koennen:

```json
{
  "total": 8,
  "ok": 8,
  "info": 0,
  "warning": 0,
  "blocked": 0,
  "error": 0,
  "blockingFailed": 0,
  "hasBlockingFailure": false,
  "generatedAt": "ISO timestamp"
}
```

## Dashboard-Zielbild

Einheitliche Karte:

```text
Recovery Guards
```

Moegliche Darstellung:

```text
Guards: 8
OK: 8
Warnings: 0
Blocked: 0
Errors: 0
Blocking Failed: 0
```

Tabelle:

```text
Guard | Kategorie | Status | Blocking | Severity | Quelle | Grund
```

## Status-Labels

Geplante Labels:

```text
ok       -> OK
info     -> Info
warning  -> Warnung
blocked  -> Blockiert
error    -> Fehler
```

## Boolean-Labels

Einheitlich:

```text
true  -> ja
false -> nein
```

Bei Guard-Status:

```text
ok true  -> OK
ok false -> Nicht OK
```

## Blocking-Anzeige

Wenn `blocking === true`:

```text
blockierend
```

Wenn `blocking === false`:

```text
informativ
```

Wenn `blocking === true && ok === false`:

```text
BLOCKIERT
```

## Reihenfolge der Anzeige

Guards sollen sortiert werden nach:

1. Blocking fehlgeschlagen
2. Error
3. Blocked
4. Warning
5. Info
6. OK
7. Kategorie
8. Label

## Pflichtfelder fuer Anzeige

Ein Guard-Eintrag muss mindestens haben:

```text
key
label
category
ok
severity
blocking
source
checkedAt
```

Optionale Felder:

```text
reason
details
```

## Umgang mit fehlenden Feldern

Wenn ein Guard unvollstaendig ist, darf das Dashboard nicht abstuerzen.

Fallbacks:

```text
label -> key
category -> unknown
severity -> info
blocking -> false
reason -> leer
source -> unknown
checkedAt -> leer
```

## Einsatz bei aktuellen Aktionen

Die Anzeige soll spaeter fuer diese Aktionen nutzbar sein:

```text
manual_diagnostics_refresh
manual_status_resync_request
```

Pflicht-Guards fuer diese Aktionen:

```text
ReadOnlyGuard
NoMutationGuard
RouteSafetyGuard
NoPrepareExecuteGuard
DashboardOnlyGuard
NoAutoRetryGuard
NoTimerGuard
ManualOnlyGuard
```

## Noch nicht umsetzen

CAN-12.2 fuegt keine Karte hinzu und aendert keine Datei.

Die spaetere Umsetzung darf erst nach separater Startgrenze passieren.

## Empfehlung fuer CAN-12.3

CAN-12.3 soll eine technische Umsetzungsgrenze fuer die Dashboard-Anzeige planen:

```text
Manual Recovery Guard Display UI Implementation Boundary
```

Empfehlung:

- keine Backend-Aenderung
- keine neue Route
- nur Dashboard-Hilfsfunktionen
- GuardSummary lokal berechnen
- Guard-Tabelle fuer bestehende read-only Aktionen anzeigen

## CAN-12.3 Grenze

CAN-12.3 bleibt reine Dokumentation.

Keine Code-Aenderung in CAN-12.3.

## Nicht geaendert

- Keine Backend-Datei geaendert
- Keine Dashboard-Datei geaendert
- Keine API-Route hinzugefuegt
- Keine Config geaendert
- Keine DB geaendert
- Keine Recovery ausgefuehrt
- Keine produktive Flow-Aenderung

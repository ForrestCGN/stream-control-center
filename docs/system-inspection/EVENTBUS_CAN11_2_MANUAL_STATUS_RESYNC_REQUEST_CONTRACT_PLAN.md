# CAN-11.2 - Manual Status Resync Request Contract Plan

## Zweck

CAN-11.2 plant den Vertrag fuer den naechsten read-only Kandidaten:

```text
manual_status_resync_request
```

Dieser Step ist reine Planung. Es wird noch kein Code geaendert.

## Einordnung

`manual_status_resync_request` ist keine echte Recovery-Ausfuehrung.

Der Kandidat gehoert zur Klasse 1:

```text
planned_readonly
```

Ziel ist nur, bekannte Diagnose- und Statusquellen kontrolliert neu einzulesen und im Dashboard als Resync-Ergebnis sichtbar zu machen.

## Unterschied zu manual_diagnostics_refresh

Bereits umgesetzt:

```text
manual_diagnostics_refresh
```

Bedeutung:

- Dashboard laedt Status/Preflight neu
- UI rendert neu
- rein lokaler manueller Refresh

Geplant mit `manual_status_resync_request`:

- strukturierter Resync-Status
- klarer Kandidatenname
- definierte Guards
- definierte Safety-Auswertung
- spaeter ggf. eigene read-only Ergebnis-Karte
- weiterhin keine produktive Mutation

## Erlaubte Datenquellen

Spaeter erlaubt:

```text
GET /api/bus-diagnostics/status
GET /api/bus-diagnostics/recovery-preflight
```

Optional spaeter nur, wenn bereits read-only vorhanden und ohne Nebeneffekte:

```text
GET /api/bus-diagnostics/*
```

Nicht erlaubt:

- POST
- PUT
- PATCH
- DELETE
- Streamer.bot Trigger
- OBS Commands
- Modul-Commands
- Queue-Kommandos
- Sound-Kommandos
- Alert-Kommandos
- Overlay-Kommandos

## Geplanter Ergebnis-Vertrag

Spaeterer lokaler/diagnostischer Response-Vertrag:

```json
{
  "action": "manual_status_resync_request",
  "ok": true,
  "readOnly": true,
  "productiveTouch": false,
  "canPrepare": false,
  "canExecute": false,
  "sources": [
    "GET /api/bus-diagnostics/status",
    "GET /api/bus-diagnostics/recovery-preflight"
  ],
  "checks": {
    "routeSafetyOk": true,
    "preflightReady": true,
    "checkMatrixOk": true,
    "noBlockingChecks": true
  },
  "startedAt": "ISO timestamp",
  "completedAt": "ISO timestamp"
}
```

Bei Fehler:

```json
{
  "action": "manual_status_resync_request",
  "ok": false,
  "readOnly": true,
  "productiveTouch": false,
  "error": "message",
  "startedAt": "ISO timestamp",
  "completedAt": "ISO timestamp"
}
```

## Benoetigte Guards

Fuer eine spaetere Umsetzung muessen folgende Guards gelten:

### ReadOnlyGuard

Muss garantieren:

```text
readOnly === true
```

### NoMutationGuard

Muss garantieren:

```text
productiveTouch === false
```

### RouteSafetyGuard

Muss garantieren:

```text
method: GET
commandRoute: false
prepareRoute: false
executeRoute: false
recoveryExecution: false
```

### NoPrepareExecuteGuard

Muss garantieren:

```text
canPrepare: false
canExecute: false
```

### NoAutoRetryGuard

Muss garantieren:

```text
kein Auto-Retry
kein Timer
keine Schleife
```

### DashboardOnlyGuard

Muss garantieren:

```text
nur Dashboard-Anzeige
keine externe Aktion
```

## Verbotene Mutationen

Weiterhin verboten:

- Queue leeren
- Queue neu sortieren
- Alert erneut ausloesen
- Sound erneut ausloesen
- Sound stoppen/starten
- Overlay anzeigen/verstecken
- Overlay-State veraendern
- EventBus Events produktiv neu senden
- Streamer.bot Action starten
- OBS Quelle/Szene veraendern
- DB schreiben
- Config schreiben
- Audit als Recovery-Ausfuehrung schreiben

## Audit-Regeln

`manual_status_resync_request` braucht noch kein produktives Recovery-Audit.

Erlaubt waere spaeter nur:

```text
diagnostics_resync_requested
diagnostics_resync_completed
diagnostics_resync_failed
```

Diese Logs duerfen keinen Ausfuehrungscharakter haben.

## Dashboard-Sichtbarkeit

Spaeter moeglich:

```text
Karte: Manueller Status-Resync
Button: Status neu synchronisieren
```

Die Karte muss klar anzeigen:

- read-only
- keine produktive Beruehrung
- Prepare: nein
- Execute: nein
- verwendete Quellen
- letzter Resync-Zeitpunkt
- Ergebnis

## Warum noch kein Code in CAN-11.2

Vor Code braucht es noch eine technische Umsetzungsgrenze:

- eigene Dashboard-Karte oder Erweiterung der bestehenden Refresh-Karte?
- nur lokaler UI-State oder eigenes Backend-Read-only-Feld?
- benoetigt es eine neue GET-Route oder reichen bestehende GET-Routen?
- wie unterscheidet sich die UX klar von `Preflight neu laden`?

## Empfehlung fuer CAN-11.3

CAN-11.3 soll eine technische Umsetzungsgrenze planen:

```text
Manual Status Resync Request UI/Implementation Boundary
```

Empfehlung:

- zunaechst keine neue Backend-Route
- keine Backend-Datei
- nur Dashboard-Konzept
- eventuell bestehenden Diagnose-Refresh erweitern oder als zweite read-only Karte anzeigen
- noch kein Code in CAN-11.3

## CAN-11.3 Grenze

CAN-11.3 bleibt reine Dokumentation.

Keine Code-Aenderung in CAN-11.3.

## Nicht geaendert

- Keine Backend-Datei geaendert
- Keine Dashboard-Datei geaendert
- Keine API-Route hinzugefuegt
- Keine Config geaendert
- Keine DB geaendert
- Keine Recovery ausgefuehrt
- Keine produktive Flow-Aenderung

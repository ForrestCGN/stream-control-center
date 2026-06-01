# CAN-12.3 - Manual Recovery Guard Display UI Implementation Boundary

## Zweck

CAN-12.3 definiert die technische Umsetzungsgrenze fuer eine spaetere einheitliche Guard-Anzeige im Dashboard.

Dieser Step ist reine Planung. Es wird noch kein Code geaendert.

## Ausgangslage

CAN-12.1 hat den Guard-Katalog geplant.

CAN-12.2 hat den Anzeigevertrag fuer Guard-Ergebnisse geplant.

CAN-12.3 legt nun fest, wie die erste technische Dashboard-Umsetzung aussehen darf.

## Ziel fuer CAN-12.4

CAN-12.4 darf eine rein lokale Dashboard-Anzeige fuer Guard-Ergebnisse umsetzen.

Erlaubte Datei:

```text
htdocs/dashboard/modules/bus_diagnostics.js
```

## Geplante UI

Bereich:

```text
Event-Bus / Communication Bus -> Recovery -> Preflight
```

Geplante Karte:

```text
Recovery Guards
```

Die Karte soll die Guard-Ergebnisse aus vorhandenen lokalen Aktionen anzeigen:

```text
manual_diagnostics_refresh
manual_status_resync_request
```

## Erlaubter technischer Scope fuer CAN-12.4

Nur Dashboard-Code.

Erlaubt:

- lokale Helper-Funktionen fuer Guard-Normalisierung
- lokale Helper-Funktion fuer GuardSummary
- lokale Guard-Tabelle
- Fallbacks fuer fehlende Guard-Felder
- Anzeige vorhandener Guards aus:
  - manual_diagnostics_refresh
  - manual_status_resync_request
- kein Backend-Schreibzugriff
- keine neue API-Route
- keine neue Recovery-Aktion

## Nicht erlaubt fuer CAN-12.4

- keine Backend-Datei
- keine neue API-Route
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
- kein Auto-Refresh
- kein Timer
- kein Retry-Loop
- keine Streamer.bot-Aktion
- keine OBS-Aktion

## Geplante lokale Helper

### normalizeGuard

Aufgabe:

- Guard-Eintrag robust normalisieren
- fehlende Felder mit Fallbacks fuellen
- Dashboard-Abstuerze durch unvollstaendige Guards vermeiden

Minimaler Output:

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

### summarizeGuards

Aufgabe:

- Guard-Liste zusammenfassen
- Counts fuer total/ok/info/warning/blocked/error/blockingFailed erzeugen

Minimaler Output:

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

### renderGuardDisplay

Aufgabe:

- Karte `Recovery Guards` rendern
- Summary anzeigen
- Tabelle anzeigen
- Guards sortiert anzeigen

## Sortierung

Guards sollen sortiert werden nach:

1. Blocking fehlgeschlagen
2. Error
3. Blocked
4. Warning
5. Info
6. OK
7. Kategorie
8. Label

## Dashboard-Anzeige

Kartenkopf:

```text
Recovery Guards
```

Summary:

```text
Guards
OK
Warnings
Blocked
Errors
Blocking Failed
```

Tabelle:

```text
Guard | Kategorie | Status | Blocking | Severity | Quelle | Grund
```

## Datenquelle fuer die erste Umsetzung

CAN-12.4 soll noch keine neue Datenquelle schaffen.

Erlaubt sind nur bereits im Dashboard vorhandene lokale Guard-Resultate:

- Guard-Resultate aus `manual_diagnostics_refresh`, falls vorhanden
- Guard-Resultate aus `manual_status_resync_request`, falls vorhanden

Wenn keine Guards vorhanden sind, soll die Karte anzeigen:

```text
Noch keine Guard-Daten geladen.
```

## Testgrenze fuer CAN-12.4

Nach Umsetzung soll getestet werden:

1. Dashboard oeffnen:
   ```text
   Event-Bus / Communication Bus -> Recovery -> Preflight
   ```
2. Karte `Recovery Guards` sichtbar.
3. Ohne Klick: robuste Fallback-Anzeige.
4. Nach `Preflight neu laden`: Guards bleiben read-only.
5. Nach `Status neu synchronisieren`: Guards sichtbar und zusammengefasst.
6. Keine Recovery-/Prepare-/Execute-/Simulation-Buttons erscheinen.

## CAN-12.4 Startgrenze

CAN-12.4 darf die Dashboard-UI additiv umsetzen.

Keine Backend-Aenderung in CAN-12.4.

## Nicht geaendert

- Keine Backend-Datei geaendert
- Keine Dashboard-Datei geaendert
- Keine API-Route hinzugefuegt
- Keine Config geaendert
- Keine DB geaendert
- Keine Recovery ausgefuehrt
- Keine produktive Flow-Aenderung

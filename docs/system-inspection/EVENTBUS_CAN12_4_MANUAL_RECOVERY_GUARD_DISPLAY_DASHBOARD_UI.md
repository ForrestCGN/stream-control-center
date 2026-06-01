# CAN-12.4 - Manual Recovery Guard Display Dashboard UI

## Zweck

CAN-12.4 setzt die in CAN-12.3 geplante read-only Guard-Anzeige im Dashboard additiv um.

## Geaenderte Datei

```text
htdocs/dashboard/modules/bus_diagnostics.js
```

## Neue Anzeige

Bereich:

```text
Event-Bus / Communication Bus -> Recovery -> Preflight
```

Neue Karte:

```text
Recovery Guards
```

## Umgesetzt

Additiv umgesetzt wurden lokale Dashboard-Helfer:

```text
normalizeGuard
summarizeGuards
sortGuards
guardRow
buildManualDiagnosticsRefreshGuards
buildManualStatusResyncGuardList
buildRecoveryGuardDisplay
```

Die Karte zeigt lokal berechnete Guard-Ergebnisse fuer:

```text
manual_diagnostics_refresh
manual_status_resync_request
```

## Anzeigeinhalte

Die Karte zeigt:

- GuardSummary
- Anzahl Guards
- OK
- Warnings
- Blocked
- Errors
- Blocking Failed
- Guard-Tabelle mit:
  - Guard
  - Kategorie
  - Status
  - Blocking
  - Severity
  - Quelle
  - Grund

## Fallback

Wenn noch keine Guard-Daten vorhanden sind, zeigt die Karte:

```text
Noch keine Guard-Daten geladen.
```

## Sicherheitsgrenze

Die Umsetzung ist rein lokal im Dashboard.

Weiterhin nicht geaendert:

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

## Syntax-Test

Bestanden:

```cmd
node -c htdocs\dashboard\modules\bus_diagnostics.js
```

## Testgrenze

Nach dem Entpacken pruefen:

1. Dashboard oeffnen:
   ```text
   Event-Bus / Communication Bus -> Recovery -> Preflight
   ```
2. Karte `Recovery Guards` ist sichtbar.
3. Ohne Klick zeigt sie robuste Fallback-Anzeige.
4. Nach `Preflight neu laden` oder `Status neu synchronisieren` erscheinen lokale Guard-Zeilen.
5. Keine Recovery-/Prepare-/Execute-/Simulation-Buttons erscheinen.

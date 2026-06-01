# CAN-10.2 - Manual Diagnostics Refresh Dashboard Button

## Zweck

CAN-10.2 setzt den ersten harmlosen manuellen Diagnose-Refresh im Dashboard um.

Diese Funktion ist keine Recovery-Ausfuehrung. Sie ist ein reiner read-only Refresh der bereits vorhandenen Diagnose-/Preflight-Daten.

## Geaendert

```text
htdocs/dashboard/modules/bus_diagnostics.js
```

## Umsetzung

Im Recovery-Tab unter `Preflight` wurde eine neue Karte ergaenzt:

```text
Manueller Diagnose-Refresh
```

Darin befindet sich ein Button:

```text
Preflight neu laden
```

Der Button fuehrt intern nur `manual_diagnostics_refresh` aus.

## Technische Wirkung

Der Button nutzt die bereits vorhandene Dashboard-Ladelogik und ruft nur bestehende read-only GET-Daten neu ab:

```text
GET /api/bus-diagnostics/status
GET /api/bus-diagnostics/recovery-preflight
```

Dabei werden die Preflight-Karten neu gerendert:

- Recovery-Preflight
- Preflight-Safety
- Preflight-Route-Kontext
- Preflight-Route-Safety
- Preflight-Check-Matrix
- Preflight-Scope
- Preflight-Blocker
- Preflight-Warnungen
- Preflight-Checks
- Hart blockierte Preflight-Aktionen

## Sicherheitsgrenze

Der Button ist bewusst kein Recovery-Button.

Weiterhin nicht vorhanden und nicht erlaubt:

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
- kein Auto-Retry
- kein Timer
- keine Streamer.bot-Aktion
- kein OBS-Befehl

## UI-State

Der Dashboard-Button zeigt lokal:

- Action: `manual_diagnostics_refresh`
- Route: `GET recovery-preflight`
- Letzter Refresh
- Produktiv: nein
- Prepare: nein
- Execute: nein

Bei Fehler wird nur eine lokale UI-Fehlermeldung angezeigt.

## Tests

Syntax-Test:

```cmd
node -c htdocs\dashboard\modules\bus_diagnostics.js
```

Live-Test:

1. Dashboard oeffnen.
2. `Event-Bus / Communication Bus -> Recovery -> Preflight` oeffnen.
3. Karte `Manueller Diagnose-Refresh` pruefen.
4. Button `Preflight neu laden` klicken.
5. Erwartung:
   - Daten werden neu geladen.
   - Letzter Refresh wird aktualisiert.
   - Keine Recovery-/Execute-/Prepare-Buttons erscheinen.
   - Route-Safety bleibt GET/read-only.

## Nicht geaendert

- Keine Backend-Datei geaendert
- Keine API-Route hinzugefuegt
- Keine Config geaendert
- Keine DB geaendert
- Keine Recovery ausgefuehrt
- Keine produktive Flow-Aenderung

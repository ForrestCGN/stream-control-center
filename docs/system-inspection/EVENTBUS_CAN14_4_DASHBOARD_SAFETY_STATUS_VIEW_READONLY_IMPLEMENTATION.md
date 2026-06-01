# EVENTBUS CAN-14.4 - Dashboard Safety Status View read-only Implementation

## Projekt

ForrestCGN `stream-control-center`

## Stand

CAN-14.4

## Zweck

CAN-14.4 setzt die geplante Dashboard Safety Status Anzeige als read-only Dashboard-Erweiterung um.

Wichtig:

```text
Keine Backend-Aenderung.
Keine neue API.
Keine neue Route.
Keine DB-Migration.
Keine Config-Aenderung.
Keine Recovery-Ausfuehrung.
Keine Queue-, Sound-, Alert- oder Overlay-Mutation.
```

## Geaenderte Datei

```text
htdocs/dashboard/modules/bus_diagnostics.js
```

## Was umgesetzt wurde

Im bestehenden Recovery-Tab wurde ein neuer Subtab ergaenzt:

```text
Safety Status
```

Die Anzeige baut lokal aus bereits vorhandenen geladenen Daten ein Safety-Status-Modell.

Genutzte vorhandene Datenquellen:

```text
state.lastData
getRecoveryPreflightRoute()
getEffectiveRecoveryPreflight()
getEffectiveRecoveryPreflightSummary()
```

Es wird keine neue API aufgerufen.

## Neue interne Dashboard-Funktionen

Ergaenzt wurden lokale Helper:

```text
uniqueStrings()
safetyLevelLabel()
safetyBoolText()
safetyRow()
hardBlockedActionLabel()
buildSafetyStatusModel()
renderSafetyStatusView()
```

## Anzeigeumfang

Die neue Karte zeigt:

```text
Safety Status Gesamt
Recovery-Ausfuehrung
Routen-Sicherheit
Guards / Preflight
Sicherheitsbausteine
Harte Blocker
Hinweis
```

## False-/Unknown-/Blocked-Bedeutung

Die Anzeige unterscheidet bewusst:

```text
false bei canExecute/recoveryExecution/executeRoute = sicher
false bei auditReady/rightsReady/confirmReady = noch nicht aktiv / geplant
blocked bei harten Blockern = bewusst blockiert / gewollt
```

## Hart blockierte Aktionen

Die Anzeige enthaelt mindestens diese bewusst blockierten Aktionen:

```text
alert_replay
sound_replay
queue_state_clear
overlay_state_repair
execute_recovery
auto_recovery
auto_retry_overlay
streamerbot_action_retry
obs_source_refresh
```

## Keine Buttons

Die neue Safety-Status-Anzeige enthaelt bewusst keine Buttons.

Nicht enthalten:

```text
kein Recovery starten
kein Recovery vorbereiten
kein SafetyStop setzen
kein SafetyStop clearen
kein Cancel
kein Alert Replay
kein Sound Replay
kein Queue Clear
kein Overlay Repair
kein OBS Refresh
kein Streamer.bot Retry
```

## Nicht geaendert

```text
backend/modules/bus_diagnostics.js
backend/modules/communication_bus.js
keine Backend-Version
keine Route
keine API
keine DB
keine Config
keine produktiven Flows
```

## Test

Durchgefuehrt:

```text
node -c htdocs/dashboard/modules/bus_diagnostics.js
```

Ergebnis:

```text
OK
```

## Manueller Test nach Einspielen

```text
Dashboard oeffnen
Event-Bus / Communication Bus oeffnen
Recovery-Tab oeffnen
Subtab "Safety Status" oeffnen
Pruefen: keine produktiven Buttons sichtbar
Pruefen: Hard-Blocker sind sichtbar
Pruefen: bestehende Recovery-Subtabs funktionieren weiter
```

## Sicherheitsstand

Weiterhin:

```text
canPrepare: false
canExecute: false
readOnly: true
commandRoute: false
prepareRoute: false
executeRoute: false
recoveryExecution: false
```

## Naechster sinnvoller Schritt

```text
CAN-14.5 - Dashboard Safety Status View Live-Test read-only
```

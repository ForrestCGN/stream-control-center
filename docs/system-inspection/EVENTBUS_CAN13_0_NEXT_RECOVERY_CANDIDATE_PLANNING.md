# EVENTBUS CAN-13.0 - Next Recovery Candidate Planning Start

## Projekt

ForrestCGN `stream-control-center`

Arbeitsbereich:

```text
Event-Bus / Communication Bus -> Recovery -> Candidate Planning
```

## Ausgangsstand

CAN-12.6 ist abgeschlossen.

Der Recovery-/Preflight-/Guard-Framework-Strang ist weiterhin rein read-only abgeschlossen.

Aktueller Sicherheitsstand:

```text
canPrepare: false
canExecute: false
readOnly: true
routeSafety.method: GET
commandRoute: false
prepareRoute: false
executeRoute: false
recoveryExecution: false
```

Aktueller Live-Test-Stand Recovery Guards:

```text
Guards: 16
OK: 16
Warnings: 0
Blocked: 0
Errors: 0
Blocking Failed: 0
```

## Ziel von CAN-13.0

CAN-13.0 startet die Planung des naechsten Recovery-Kandidaten.

Wichtig:

```text
CAN-13.0 fuehrt keine Recovery aus.
CAN-13.0 erstellt keine Recovery-API.
CAN-13.0 erstellt keine Prepare-/Execute-Route.
CAN-13.0 veraendert keine produktiven Flows.
CAN-13.0 veraendert keine Queue-, Sound-, Alert-, Overlay-, OBS- oder Streamer.bot-Zustaende.
```

CAN-13.0 legt nur fest, welche Sicherheitsbereiche vor jeder spaeteren manuellen Recovery zuerst geplant werden muessen.

## Entscheidung fuer die Reihenfolge

Direkt mit Alert Replay, Sound Replay, Queue Clear, Overlay State Repair oder Execute Recovery zu starten waere zu riskant.

Deshalb wird CAN-13.x zuerst als Sicherheits- und Entscheidungsstrang geplant.

Empfohlene Reihenfolge:

```text
CAN-13.0  Next Recovery Candidate Planning Start
CAN-13.1  Audit-Konzept fuer spaetere manuelle Recovery
CAN-13.2  Rollen-/Rechte-Konzept
CAN-13.3  Confirm-/Bestaetigungs-Konzept
CAN-13.4  SafetyStop-/Cancel-Konzept
CAN-13.5  Recovery-Kandidatenmatrix
CAN-13.6  Abschluss/Handoff, weiterhin ohne produktive Recovery
```

## Sicherheitsbereiche vor produktiver Recovery

### 1. Audit-Konzept

Jede spaetere manuelle Recovery-Aktion muss nachvollziehbar protokolliert werden.

Pflichtinformationen:

```text
Zeitpunkt
User / Actor
Rolle / Berechtigung
Aktion
Zielmodul
Recovery-Kandidat
Vorheriger Status
Ausgeloeste Schutzpruefungen
Ergebnis
Fehlergrund bei Abbruch
```

CAN-13.1 soll nur das Audit-Konzept planen. Noch keine produktive Recovery-Aktion.

### 2. Rollen-/Rechte-Konzept

Spaetere manuelle Recovery-Aktionen duerfen nicht offen im Dashboard verfuegbar sein.

Mindestanforderung:

```text
Owner/Admin-Rechte erforderlich
keine Gast-/Viewer-/Mod-only-Ausfuehrung
Dashboard muss Rechte sichtbar auswerten
Backend muss Rechte serverseitig pruefen
```

CAN-13.2 soll nur das Rollen-/Rechte-Konzept planen. Noch keine produktive Recovery-Aktion.

### 3. Confirm-/Bestaetigungs-Konzept

Gefaehrliche Aktionen brauchen eine eindeutige manuelle Bestaetigung.

Mindestanforderung:

```text
klarer Confirm-Dialog
sichtbarer Aktionstyp
sichtbarer Zielbereich
sichtbare Warnung, wenn produktive Daten betroffen waeren
keine Ein-Klick-Recovery
keine versteckten Testbuttons
```

CAN-13.3 soll nur das Confirm-Konzept planen. Noch keine produktive Recovery-Aktion.

### 4. SafetyStop-/Cancel-Konzept

Es muss eine zentrale Sicherheitsbremse geben, bevor spaeter Recovery-Aktionen diskutiert werden.

Mindestanforderung:

```text
Recovery global deaktivierbar
Recovery pro Kandidat deaktivierbar
laufende Aktion abbrechbar, falls technisch moeglich
keine Auto-Recovery gegen SafetyStop
klarer Status im Dashboard
```

CAN-13.4 soll nur das SafetyStop-/Cancel-Konzept planen. Noch keine produktive Recovery-Aktion.

### 5. Recovery-Kandidatenmatrix

Erst nach Audit, Rollen/Rechte, Confirm und SafetyStop soll entschieden werden, welche Kandidaten ueberhaupt weiter geplant werden duerfen.

Matrix-Felder:

```text
Kandidat
Zielmodul
Beschreibung
Risiko
Darf read-only bleiben
Darf spaeter manuell vorbereitet werden
Darf spaeter manuell ausgefuehrt werden
Hart blockierte Aktion
Erforderliche Rolle
Erforderlicher Confirm
Audit-Pflicht
Duplikat-Sperre
SafetyStop-Regel
Rollback-/Clear-Regel
Testart
```

CAN-13.5 soll nur die Kandidatenmatrix definieren. Noch keine produktive Recovery-Aktion.

## Weiterhin hart blockiert

Diese Aktionen bleiben nach CAN-13.0 weiterhin blockiert:

```text
auto_recovery
auto_replay_alert
manual_replay_alert
auto_replay_sound
manual_replay_sound
auto_retry_overlay
manual_execute_recovery
queue_clear
sound_mutation
alert_mutation
overlay_mutation
obs_action
streamerbot_action
db_write
config_write
```

## Erlaubt in CAN-13.x

Erlaubt sind nur:

```text
Doku
Planung
Sicherheitsmatrix
Rechte-/Audit-/Confirm-/SafetyStop-Konzept
read-only Statusanalyse
read-only technische Pruefung
```

## Nicht erlaubt in CAN-13.x ohne separaten neuen go-Step

Nicht erlaubt:

```text
POST-Route
Command-Route
Prepare-Route
Execute-Route
Recovery-Button
Simulation-Button mit produktiver Wirkung
Queue-Aenderung
Sound-Aenderung
Alert-Aenderung
Overlay-Aenderung
OBS-Aktion
Streamer.bot-Aktion
DB-Schreibzugriff
Config-Schreibzugriff
Auto-Recovery
Replay
Retry
```

## Ergebnis von CAN-13.0

CAN-13.0 entscheidet:

```text
Der naechste sinnvolle Schritt ist nicht produktive Recovery.
Der naechste sinnvolle Schritt ist CAN-13.1 Audit-Konzept.
```

CAN-13.0 ist ein reiner Doku-/Planungsstand.

## Tests

Da CAN-13.0 keine JS-Dateien aendert:

```text
Keine node -c Tests erforderlich.
Keine API-Tests erforderlich.
Keine Dashboard-Livetests erforderlich.
```

Pruefung:

```text
Doku-Datei vorhanden
CURRENT_STATUS aktualisiert
NEXT_STEPS aktualisiert
TODO aktualisiert
CHANGELOG aktualisiert
FILES aktualisiert
Handoff-Datei fuer naechsten Chat vorhanden
Keine Code-Dateien enthalten
```

# EVENTBUS CAN-13.2 - Rollen-/Rechte-Konzept fuer spaetere manuelle Recovery

## Projekt

ForrestCGN `stream-control-center`

Arbeitsbereich:

```text
Event-Bus / Communication Bus -> Recovery -> Roles/Rights Planning
```

## Ausgangsstand

CAN-13.1 ist abgeschlossen.

CAN-13.1 hat das Audit-Konzept fuer spaetere manuelle Recovery-Aktionen geplant.

CAN-13.2 baut darauf auf und definiert nur das Rollen-/Rechte-Konzept.

Geplante CAN-13.x Reihenfolge:

```text
CAN-13.2 Rollen-/Rechte-Konzept fuer spaetere manuelle Recovery
CAN-13.3 Confirm-/Bestaetigungs-Konzept
CAN-13.4 SafetyStop-/Cancel-Konzept
CAN-13.5 Recovery-Kandidatenmatrix
CAN-13.6 Abschluss/Handoff, weiterhin ohne produktive Recovery
```

## Ziel von CAN-13.2

CAN-13.2 definiert, welche Rollen spaeter welche Recovery-nahen Informationen sehen oder Aktionen anfordern duerfen.

Wichtig:

```text
CAN-13.2 fuehrt keine Recovery aus.
CAN-13.2 erstellt keine Recovery-API.
CAN-13.2 erstellt keine POST-/Command-/Prepare-/Execute-Route.
CAN-13.2 erstellt keine Rechte-API.
CAN-13.2 erstellt keine DB-Migration.
CAN-13.2 schreibt keine Audit-Eintraege.
CAN-13.2 veraendert keine produktiven Flows.
CAN-13.2 veraendert keine Queue-, Sound-, Alert-, Overlay-, OBS- oder Streamer.bot-Zustaende.
```

CAN-13.2 ist nur ein Planungs- und Vertragsstand.

## Grundsatz

Dashboard-Sichtbarkeit ist niemals eine Berechtigung.

Jede spaetere manuelle Recovery-Aktion muss serverseitig geprueft werden.

Das bedeutet:

```text
Frontend darf nur anzeigen.
Backend muss entscheiden.
Audit muss jede Ablehnung und jede Erlaubnis nachvollziehbar machen.
Guards bleiben zusaetzlich Pflicht.
Confirm bleibt zusaetzlich Pflicht.
SafetyStop bleibt zusaetzlich Pflicht.
```

## Geplante Rollen

### Viewer

Darf spaeter nur lesen.

Erlaubt:

```text
read-only Diagnose sehen
Recovery-Status sehen
Guard-Status sehen
Preflight-Status sehen
```

Nicht erlaubt:

```text
Recovery vorbereiten
Recovery ausfuehren
SafetyStop aendern
Kandidaten freigeben
Audit-Konfiguration aendern
```

### Moderator

Darf spaeter maximal erweiterte Diagnose sehen, falls explizit freigegeben.

Erlaubt nach Planung:

```text
read-only Diagnose sehen
Status-Hinweise sehen
eventuelle blockierte Recovery-Kandidaten erkennen
```

Nicht erlaubt:

```text
Recovery vorbereiten
Recovery ausfuehren
Replay/Clear/Repair anfordern
SafetyStop aendern
Confirm fuer Recovery bestaetigen
```

### Admin

Darf spaeter nur vorbereitende Recovery-Pruefungen anfordern, wenn alle Konzepte umgesetzt und freigegeben wurden.

Moeglich nach spaeterer Freigabe:

```text
Recovery Prepare anfordern
Guard-/Preflight-Decision ausloesen
Denied-/Blocked-Status mit Audit erzeugen
```

Nicht automatisch erlaubt:

```text
Recovery Execute
Alert Replay
Sound Replay
Queue Clear
Overlay State Repair
Auto-Recovery
```

### Owner

Einzige Rolle, die spaeter fuer Execute-nahe Aktionen ueberhaupt in Betracht kommt.

Moeglich erst nach separater Planung:

```text
manuelle Recovery-Ausfuehrung bestaetigen
SafetyStop kontrollieren
hochriskante Aktionen explizit freigeben
```

Weiterhin nur mit:

```text
Backend-Rechtepruefung
Confirm
Audit Request / Decision / Result
aktive Guards
Duplikat-Sperre
SafetyStop-Pruefung
Rollback-/Clear-Regel
```

### System

Systemaktionen duerfen spaeter nur read-only Diagnose oder technische Statusmeldungen erzeugen.

Nicht erlaubt:

```text
Auto-Recovery
Auto-Replay
Auto-Clear
Auto-Repair
stille produktive Mutation
```

Wenn spaeter eine systemnahe Aktion geplant wird, muss sie gesondert dokumentiert und auditiert werden.

## Rechte-Matrix fuer CAN-13.2

Diese Matrix ist Planung, keine Implementierung.

| Aktion | Viewer | Moderator | Admin | Owner | System |
|---|---:|---:|---:|---:|---:|
| Recovery-Diagnose sehen | ja | ja | ja | ja | ja |
| Recovery Guards sehen | ja | ja | ja | ja | ja |
| Preflight neu laden | ja, read-only | ja, read-only | ja, read-only | ja, read-only | ja, read-only |
| Status neu synchronisieren | ja, lokal/read-only | ja, lokal/read-only | ja, lokal/read-only | ja, lokal/read-only | ja, lokal/read-only |
| Recovery Prepare anfordern | nein | nein | spaeter moeglich | spaeter moeglich | nein |
| Recovery Execute anfordern | nein | nein | nein | spaeter separat pruefen | nein |
| Alert Replay | nein | nein | nein | hart blockiert bis separat geplant | nein |
| Sound Replay | nein | nein | nein | hart blockiert bis separat geplant | nein |
| Queue Clear | nein | nein | nein | hart blockiert bis separat geplant | nein |
| Overlay State Repair | nein | nein | nein | hart blockiert bis separat geplant | nein |
| Auto-Recovery | nein | nein | nein | nein | nein |
| SafetyStop aendern | nein | nein | nein | spaeter separat pruefen | nein |

## Backend-Pflichtpruefung

Wenn spaeter Rechte umgesetzt werden, muss das Backend mindestens pruefen:

```text
actor vorhanden?
actor authentifiziert?
actor Rolle bekannt?
actor Rolle fuer requestedOperation erlaubt?
requestedOperation als Recovery-Kandidat zugelassen?
routeMethod erlaubt?
routePath erlaubt?
readOnly/execute Grenze eingehalten?
SafetyStop Zustand erlaubt Aktion?
Confirm Zustand vorhanden?
Guards OK?
Duplikat-Sperre aktiv?
Audit Request vorhanden?
Audit Decision geschrieben?
```

Wenn eine Pruefung fehlschlaegt, muss die Aktion blockiert werden.

## Dashboard-Grenzen

Das Dashboard darf spaeter nur UI-Hinweise und Controls passend zur Rolle anzeigen.

Aber:

```text
Ausgeblendeter Button ist keine Sicherheit.
Sichtbarer Button ist keine Berechtigung.
Jede Aktion muss serverseitig erneut geprueft werden.
```

Dashboard darf fuer nicht berechtigte Rollen spaeter anzeigen:

```text
read-only Hinweis
fehlende Berechtigung
blocked/denied Grund
naechste notwendige Rolle
```

Dashboard darf nicht:

```text
Execute-Aktionen clientseitig allein freigeben
Confirm clientseitig als alleinige Sicherheit behandeln
SafetyStop umgehen
produktive Recovery-Buttons ohne Backend-Schutz anzeigen
```

## Denied-/Blocked-Audit-Bezug

CAN-13.1 hat Audit-Stufen definiert.

CAN-13.2 legt fest:

Jede spaetere Rechte-Ablehnung muss mindestens als Decision Audit abbildbar sein.

Beispiele:

```text
denied_missing_actor
denied_unknown_role
denied_insufficient_role
denied_operation_not_allowed_for_role
blocked_operation_globally_forbidden
blocked_safety_stop_active
blocked_missing_confirm
blocked_guard_failed
blocked_duplicate_protection
```

Wichtig:

```text
Auch blockierte Aktionen muessen nachvollziehbar sein.
Keine stillen Drops bei sicherheitsrelevanten Recovery-Anfragen.
```

## Harte Blocker bleiben unveraendert

Auch Owner darf in CAN-13.2 nichts ausfuehren.

Weiterhin hart blockiert:

```text
Alert Replay
Sound Replay
Queue Clear
Overlay State Repair
Execute Recovery
Auto-Recovery
POST-/Command-/Prepare-/Execute-Routen
produktive Dashboard-Recovery-Buttons
Rechte-API
DB-Migration
Config-Schreibzugriff
```

## Offene Punkte fuer spaetere Umsetzung

Vor einer echten Implementierung muessen separat geplant werden:

```text
Woher kommen Rollen technisch?
Gibt es bestehende Dashboard-Auth?
Wie werden Owner/Admin/Moderator/Viewer gespeichert?
Wie wird ein fehlender Login behandelt?
Wie wird eine lokale Entwicklung ohne Login abgesichert?
Wie wird Audit mit Rolleninformationen verbunden?
Wie werden Secrets/Userdaten vermieden?
Welche Tests pruefen Rechteverweigerung?
```

## Tests fuer CAN-13.2

Da CAN-13.2 keine Code-Dateien aendert:

```text
Kein node -c erforderlich.
Keine API-Tests erforderlich.
Keine DB-Tests erforderlich.
```

Zu pruefen nach Einspielen:

```text
Doku-Datei vorhanden
CURRENT_STATUS auf CAN-13.2 aktualisiert
NEXT_STEPS zeigt CAN-13.3 als naechsten Schritt
TODO markiert CAN-13.2 erledigt
CHANGELOG enthaelt CAN-13.2
FILES listet CAN-13.2 ZIP-Dateien
```

## Ergebnis

CAN-13.2 legt den Rollen-/Rechte-Rahmen fuer spaetere manuelle Recovery fest.

Der naechste sinnvolle Schritt ist:

```text
CAN-13.3 - Confirm-/Bestaetigungs-Konzept fuer spaetere manuelle Recovery
```

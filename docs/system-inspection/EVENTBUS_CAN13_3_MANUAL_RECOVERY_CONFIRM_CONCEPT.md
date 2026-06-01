# EVENTBUS CAN-13.3 - Confirm-/Bestaetigungs-Konzept fuer spaetere manuelle Recovery

## Projekt

ForrestCGN `stream-control-center`

Arbeitsbereich:

```text
Event-Bus / Communication Bus -> Recovery -> Confirm Planning
```

## Ausgangsstand

CAN-13.2 ist abgeschlossen.

CAN-13.1 hat das Audit-Konzept fuer spaetere manuelle Recovery-Aktionen geplant.

CAN-13.2 hat das Rollen-/Rechte-Konzept fuer spaetere manuelle Recovery-Aktionen geplant.

CAN-13.3 baut darauf auf und definiert nur das Confirm-/Bestaetigungs-Konzept.

Geplante CAN-13.x Reihenfolge:

```text
CAN-13.3 Confirm-/Bestaetigungs-Konzept fuer spaetere manuelle Recovery
CAN-13.4 SafetyStop-/Cancel-Konzept
CAN-13.5 Recovery-Kandidatenmatrix
CAN-13.6 Abschluss/Handoff, weiterhin ohne produktive Recovery
```

## Ziel von CAN-13.3

CAN-13.3 definiert, wie spaetere manuelle Recovery-Aktionen bestaetigt werden muessen, bevor sie ueberhaupt fuer eine Ausfuehrung in Frage kommen.

Wichtig:

```text
CAN-13.3 fuehrt keine Recovery aus.
CAN-13.3 erstellt keine Recovery-API.
CAN-13.3 erstellt keine POST-/Command-/Prepare-/Execute-Route.
CAN-13.3 erstellt keine Confirm-API.
CAN-13.3 erstellt keine Confirm-DB-Migration.
CAN-13.3 schreibt keine Audit-Eintraege.
CAN-13.3 veraendert keine produktiven Flows.
CAN-13.3 veraendert keine Queue-, Sound-, Alert-, Overlay-, OBS- oder Streamer.bot-Zustaende.
```

CAN-13.3 ist nur ein Planungs- und Vertragsstand.

## Grundsatz

Confirm ist eine zusaetzliche Sicherheitsschicht, aber keine Berechtigung.

Das bedeutet:

```text
Confirm ersetzt keine Backend-Rechtepruefung.
Confirm ersetzt keine Audit-Pflicht.
Confirm ersetzt keine Guards.
Confirm ersetzt keinen SafetyStop.
Confirm ersetzt keine Duplikat-Sperre.
Confirm ersetzt keine Kandidatenfreigabe.
```

Eine spaetere manuelle Recovery-Aktion darf nur dann in Richtung Ausfuehrung gehen, wenn alle Schutzschichten passen.

Mindestkette fuer spaeter:

```text
Request -> Rollen/Rechte-Pruefung -> Guard-/Preflight-Pruefung -> Confirm -> SafetyStop-Pruefung -> Audit Decision -> ggf. Execute -> Audit Result
```

Die exakte Execute-Umsetzung bleibt weiterhin blockiert und ist nicht Teil von CAN-13.3.

## Confirm-Arten

Diese Confirm-Arten sind als Planung definiert.

### Info Confirm

Niedrigste Stufe.

Zweck:

```text
Benutzer bestaetigt, dass er einen read-only Diagnosezustand verstanden hat.
```

Beispiele:

```text
Diagnose erneut laden
lokalen Dashboard-Status neu synchronisieren
Recovery Guards erneut anzeigen
```

Aktuell sind diese Aktionen bereits read-only. Ein Confirm ist dafuer spaeter optional und darf keine produktive Wirkung bekommen.

### Risk Confirm

Mittlere Stufe.

Zweck:

```text
Benutzer bestaetigt, dass eine spaetere manuelle Aktion potenziell produktive Auswirkungen haben koennte.
```

Moegliche spaetere Beispiele:

```text
Recovery Prepare anfordern
Kandidatenentscheidung erzeugen
blocked/denied Status mit Audit schreiben
```

Risk Confirm reicht nicht fuer Execute-nahe Aktionen.

### Destructive Confirm

Hohe Stufe.

Zweck:

```text
Benutzer bestaetigt, dass eine spaetere Aktion Daten, Queues, Sounds, Alerts oder Overlay-Zustaende veraendern koennte.
```

Diese Stufe ist fuer CAN-13.3 nur geplant und bleibt ohne Umsetzung.

Weiterhin hart blockiert:

```text
Alert Replay
Sound Replay
Queue Clear
Overlay State Repair
Execute Recovery
Auto-Recovery
```

### Typed Confirm

Zusaetzliche harte Stufe fuer spaetere Hochrisiko-Aktionen.

Zweck:

```text
Benutzer muss einen eindeutigen Text eintippen, z. B. den Aktionsnamen oder eine kurze Sicherheitsphrase.
```

Typed Confirm darf spaeter nur als zusaetzliche Barriere gelten, nicht als alleinige Freigabe.

## Confirm-Pflicht nach Aktionsklasse

Diese Matrix ist Planung, keine Implementierung.

| Aktionsklasse | Confirm-Stufe | Status CAN-13.3 |
|---|---|---|
| read-only Diagnose anzeigen | kein Confirm oder Info Confirm | erlaubt, bereits read-only |
| Preflight neu laden | kein Confirm oder Info Confirm | erlaubt, GET/read-only |
| Status neu synchronisieren | kein Confirm oder Info Confirm | erlaubt, lokal/read-only |
| Recovery Prepare anfordern | Risk Confirm | spaeter moeglich, aktuell nicht umgesetzt |
| Recovery Decision erzeugen | Risk Confirm | spaeter moeglich, aktuell nicht umgesetzt |
| Recovery Execute anfordern | Destructive + Typed Confirm | hart blockiert |
| Alert Replay | Destructive + Typed Confirm | hart blockiert |
| Sound Replay | Destructive + Typed Confirm | hart blockiert |
| Queue Clear | Destructive + Typed Confirm | hart blockiert |
| Overlay State Repair | Destructive + Typed Confirm | hart blockiert |
| Auto-Recovery | nicht per Confirm freischaltbar | hart blockiert |

## Confirm-Inhalt

Ein spaeterer Confirm muss eindeutig anzeigen:

```text
operationId
operationLabel
riskLevel
actor
requiredRole
currentRole
betroffener Bereich
moegliche Wirkung
was nicht garantiert wird
welche Guards relevant sind
ob SafetyStop aktiv ist
ob Duplikat-Sperren relevant sind
Zeitpunkt der Anfrage
Ablaufzeit des Confirms
```

Confirm-Texte muessen klar und unmissverstaendlich sein.

Nicht erlaubt:

```text
verharmlosende Texte
unklare Sammelbestaetigungen
Confirm ohne konkrete Aktion
Confirm ohne Risikoanzeige
Confirm ohne Ablaufzeit
Confirm ohne Audit-Bezug
```

## Confirm-Gueltigkeit

Ein spaeterer Confirm darf nur kurz gueltig sein.

Planungsregel:

```text
Confirm ist aktionsbezogen.
Confirm ist actor-bezogen.
Confirm ist operationId-bezogen.
Confirm ist requestId-bezogen.
Confirm ist zeitlich begrenzt.
Confirm ist nicht wiederverwendbar.
```

Vorschlag fuer spaetere TTL:

| Confirm-Stufe | Gueltigkeit |
|---|---:|
| Info Confirm | 60 Sekunden |
| Risk Confirm | 30 Sekunden |
| Destructive Confirm | 15 Sekunden |
| Typed Confirm | 15 Sekunden |

Diese Werte sind Planungswerte und noch keine Config.

## Confirm und Audit

CAN-13.1 hat Audit-Stufen definiert:

```text
Request
Decision
Result
```

CAN-13.3 legt fest:

```text
Confirm muss spaeter mit Audit Request verknuepft sein.
Confirm-Ergebnis muss in Audit Decision abbildbar sein.
Abgelaufener Confirm muss als blocked/denied abbildbar sein.
Abgebrochener Confirm muss als cancelled abbildbar sein.
Fehlender Confirm muss als blocked_missing_confirm abbildbar sein.
```

Moegliche spaetere Audit-Entscheidungen:

```text
confirmed_info
confirmed_risk
confirmed_destructive
confirmed_typed
blocked_missing_confirm
blocked_confirm_expired
blocked_confirm_actor_mismatch
blocked_confirm_operation_mismatch
blocked_confirm_request_mismatch
cancelled_by_actor
```

## Confirm und Rollen/Rechte

CAN-13.2 hat festgelegt:

```text
Dashboard-Sichtbarkeit ist keine Berechtigung.
Backend muss Rechte serverseitig pruefen.
```

CAN-13.3 ergaenzt:

```text
Confirm darf nur nach erfolgreicher Rollen-/Rechte-Vorpruefung angeboten werden.
Confirm darf keine fehlende Rolle ueberstimmen.
Confirm darf keine Backend-Ablehnung entschaerfen.
Confirm darf keine Operation aus einer falschen Rolle freischalten.
```

Beispiel:

```text
Moderator sieht Diagnose.
Moderator darf keinen Risk Confirm fuer Recovery Prepare bekommen.
Owner kann spaeter fuer Hochrisiko-Aktionen in Frage kommen, aber nur mit weiteren Schutzschichten.
```

## Confirm und Guards

Confirm darf Guards nicht ersetzen.

Wenn ein Guard fehlschlaegt:

```text
Confirm darf nicht angeboten werden oder muss wirkungslos bleiben.
Aktion bleibt blocked_guard_failed.
Audit Decision muss den Guard-Grund enthalten.
```

Wenn Confirm vor Guard berechnet wird, muss die finale Guard-Pruefung trotzdem direkt vor einer spaeteren Aktion erneut stattfinden.

## Confirm und SafetyStop

CAN-13.4 wird SafetyStop-/Cancel-Konzept planen.

CAN-13.3 legt bereits fest:

```text
Confirm darf SafetyStop nicht umgehen.
SafetyStop muss spaeter Vorrang vor Confirm haben.
Aktiver SafetyStop blockiert auch bestaetigte Aktionen.
```

## Confirm und Duplikat-Sperre

Keine Wiederholung von Alerts/Sounds ohne harte Duplikat-Sperre.

CAN-13.3 legt fest:

```text
Confirm darf keine Duplikat-Sperre ersetzen.
Confirm darf kein Replay freischalten, solange Replay hart blockiert ist.
Confirm darf nicht fuer mehrere gleiche Aktionen recycelt werden.
```

## Dashboard-Grenzen

Dashboard darf spaeter einen Confirm-Dialog anzeigen.

Aber:

```text
Frontend-Confirm ist keine Sicherheit.
Backend muss Confirm-Token/Request pruefen.
Backend muss actor/operation/request/TTL pruefen.
Backend muss Rechte/Guards/SafetyStop danach erneut pruefen.
```

Dashboard darf nicht:

```text
produktive Aktion nur durch Buttonklick ausfuehren
Confirm rein clientseitig speichern
Confirm ohne Audit-Bezug anzeigen
Confirm ohne Risiko anzeigen
Confirm fuer hart blockierte Aktionen als nutzbar darstellen
```

## Harte Blocker bleiben unveraendert

Auch mit Confirm bleibt in CAN-13.3 alles produktive blockiert.

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
Confirm-API
Confirm-DB-Migration
Recovery-Action
DB-/Config-Schreibzugriff
```

## Offene Punkte fuer spaetere Umsetzung

Vor einer echten Implementierung muessen separat geplant werden:

```text
Wo wird Confirm technisch gespeichert?
Wird ein Confirm-Token gebraucht?
Wie wird TTL serverseitig geprueft?
Wie wird actor gebunden?
Wie wird operationId gebunden?
Wie wird requestId gebunden?
Wie wird Confirm im Audit gespeichert?
Wie wird ein Confirm abgebrochen?
Wie werden Confirm-Texte konfiguriert?
Wie wird verhindert, dass Confirm bei Reload/Refresh versehentlich weiter gilt?
Welche Tests pruefen Missing/Expired/Mismatch/Cancelled?
```

## Tests fuer CAN-13.3

Da CAN-13.3 keine Code-Dateien aendert:

```text
Kein node -c erforderlich.
Keine API-Tests erforderlich.
Keine DB-Tests erforderlich.
```

Zu pruefen nach Einspielen:

```text
Doku-Datei vorhanden
CURRENT_STATUS auf CAN-13.3 aktualisiert
NEXT_STEPS zeigt CAN-13.4 als naechsten Schritt
TODO markiert CAN-13.3 erledigt
CHANGELOG enthaelt CAN-13.3
FILES listet CAN-13.3 ZIP-Dateien
```

## Ergebnis

CAN-13.3 legt das Confirm-/Bestaetigungs-Konzept fuer spaetere manuelle Recovery fest.

Der naechste sinnvolle Schritt ist:

```text
CAN-13.4 - SafetyStop-/Cancel-Konzept fuer spaetere manuelle Recovery
```

# EVENTBUS CAN-6.1 MANUELLE RECOVERY-AKTIONSMATRIX

Stand: 2026-06-01
Status: Plan / Sicherheitsmatrix / keine Umsetzung
Marker: STEP_CAN6_1_MANUAL_RECOVERY_ACTION_MATRIX

## Zweck

CAN-6.1 definiert nur die Sicherheitsmatrix fuer spaetere manuelle Recovery-Aktionen im Communication-Bus-/Recovery-Diagnose-Strang.

Dieser Step aktiviert keine Recovery-Funktion.

~~~text
Keine Backend-Aenderung
Keine API-Aenderung
Keine Dashboard-Code-Aenderung
Keine Simulation-Buttons
Keine Recovery-Buttons
Keine Recovery-Automatik
Keine produktive Flow-Aenderung
Keine DB-/Config-Migration
~~~

## Ausgangsstand

CAN-5.5 bis CAN-5.10 sind ein stabiler read-only Diagnose-Stand.

CAN-6.0 hat die Sicherheitsgrenzen fuer eine spaetere manuelle Recovery geplant.

CAN-6.1 macht daraus eine konkrete Aktionsmatrix.

Weiterhin hart blockiert:

~~~text
auto_replay_alert
manual_replay_alert
auto_replay_sound
manual_replay_sound
auto_retry_overlay
auto_recovery
~~~

## Grundregeln fuer alle spaeteren manuellen Aktionen

Jede spaeter irgendwann aktivierbare manuelle Recovery-Aktion muss mindestens diese Regeln erfuellen:

~~~text
Owner/Admin-Rechte
Dashboard-Authentifizierung
Bestätigungsdialog
Audit-Log
Anzeige der betroffenen traceId / alertId / eventId / bundleId / soundJobId
Anzeige der geplanten Aktion
Anzeige, ob echte Ausgabe erfolgen wuerde
Duplikat-Sperre passend zum betroffenen System
Safety-Stop pruefen
Rollback-/Clear-Regel definiert
Keine Aktion aus Overlay heraus
Keine oeffentliche Route ohne Auth
~~~

## Aktionsklassen

### Diagnose-only

Der Zustand wird nur angezeigt. Es gibt keine ausloesbare Aktion.

### Review-only

Der Zustand darf spaeter manuell als geprüft/gesichtet markiert werden. Das aendert keine produktive Ausgabe und startet keinen Alert, keinen Sound und kein Overlay neu.

### Recheck-only

Der Zustand darf spaeter einen neuen Statuscheck anfordern. Das liest Status neu ein, startet aber keinen produktiven Flow.

### Clear-stale-only

Der Zustand darf spaeter nur dann bereinigt werden, wenn ein Lock, Wait-State oder Bundle nachweislich veraltet ist. Vorher muessen Alter, aktueller Queue-Zustand und aktiver Flow geprueft werden.

### Hard-blocked

Der Zustand oder die Aktion bleibt blockiert. Keine manuelle Ausfuehrung, kein Replay, kein Retry.

## CAN-6.1 Matrix

| Zustand / Signal | Aktionsklasse | Spaeter eventuell manuell erlaubte Aktion | Hart blockierte Aktionen | Rechte | Audit Pflicht | Duplikat-Sperre | Safety-Stop | Rollback / Clear-Regel |
|---|---|---|---|---|---|---|---|---|
| `missingAck` | Review-only / Recheck-only | `mark_recovery_reviewed`, `request_status_recheck` | `manual_replay_alert`, `manual_replay_sound`, `auto_recovery` | Owner/Admin | Ja | traceId + alertId pruefen | Ja | Nur Review-Marker oder erneute Statusabfrage; kein Replay |
| `noClient` | Recheck-only | `request_status_recheck`, spaeter evtl. `refresh_overlay_state` | `auto_retry_overlay`, `manual_replay_alert`, `manual_replay_sound` | Owner/Admin | Ja | overlay client id / source id pruefen | Ja | Nur Client-/Overlay-State neu pruefen; kein Alert/Sound erneut starten |
| `unmatched` | Review-only | `mark_recovery_reviewed` | `manual_replay_alert`, `manual_replay_sound`, `auto_recovery` | Owner/Admin | Ja | traceId + bundle id + sound job id pruefen | Ja | Nur als geprueft markieren; keine Ausgabe wiederholen |
| `waitingTooLong` | Recheck-only / Clear-stale-only | `request_status_recheck`, spaeter evtl. `clear_stale_visual_wait` | `auto_retry_overlay`, `manual_replay_alert`, `manual_replay_sound` | Owner/Admin | Ja | traceId + visual wait id pruefen | Ja | Wait-State nur loeschen, wenn kein laufender Alert/Sound/Bundle aktiv ist |
| `soundFetchFailed` | Review-only / Recheck-only | `mark_recovery_reviewed`, `request_status_recheck` | `manual_replay_sound`, `manual_replay_alert`, `auto_recovery` | Owner/Admin | Ja | sound key + sound job id pruefen | Ja | Keine Sound-Wiederholung; nur Fehlerstatus pruefen/markieren |
| `bundle_wait_timeout` | Clear-stale-only | spaeter evtl. `manual_unlock_stale_bundle` | `manual_replay_alert`, `manual_replay_sound`, `auto_recovery` | Owner/Admin | Ja | bundle id + activeBundleLock + queue state pruefen | Ja | Bundle-Lock nur loeschen, wenn veraltet und kein produktiver Flow aktiv ist |
| `overlay_watchdog_issue` | Recheck-only | `request_status_recheck`, spaeter evtl. `refresh_overlay_state` | `auto_retry_overlay`, `manual_replay_alert`, `manual_replay_sound` | Owner/Admin | Ja | overlay source id + client heartbeat pruefen | Ja | Nur Overlay-Status/Heartbeat aktualisieren; kein produktiver Retry |
| unbekannter Recovery-State | Hard-blocked | keine | alle produktiven Recovery-Aktionen | Owner/Admin fuer Sichtung | Ja bei Review | nicht anwendbar | Ja | Nur dokumentieren; keine Ausfuehrung |

## Spaeter eventuell erlaubte Aktionen und Bedingungen

| Aktion | Zweck | Erlaubnis in CAN-6.1 | Mindestschutz vor spaeterer Umsetzung |
|---|---|---|---|
| `mark_recovery_reviewed` | Diagnoseeintrag als geprueft markieren | Nur geplant | Owner/Admin, Audit, kein produktiver Flow-Touch |
| `request_status_recheck` | Status neu einlesen | Nur geplant | Owner/Admin, Audit, Rate-Limit, keine Ausgabe |
| `refresh_overlay_state` | Overlay-/Client-State neu abfragen oder Refresh vorbereiten | Nur geplant | Owner/Admin, Audit, kein Auto-Retry, kein Alert-/Sound-Start |
| `clear_stale_visual_wait` | Veralteten visuellen Wait-State loeschen | Nur geplant | Owner/Admin, Audit, Alter pruefen, Queue/Flow/Lock pruefen |
| `manual_unlock_stale_bundle` | Veralteten Bundle-Lock loeschen | Nur geplant | Owner/Admin, Audit, Bundle-Alter, Queue-State, Sound-State, Alert-State pruefen |

## Weiterhin hart blockierte Aktionen

Diese Aktionen bleiben auch nach CAN-6.1 blockiert:

| Aktion | Grund |
|---|---|
| `auto_replay_alert` | Risiko doppelter Alerts / falscher Live-Ausgabe |
| `manual_replay_alert` | Erst mit harter traceId-/alertId-Duplikat-Sperre denkbar |
| `auto_replay_sound` | Risiko doppelter Sounds / Queue-Kollision |
| `manual_replay_sound` | Erst mit harter soundJobId-/Bundle-Sperre denkbar |
| `auto_retry_overlay` | Risiko doppelter Overlay-Ausloesung / falscher Visual-State |
| `auto_recovery` | Automatik bleibt verboten, bis separat geplant, getestet und freigegeben |

## Audit-Pflichtfelder

Spaetere manuelle Aktionen muessen mindestens speichern:

~~~text
Zeitpunkt
Dashboard-User
Rolle/Rechte
Aktion
Recovery-State
betroffene traceId
betroffene alertId
betroffene eventId
betroffene bundleId
betroffene soundJobId
alter Zustand
neuer Zustand
Safety-Stop-Status
Duplikat-Pruefergebnis
Ergebnis
Fehlertext
~~~

## Duplikat-Sperren

Vor jeder spaeteren produktiven Recovery-Aktion muessen passende Sperren existieren.

CAN-6.1 erlaubt noch keine produktive Aktion, definiert aber diese Pflicht:

~~~text
Alert-Replay: traceId + alertId + eventId + Replay-Historie pruefen
Sound-Replay: soundJobId + bundleId + activeBundleLock + Queue-State pruefen
Overlay-Retry: overlay client id + source id + heartbeat + active visual wait pruefen
Bundle-Clear: bundleId + Lock-Alter + Queue-State + Sound-State + Alert-State pruefen
~~~

## Safety-Stop

Vor einer spaeteren Umsetzung braucht es mindestens:

~~~text
globaler Recovery-Safety-Stop
modul-spezifischer Safety-Stop fuer Alert-System
modul-spezifischer Safety-Stop fuer Sound-System
modul-spezifischer Safety-Stop fuer Overlay/Visual-State
kein Recovery-Start bei laufendem Alert
kein Recovery-Start bei laufendem Sound
kein Recovery-Start bei aktivem Bundle-Lock
kein Recovery-Start bei unsicherem oder unbekanntem Status
~~~

## Dashboard-Regel

Das Dashboard bleibt nach CAN-6.1 weiterhin read-only.

~~~text
Keine Simulation-Buttons
Keine Recovery-Buttons
Keine produktive Aktion
Keine versteckten Trigger
Keine Auto-Recovery
~~~

Eine spaetere UI darf erst geplant werden, wenn Backend-Schutz, Audit, Auth, Duplikat-Sperren und Safety-Stop separat definiert und getestet sind.

## Tests fuer CAN-6.1

Da CAN-6.1 nur Doku/Planung ist:

~~~text
Keine node -c Tests noetig
Keine API-Tests noetig
Keine Dashboard-Tests noetig
Doku pruefen
ZIP-Pfade pruefen
Keine Code-Dateien im ZIP enthalten
~~~

## Ergebnis

CAN-6.1 legt die manuelle Recovery-Aktionsmatrix fest.

Es wurde weiterhin nichts aktiviert.

Naechster sinnvoller Schritt:

~~~text
CAN-6.2: Backend-Schutzvertrag fuer manuelle Recovery planen
~~~

CAN-6.2 soll noch keine Buttons und keine produktive Recovery aktivieren. Ziel waere nur, die benoetigten Schutzschichten fuer Auth, Audit, Safety-Stop, Duplikat-Sperren und Status-Guards technisch zu spezifizieren.

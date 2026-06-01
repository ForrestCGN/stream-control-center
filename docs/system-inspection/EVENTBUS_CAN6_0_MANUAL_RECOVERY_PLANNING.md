# EVENTBUS CAN-6.0 MANUELLE RECOVERY-PLANUNG

Stand: 2026-06-01
Status: Plan / Sicherheitskonzept / keine Umsetzung

## Ausgangslage

CAN-5.5 bis CAN-5.10 bilden einen stabilen read-only Diagnose-Stand für Recovery-Strategie, Simulation-Harness und Dashboard-Anzeige.

~~~text
Recovery-Strategy-State read-only
Simulation-Harness synthetisch/read-only
Dashboard-Anzeige read-only
Keine Simulation-Buttons
Keine Recovery-Automatik
Keine produktive Flow-Änderung
~~~

CAN-6.0 wechselt noch nicht in die Umsetzung. Dieser Step plant nur, wie eine spätere manuelle Recovery sicher aussehen darf.

## Ziel von CAN-6.0

Eine spätere manuelle Recovery darf nur vorbereitet werden, wenn sie alle Schutzregeln erfüllt:

~~~text
keine automatische Recovery
keine unkontrollierte Wiederholung von Alerts
keine unkontrollierte Wiederholung von Sounds
keine doppelte Overlay-Auslösung
keine Queue-Manipulation ohne Lock-/Statusprüfung
keine Aktion ohne Owner/Admin-Freigabe
keine Aktion ohne Audit-Log
keine Aktion ohne Bestätigungsdialog
~~~

## Recovery-Aktionen: Einordnung

### Weiterhin nur Diagnose

Diese Zustände bleiben zunächst nur sichtbar und lösen nichts aus:

~~~text
missingAck
noClient
unmatched
waitingTooLong
soundFetchFailed
bundle_wait_timeout
overlay_watchdog_issue
~~~

### Später eventuell manuell erlaubt

Diese Aktionen dürfen frühestens nach gesondertem Sicherheits-Step als manuelle Owner/Admin-Aktion geplant werden:

~~~text
refresh_overlay_state
clear_stale_visual_wait
mark_recovery_reviewed
request_status_recheck
manual_unlock_stale_bundle
~~~

Diese Aktionen lösen noch keine neuen Alerts oder Sounds aus.

### Hochriskant / vorerst blockiert

Diese Aktionen bleiben explizit blockiert, bis Duplikat-Sperren, Schutzfenster, Audit und Rollback nachweislich funktionieren:

~~~text
auto_replay_alert
manual_replay_alert
auto_replay_sound
manual_replay_sound
auto_retry_overlay
auto_recovery
~~~

## Pflicht-Schutzmechaniken vor jeder Umsetzung

### Rechteprüfung

~~~text
nur Owner/Admin
keine Mod-/Viewer-Auslösung
keine öffentliche Route ohne Auth
keine Aktion aus Overlay heraus
~~~

### Bestätigung

~~~text
klarer Button-Text
Bestätigungsdialog
Anzeige der betroffenen alertId / eventId / traceId
Anzeige der geplanten Aktion
Anzeige, ob echte Ausgabe erfolgen würde
~~~

### Duplikat-Sperren

Vor einer späteren Wiederholung von Alert oder Sound müssen harte Sperren existieren:

~~~text
traceId darf nur einmal produktiv wiederholt werden
alertId darf nur einmal produktiv wiederholt werden
sound job id darf nicht doppelt starten
bundle lock muss geprüft werden
aktueller Queue-Zustand muss geprüft werden
Cooldown/Safety-Window muss aktiv sein
~~~

### Audit-Log

Jede manuelle Recovery-Aktion muss nachvollziehbar speichern:

~~~text
Zeitpunkt
Dashboard-User
Rolle/Rechte
Aktion
betroffene IDs
alter Zustand
neuer Zustand
Ergebnis
Fehlertext
~~~

### Safety-Stop / Rollback

Vor produktiven Recovery-Aktionen muss es geben:

~~~text
globaler Recovery-Safety-Stop
Modul-spezifischer Stop
kein Wiederholen bei laufendem Alert/Sound
kein Wiederholen bei aktivem Bundle-Lock
Rollback-/Clear-Anweisung
~~~

## Dashboard-Regel für CAN-6.x

Auch in CAN-6.x gilt zunächst:

~~~text
Dashboard zeigt Diagnose.
Dashboard darf keine Simulation triggern.
Dashboard darf keine Recovery triggern, bevor CAN-6.x-Schutzmechaniken dokumentiert und getestet sind.
~~~

## Nicht geändert

CAN-6.0 ist nur Planung.

~~~text
Keine Backend-Änderung
Keine API-Änderung
Keine Dashboard-Code-Änderung
Keine Simulation-Buttons
Keine Recovery-Buttons
Keine Recovery-Automatik
Keine produktive Flow-Änderung
Keine DB-/Config-Migration
~~~

## Nächster sinnvoller Schritt

~~~text
CAN-6.1: Manuelle Recovery-Aktionsmatrix definieren
~~~

Ziel von CAN-6.1:

~~~text
Für jeden Zustand definieren:
- darf nur angezeigt werden
- darf manuell bestätigt werden
- darf manuell geprüft werden
- bleibt hart blockiert
- benötigt Audit
- benötigt Owner/Admin
- benötigt Safety-Stop
~~~

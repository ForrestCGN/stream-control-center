# EVENTBUS CAN-6.10 CAN-6.X ABSCHLUSSCHECK UND CAN-7.0 STARTGRENZE

Stand: 2026-06-01
Status: Plan / Sicherheitsabschluss / keine Umsetzung
Marker: STEP_CAN6_10_RECOVERY_PLANNING_CLOSURE_CAN7_START_GATE

## Ausgangslage

CAN-6.1 bis CAN-6.9 haben die spaetere manuelle Recovery ausschliesslich geplant und abgesichert.

Bisherige CAN-6.x-Dokumente:

~~~text
CAN-6.1: Manuelle Recovery-Aktionsmatrix
CAN-6.2: Backend-Schutzvertrag
CAN-6.3: Audit- und Bestaetigungs-Code-Konzept
CAN-6.4: Read-only Recovery-Preflight-API-Konzept
CAN-6.5: Dashboard-Preflight-Anzeige und UX-Regeln
CAN-6.6: Recovery-Ausfuehrungs-Command-Konzept
CAN-6.7: Recovery-Command-Audit-/State-Mapping
CAN-6.8: Recovery-Safety-Stop- und Clear-Regelwerk
CAN-6.9: Recovery-Implementierungsreihenfolge und Code-Grenzen
~~~

CAN-6.10 schliesst die Planungsreihe ab und definiert die harte Grenze fuer CAN-7.0.

Wichtig: CAN-6.10 ist weiterhin nur Dokumentation.

~~~text
Keine Backend-Aenderung
Keine API-Aenderung
Keine Dashboard-Code-Aenderung
Keine Recovery-Buttons
Keine Simulation-Buttons
Keine produktive Flow-Aenderung
Keine DB-/Config-Migration
~~~

## Ergebnis von CAN-6.x

Die CAN-6.x-Reihe legt fest, dass manuelle Recovery spaeter nur als strikt kontrollierter, auditierter und mehrfach gesperrter Prozess denkbar ist.

Grundregel:

~~~text
Diagnose zuerst.
Read-only Status zuerst.
Preflight spaeter nur read-only.
Command-Ausfuehrung bleibt gesperrt.
Keine automatische Recovery.
Keine Wiederholung von Alerts oder Sounds ohne separate harte Schutzmechanik.
~~~

## Weiterhin hart blockiert

Diese Aktionen bleiben nach CAN-6.10 blockiert:

~~~text
auto_recovery
auto_retry_overlay
auto_replay_alert
auto_replay_sound
manual_replay_alert
manual_replay_sound
manual_retry_overlay
manual_unlock_stale_bundle
manual_clear_stale_visual_wait
manual_mark_recovery_reviewed
manual_request_status_recheck
~~~

Begruendung:

~~~text
Es gibt noch keine implementierte Auth-Guard-Kette.
Es gibt noch keine produktive Audit-Schreiblogik.
Es gibt noch keine bestaetigte Duplikat-Sperre.
Es gibt noch keinen aktivierten Safety-Stop.
Es gibt noch keinen Rollback-/Clear-Mechanismus.
Es gibt noch keine freigegebene Command-Route.
~~~

## Was CAN-7.0 maximal starten darf

CAN-7.0 darf nicht direkt Recovery bauen.

CAN-7.0 darf maximal als erster echter Code-Vorbereitungsschritt starten:

~~~text
Echte Dateien erneut pruefen.
Bestehenden Recovery-/Bus-Diagnostics-Status aufnehmen.
Read-only Recovery-Readiness-Status konkret planen.
Betroffene Datei vollstaendig lesen.
Austauschdatei nur nach Go liefern.
Keine Schreiboperation ergaenzen.
Keine Route mit Seiteneffekt ergaenzen.
Keine Dashboard-Aktion ergaenzen.
~~~

Erlaubter CAN-7.0-Titel:

~~~text
CAN-7.0: Echte Dateien pruefen und read-only Recovery-Readiness-Status vorbereiten
~~~

## CAN-7.0 Startbedingungen

Vor CAN-7.0 muss geprueft werden:

~~~text
GitHub/dev ist aktuell.
Lokaler Repo-Stand ist sauber oder Abweichungen sind bekannt.
CAN-6.1 bis CAN-6.10 sind dokumentiert.
Keine alte blockierte Doku-Datei mit Sicherheitsbegriffen liegt untracked im Repo.
Keine Prompt-Datei liegt versehentlich untracked im Repo, falls sie nicht versioniert werden soll.
~~~

Vor jeder Datei-Aenderung in CAN-7.0 muss gelten:

~~~text
Ziel nennen.
Betroffene Dateien nennen.
Geplante Aenderung nennen.
Nicht geaenderte Bereiche nennen.
Tests nennen.
Auf ausdrueckliches Go warten.
~~~

## Pflichtdateien vor CAN-7.0 pruefen

Mindestens diese Dateien muessen vor einem echten Code-Step vollstaendig geprueft werden:

~~~text
backend/modules/bus_diagnostics.js
backend/modules/communication_bus.js
backend/modules/alert_system.js
backend/modules/sound_system.js
htdocs/dashboard/modules/bus_diagnostics.js
htdocs/overlays/_overlay-alerts-v2.html
htdocs/overlays/sound_system_overlay.html
config/alert_system.json
config/sound_system.json
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
~~~

Wenn eine Datei nicht vollstaendig und verlaesslich aus GitHub/dev gelesen werden kann:

~~~text
Ich brauche genau diese Datei:
[Pfad]
~~~

Keine Ersatzannahmen.
Keine Teil-Patches.
Keine Apply-Scripte.

## CAN-7.0 erste erlaubte technische Grenze

Der erste spaetere Code-Step darf nur read-only Felder vorbereiten oder anzeigen.

Erlaubt waere spaeter nur:

~~~text
recoveryReadiness.mode
recoveryReadiness.state
recoveryReadiness.severity
recoveryReadiness.reasons
recoveryReadiness.blockedActions
recoveryReadiness.allowedReadOnlyViews
recoveryReadiness.productiveActions=false
recoveryReadiness.automationEnabled=false
recoveryReadiness.flowTouched=false
recoveryReadiness.queueTouched=false
recoveryReadiness.soundSystemTouched=false
recoveryReadiness.alertSystemTouched=false
recoveryReadiness.overlayTouched=false
~~~

Nicht erlaubt:

~~~text
POST/PUT/PATCH/DELETE Recovery-Routen
GET-Routen mit Seiteneffekt
Command-Ausfuehrung
Clear-Ausfuehrung
Review-Ausfuehrung
Bestaetigungs-Code-Erzeugung
Audit-Schreiblogik
DB-Migration
Queue-/Sound-/Alert-/Overlay-Manipulation
Dashboard-Buttons
Simulation-Buttons
~~~

## Tests fuer CAN-7.0 planen

Wenn CAN-7.0 spaeter Code beruehrt, mindestens testen:

~~~text
node -c backend\modules\bus_diagnostics.js
/api/_status kurz pruefen
bus_diagnostics loaded/version/lastError pruefen
read-only Felder vorhanden pruefen
productiveActions=false pruefen
automationEnabled=false pruefen
flowTouched=false pruefen
queueTouched=false pruefen
soundSystemTouched=false pruefen
alertSystemTouched=false pruefen
overlayTouched=false pruefen
Dashboard weiterhin ohne Buttons pruefen
~~~

Kurze PowerShell-Ausgabe:

~~~powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/_status"
$s.modules | Select-Object name,loaded,version,lastError | Format-Table -AutoSize
~~~

Detailausgabe nur bei Bedarf:

~~~powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/bus-diagnostics/status" | ConvertTo-Json -Depth 8
~~~

## Nicht geaendert

CAN-6.10 ist nur Abschlussdokumentation.

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

## Abschluss CAN-6.x

CAN-6.x ist nach CAN-6.10 als Planungs- und Sicherheitsreihe abgeschlossen.

Naechster sinnvoller Schritt:

~~~text
CAN-7.0: Echte Dateien pruefen und read-only Recovery-Readiness-Status vorbereiten
~~~

CAN-7.0 darf erst nach neuem ausdruecklichem Go beginnen.

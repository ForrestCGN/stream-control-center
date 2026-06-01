# EVENTBUS CAN-8.13 RECOVERY PREFLIGHT DASHBOARD READ-ONLY CLOSURE / CAN-9.0 START GATE

Stand: 2026-06-01
Status: Abschluss / Startgrenze / keine Umsetzung

## Ziel

CAN-8.13 schliesst den CAN-8.x Recovery-Preflight-Dashboard-Strang als stabilen read-only Stand ab und definiert die Grenze fuer CAN-9.0.

Es wird keine technische Datei geaendert.

## Abgeschlossener CAN-8 Stand

Bestaetigt stabil:

~~~text
CAN-8.0  Preflight-Startgrenze dokumentiert
CAN-8.1  Read-only Datenmodell geplant
CAN-8.2  Read-only Statusfelder geplant
CAN-8.3  recoveryPreflight Statusfeld im Backend umgesetzt
CAN-8.4  Dashboard-Anzeige geplant
CAN-8.5  Dashboard-Preflight-Anzeige umgesetzt
CAN-8.5.1 Preflight-Untertab-Klick-Fix umgesetzt
CAN-8.6  Dashboard-Live-Test abgenommen
CAN-8.7  Check-Matrix geplant
CAN-8.8  Check-Matrix Statusfelder geplant
CAN-8.9  Check-Matrix Statusfelder im Backend umgesetzt
CAN-8.10 Check-Matrix Live-Test abgenommen
CAN-8.11 Check-Matrix im Dashboard angezeigt
CAN-8.12 Dashboard-Live-Test abgenommen
~~~

## Aktueller technischer Sicherheitsstand

Bestaetigt:

~~~text
recoveryPreflight.status = ready
recoveryPreflight.mode = read_only
recoveryPreflight.canPrepare = false
recoveryPreflight.canExecute = false
recoveryPreflight.checkSummary.total = 13
recoveryPreflight.checkSummary.ok = 13
recoveryPreflight.checkSummary.warnings = 0
recoveryPreflight.checkSummary.blocking = 0
recoveryPreflight.checkSummary.blocked = 0
~~~

Weiterhin gueltig:

~~~text
Keine POST-/Command-Route
Keine Preflight-Ausfuehrungsroute
Keine Recovery-Ausfuehrung
Keine Recovery-/Simulation-/Execute-Buttons
Keine Config-/DB-Migration
Keine produktive Flow-Aenderung
~~~

## Dashboard-Stand

Im Dashboard ist sichtbar:

~~~text
Event-Bus / Communication Bus -> Recovery -> Preflight
Recovery-Preflight
Preflight-Safety
Preflight-Scope
Preflight-Blocker
Preflight-Warnungen
Preflight-Check-Matrix
Hart blockierte Preflight-Aktionen
~~~

Die Anzeige ist read-only. Es gibt keine Aktionsbuttons fuer Recovery, Simulation, Prepare oder Execute.

## Harte Blockaden bleiben aktiv

Weiterhin hart blockiert:

~~~text
auto_replay_alert
manual_replay_alert
auto_replay_sound
manual_replay_sound
auto_retry_overlay
auto_recovery
manual_recovery_execution
preflight_prepare_execution
preflight_execute_recovery
~~~

## CAN-9.0 Startgrenze

CAN-9.0 darf noch keine produktive Recovery umsetzen.

Erlaubt fuer CAN-9.0:

~~~text
Preflight-Routenplanung
Guard-Contract fuer eine spaetere read-only Preflight-Route
Request-/Response-Konzept
Auth-/Owner-/Admin-Grenze planen
Audit-Anforderungen planen
Dashboard-Anzeige fuer spaetere Route planen
~~~

Nicht erlaubt fuer CAN-9.0 ohne separaten freigegebenen Step:

~~~text
Keine POST-/Command-Route umsetzen
Keine Execute-/Prepare-Aktion aktivieren
Keine Recovery ausfuehren
Keine Alerts oder Sounds wiederholen
Keine Overlay-Retry-Aktion ausloesen
Keine Queue manipulieren
Keine DB-Migration ohne extra Planung
Keine Dashboard-Aktionsbuttons
~~~

## Erste sinnvolle CAN-9 Reihenfolge

Empfohlen:

~~~text
CAN-9.0: Preflight-Route Startgrenze / Sicherheitsplanung
CAN-9.1: Read-only Preflight-Route Contract planen
CAN-9.2: Read-only Preflight-Route Status-/Response-Felder planen
CAN-9.3: Erst nach separatem Go minimale GET-Route pruefen/umsetzen
~~~

## Nicht geaendert

~~~text
Keine Backend-Datei
Keine Dashboard-Datei
Keine API-Route
Keine Config
Keine DB
Keine Recovery-Ausfuehrung
Keine produktive Flow-Aenderung
~~~

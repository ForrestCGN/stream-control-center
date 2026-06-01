# EVENTBUS CAN-6.9 RECOVERY-IMPLEMENTIERUNGSREIHENFOLGE UND CODE-GRENZEN

Stand: 2026-06-01
Status: Plan / Sicherheitskonzept / keine Umsetzung
Marker: STEP_CAN6_9_RECOVERY_IMPLEMENTATION_SEQUENCE_GATES

## Ausgangslage

CAN-6.1 hat die manuelle Recovery-Aktionsmatrix definiert.
CAN-6.2 hat den Backend-Schutzvertrag geplant.
CAN-6.3 hat Audit- und Bestätigungs-Code-Konzept beschrieben.
CAN-6.4 hat das read-only Preflight-API-Konzept definiert.
CAN-6.5 hat die read-only Dashboard-UX fuer Preflight-Ergebnisse geplant.
CAN-6.6 hat den spaeteren Ausfuehrungs-Command als Konzept beschrieben.
CAN-6.7 hat das Command-/Audit-/State-Mapping festgelegt.
CAN-6.8 hat Safety-Stop, Modul-Stop, Clear, Review und Rollback-Hinweise geregelt.

CAN-6.9 legt jetzt fest, in welcher Reihenfolge spaeter ueberhaupt Code angefasst werden darf und wo die harten Grenzen fuer den ersten Implementierungsblock liegen.

Wichtig: CAN-6.9 baut keine Route, keinen Button, keinen Speicher, keine DB-Tabelle und keine Recovery-Ausfuehrung.

~~~text
Keine Backend-Änderung
Keine API-Route aktivieren
Keine Dashboard-Code-Änderung
Keine Recovery-Buttons
Keine Simulation-Buttons
Keine produktive Flow-Änderung
Keine DB-/Config-Migration
~~~

## Ziel von CAN-6.9

Ziel ist eine verbindliche Reihenfolge fuer spaetere Implementierungsschritte, damit der erste Code-Step klein, pruefbar und ungefaehrlich bleibt.

Der erste spaetere Code-Step darf maximal read-only Diagnose ergaenzen.

Er darf nicht:

~~~text
Recovery ausfuehren
Alerts wiederholen
Sounds wiederholen
Overlay neu starten
Queues veraendern
Bundles entsperren
Dashboard-Buttons einbauen
DB-Struktur produktiv migrieren
Config-Werte automatisch aendern
~~~

## Verbindliche Implementierungsreihenfolge

### Phase 0: Echte Dateien pruefen

Vor jedem Code-Step muessen die echten Dateien aus GitHub/dev bzw. dem aktuellen Live-/Repo-Stand geprueft werden.

Mindestens pruefen:

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

Wenn eine Datei nicht vollstaendig und verlaesslich gelesen werden kann:

~~~text
Nicht raten.
Nicht patchen.
Nicht improvisieren.
Datei konkret anfordern.
~~~

### Phase 1: Read-only Backend-Diagnose vorbereiten

Erster spaeterer Code-Step darf nur eine read-only Ermittlung vorbereiten.

Erlaubt waere spaeter hoechstens:

~~~text
bestehenden Recovery-Strategy-State lesbar auswerten
vorhandene Statusdaten strukturierter ausgeben
blockedActions/reasons lesbarer machen
preflightFaehigkeit als false/blocked anzeigen
productiveActions weiterhin false halten
automationEnabled weiterhin false halten
flowTouched/queueTouched/soundSystemTouched/alertSystemTouched/overlayTouched weiterhin false halten
~~~

Nicht erlaubt:

~~~text
neue Recovery-Ausfuehrungsroute
Command-Route
Button-Backend
Queue-Manipulation
Sound-Manipulation
Alert-Replay
Overlay-Retry
Clear-Aktion
Review-Aktion
Audit-Schreiblogik
DB-Migration
~~~

### Phase 2: Read-only Statusroute

Erst nach Phase 1 darf eine read-only Statusroute geplant werden.

Diese Route darf nur anzeigen.

Sie darf keine Aktion ausloesen.

Konzeptioneller Zweck:

~~~text
Recovery-Readiness anzeigen
Blockierungsgruende anzeigen
fehlende Voraussetzungen anzeigen
Safety-Stop-Status anzeigen
Dashboard-Datenmodell vorbereiten
~~~

Verboten bleiben:

~~~text
POST/PUT/PATCH/DELETE fuer Recovery
GET-Route mit Seiteneffekt
Clear per URL
Review per URL
Bestätigungs-Code erzeugen
Recovery ausfuehren
~~~

### Phase 3: Dashboard nur Anzeige

Erst wenn die read-only Backend-Ausgabe stabil ist, darf die Dashboard-Anzeige geplant werden.

Dashboard darf anzeigen:

~~~text
Status
Severity
Reasons
Blocked Actions
Allowed Low-Risk Actions als reine Textanzeige
Safety-Stop-Hinweis
fehlende Voraussetzungen
Read-only-Hinweis
~~~

Dashboard darf nicht enthalten:

~~~text
Recovery-Button
Clear-Button
Review-Button
Simulation-Button
Retry-Button
Replay-Button
Unlock-Button
Formular zum Absenden einer Aktion
versteckte Click-Handler mit Seiteneffekt
~~~

### Phase 4: Preflight nur nach separatem Go

Preflight darf erst nach separatem Planungs- und Code-Go umgesetzt werden.

Preflight bleibt read-only.

Preflight darf nur bewerten:

~~~text
waere Aktion generell denkbar?
welche Guards blockieren?
welche Rechte fehlen?
welche Safety-Stops sind aktiv?
welche Duplikat-Sperren wuerden greifen?
welche Audit-Felder waeren Pflicht?
~~~

Preflight darf nicht:

~~~text
Aktion reservieren
Queue locken
Sound/Alert markieren
Bestätigungs-Code erzeugen
Recovery ausfuehren
Status veraendern
~~~

### Phase 5: Command-Konzept bleibt gesperrt

Eine echte Command-Route bleibt nach CAN-6.9 weiterhin gesperrt.

Sie darf erst geplant werden, wenn alle vorherigen Phasen stabil dokumentiert, umgesetzt und getestet sind.

Vorher bleiben hart blockiert:

~~~text
manual_replay_alert
manual_replay_sound
manual_retry_overlay
manual_unlock_stale_bundle
manual_clear_stale_visual_wait
manual_mark_recovery_reviewed
manual_request_status_recheck
auto_recovery
auto_retry_overlay
auto_replay_alert
auto_replay_sound
~~~

## Erster erlaubter Code-Step nach CAN-6.9

Der erste erlaubte spaetere Code-Step waere maximal:

~~~text
CAN-7.0: Echte Dateien pruefen und read-only Recovery-Readiness-Status planen
~~~

CAN-7.0 sollte noch keinen produktiven Code aktivieren, sondern zuerst:

~~~text
echte Dateien erneut lesen
bestehende Status-/Diagnose-Struktur aufnehmen
konkrete betroffene Datei nennen
genaue read-only Felder definieren
Tests festlegen
auf Go warten
~~~

Wenn danach Code erlaubt wird, dann nur:

~~~text
read-only Statusdaten
keine Ausfuehrungslogik
keine Schreiboperation
keine Dashboard-Aktion
keine DB-Migration
keine produktive Flow-Beruehrung
~~~

## Harte Gates vor jedem Code-Step

Jeder spaetere Code-Step muss diese Fragen beantworten:

~~~text
Welche Datei wird vollstaendig ersetzt?
Welche bestehende Funktion bleibt unveraendert?
Welche neuen Felder sind rein read-only?
Welche Seiteneffekte sind ausgeschlossen?
Welche Tests zeigen, dass productiveActions false bleibt?
Welche Tests zeigen, dass keine Queue/Sound/Alert/Overlay-Logik beruehrt wurde?
Wie wird Rollback gemacht?
Welche Doku wird mitgepflegt?
~~~

Wenn eine dieser Fragen nicht beantwortet ist:

~~~text
Kein Code-Step.
~~~

## Testregeln fuer den ersten spaeteren Code-Step

Mindestens zu testen:

~~~text
node -c backend\modules\bus_diagnostics.js
API-Status kurz pruefen
Recovery-State lesen
productiveActions=false bestaetigen
automationEnabled=false bestaetigen
flowTouched=false bestaetigen
queueTouched=false bestaetigen
soundSystemTouched=false bestaetigen
alertSystemTouched=false bestaetigen
overlayTouched=false bestaetigen
Dashboard weiterhin ohne Buttons pruefen
~~~

Beispiel fuer kurze Testausgabe:

~~~powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/_status"
$s.modules | Select-Object name,loaded,version,lastError | Format-Table -AutoSize
~~~

Detailtests nur bei Bedarf:

~~~powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/bus-diagnostics/status" | ConvertTo-Json -Depth 8
~~~

## Nicht geaendert

CAN-6.9 ist nur Planung.

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
CAN-6.10: CAN-6.x Abschlusscheck und Übergabe nach CAN-7.0 vorbereiten
~~~

Ziel von CAN-6.10:

~~~text
CAN-6.1 bis CAN-6.9 zusammenfassen
offene Sperren bestaetigen
CAN-7.0 Startbedingungen definieren
keinen Code aktivieren
~~~

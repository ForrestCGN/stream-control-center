# EVENTBUS CAN-6.5 DASHBOARD-PREFLIGHT-ANZEIGE UND UX-REGELN

Stand: 2026-06-01
Status: Plan / Sicherheitskonzept / keine Umsetzung
Marker: STEP_CAN6_5_DASHBOARD_PREFLIGHT_READONLY_UX_CONCEPT

## Ausgangslage

CAN-6.1 hat die manuelle Recovery-Aktionsmatrix definiert.
CAN-6.2 hat den Backend-Schutzvertrag geplant.
CAN-6.3 hat Audit- und Bestätigungs-Code-Konzept beschrieben.
CAN-6.4 hat ein Konzept fuer eine spaetere read-only Recovery-Preflight-API definiert.

CAN-6.5 plant jetzt nur, wie spaetere Preflight-Ergebnisse im Dashboard angezeigt werden duerfen.

Wichtig: CAN-6.5 aktiviert keine Dashboard-Funktion und baut keine Buttons.

~~~text
Keine Backend-Änderung
Keine API-Route aktivieren
Keine Dashboard-Code-Änderung
Keine Recovery-Buttons
Keine Simulation-Buttons
Keine produktive Flow-Änderung
Keine DB-/Config-Migration
~~~

## Ziel von CAN-6.5

Das Dashboard darf spaeter Preflight-Daten eindeutig, sicher und read-only anzeigen.

Die Anzeige soll den User informieren, aber keine Aktion ausloesen.

~~~text
Preflight-Ergebnis anzeigen
Blockaden anzeigen
Warnungen anzeigen
erlaubte rein pruefende Zustände anzeigen
Rollen-/Rechte-Hinweise anzeigen
Bestätigungs-Code-Verfügbarkeit nur als Status anzeigen
Read-only-Hinweis deutlich anzeigen
keine Recovery ausfuehren
keine Simulation ausfuehren
keine produktiven Events senden
~~~

## Dashboard-Grundregel

Die CAN-6.5-Anzeige ist nur ein Sicherheits- und Diagnosebildschirm.

Sie darf nicht:

~~~text
Recovery starten
Alert wiederholen
Sound wiederholen
Overlay erneut triggern
Queue oder Locks veraendern
Safety-Stop deaktivieren
Bestätigungs-Code erzeugen
Bestätigungs-Code verbrauchen
Audit-Events fuer echte Aktionen schreiben
produktive EventBus-Events senden
~~~

## Sichtbare Preflight-Felder

Spaeter sichtbare Felder im Dashboard:

~~~text
action
actionLabel
targetType
targetIds
traceId
alertId
soundJobId
bundleId
state
severity
allowed
blocked
blockReasons
warnings
requiredRole
userRole
confirmAvailable
safetyStopActive
duplicateRisk
rollbackAvailable
readOnly
checkedAt
source
~~~

## Anzeigegruppen

Die Preflight-Anzeige soll nicht als Roh-JSON erscheinen.

Geplante UI-Gruppen:

~~~text
1. Kopfbereich
   - Aktion
   - Ziel / betroffene IDs
   - Status: erlaubt, blockiert, Warnung, nur Diagnose

2. Sicherheitsstatus
   - Safety-Stop aktiv/inaktiv
   - Duplikat-Risiko
   - laufende Alerts/Sounds/Bundles
   - Rollback/Clear verfügbar

3. Rechte und Freigabe
   - benoetigte Rolle
   - erkannte Rolle
   - Bestätigungs-Code verfügbar: ja/nein
   - Hinweis: kein Ausfuehren in dieser Ansicht

4. Blockaden
   - harte Blockierungsgruende
   - warum keine Aktion moeglich ist

5. Warnungen
   - nicht blockierend, aber sichtbar
   - z. B. veralteter Diagnosezustand, fehlende Detaildaten

6. Read-only-Hinweis
   - klarer Text, dass keine Recovery ausgelöst wird
~~~

## Status-Einstufungen

Das Dashboard soll spaeter klare Status-Badges nutzen:

~~~text
diagnose_only
blocked
warning
preflight_ok
not_available
unknown
~~~

Bedeutung:

~~~text
diagnose_only:
  Der Zustand wird nur angezeigt. Keine Aktion erlaubt.

blocked:
  Eine spätere Aktion waere hart blockiert.

warning:
  Preflight sieht Risiken, aber keine harte Blockade.

preflight_ok:
  Preflight sieht theoretisch keine Blockade. Trotzdem noch keine Ausfuehrung.

not_available:
  Aktion ist fuer diesen Zustand nicht vorgesehen.

unknown:
  Daten reichen nicht fuer eine sichere Bewertung.
~~~

## Pflichttexte im Dashboard

Die Anzeige muss Fehlbedienung verhindern.

Pflichttexte:

~~~text
Nur Anzeige - keine Recovery wird ausgeführt.
Preflight prüft nur trocken/read-only.
Diese Ansicht startet keine Alerts, Sounds oder Overlays.
Eine spätere manuelle Aktion braucht Owner/Admin, Bestätigung, Audit und Duplikat-Sperre.
Bei blockierten Aktionen darf kein Button zur Ausführung sichtbar sein.
~~~

## Verbotene UI-Elemente in CAN-6.5

In diesem Step und in einer spaeteren ersten Anzeigephase bleiben verboten:

~~~text
Recovery starten
Erneut abspielen
Alert replay
Sound replay
Overlay retry
Auto-Recovery aktivieren
Simulation starten
Bestätigungs-Code erzeugen
Bestätigungs-Code verwenden
Safety-Stop deaktivieren
Queue entsperren
Bundle freigeben
~~~

## Rollen-/Rechte-Hinweise

Die Anzeige darf Rechte nur informieren, nicht umgehen.

~~~text
Owner/Admin erforderlich
erkannte Rolle nur anzeigen
fehlende Rechte als Blockade markieren
keine Mod-/Viewer-Aktion
keine Overlay-seitige Aktion
keine öffentliche Route ohne Auth
~~~

## Umgang mit Bestätigungs-Code

CAN-6.5 zeigt Bestätigungs-Code nur als Verfügbarkeit an.

~~~text
confirmAvailable: true/false
confirmReason: Text
confirmRequired: true/false
confirmTtlMs: optionaler Hinweis
~~~

Nicht erlaubt:

~~~text
Code anzeigen
Code erzeugen
Code kopieren
Code verbrauchen
Aktion mit Code ausführen
~~~

## Dashboard-Datenmodell als Konzept

Spaeteres Anzeigeobjekt, nur als Konzept:

~~~json
{
  "ok": true,
  "readOnly": true,
  "action": "request_status_recheck",
  "status": "preflight_ok",
  "severity": "info",
  "allowed": true,
  "blocked": false,
  "blockReasons": [],
  "warnings": ["manual_execution_not_available_in_dashboard"],
  "requiredRole": "owner_or_admin",
  "userRole": "owner",
  "confirmAvailable": true,
  "safetyStopActive": false,
  "duplicateRisk": "none",
  "rollbackAvailable": true,
  "checkedAt": "ISO-8601"
}
~~~

Wichtig: Dieses Objekt ist nur ein Anzeige-/Planungsmodell, keine aktive API.

## CAN-6.1-Aktionen aus Dashboard-Sicht

~~~text
mark_recovery_reviewed:
  Anzeige: spaeter eventuell preflight_ok
  Button in CAN-6.5: nein
  Risiko: niedrig, aber Audit/Bestätigung nötig

request_status_recheck:
  Anzeige: spaeter eventuell preflight_ok
  Button in CAN-6.5: nein
  Risiko: niedrig, aber darf keine produktive Recovery auslösen

refresh_overlay_state:
  Anzeige: warning oder blocked, abhängig von Overlay-Status
  Button in CAN-6.5: nein
  Risiko: kann Anzeigezustand verändern, daher später separat planen

clear_stale_visual_wait:
  Anzeige: blocked, bis Lock-/State-Prüfung implementiert ist
  Button in CAN-6.5: nein
  Risiko: kann Flow-Zustand beeinflussen

manual_unlock_stale_bundle:
  Anzeige: blocked, bis Bundle-/Queue-Schutz nachweislich funktioniert
  Button in CAN-6.5: nein
  Risiko: hoch, weil Queue-/Sound-Bundle betroffen
~~~

## Harte Sperren bleiben unverändert

Weiterhin blockiert:

~~~text
auto_replay_alert
manual_replay_alert
auto_replay_sound
manual_replay_sound
auto_retry_overlay
auto_recovery
~~~

Diese Aktionen dürfen im Dashboard höchstens als blockiert erklärt werden.

## Tests fuer einen spaeteren Code-Step

Wenn spaeter echter Dashboard-Code gebaut wird, müssen mindestens diese Prüfungen erfolgen:

~~~text
Dashboard lädt ohne Fehler.
Recovery-Preflight-Bereich ist sichtbar.
Read-only-Hinweis ist sichtbar.
Keine Recovery-Buttons sichtbar.
Keine Simulation-Buttons sichtbar.
Keine produktiven Actions in Event-Handlern.
Keine API-Calls ausser read-only Status/Preflight.
Blockaden/Warnungen werden getrennt angezeigt.
Unbekannte Daten werden als unknown/blocked dargestellt.
~~~

## Nicht geändert

CAN-6.5 ist nur Planung.

~~~text
Keine Backend-Änderung
Keine API-Route
Keine Dashboard-Code-Änderung
Keine Overlay-Änderung
Keine Recovery-Buttons
Keine Simulation-Buttons
Keine automatische Recovery
Keine produktive Flow-Änderung
Keine DB-/Config-Migration
~~~

## Nächster sinnvoller Schritt

~~~text
CAN-6.6: Read-only Dashboard-Preflight-Anzeige als Code-Step planen
~~~

Vor CAN-6.6 muss separat geprüft werden:

~~~text
echte aktuelle Dashboard-Datei
echte aktuelle bus_diagnostics.js Struktur
bestehende Tab-/Render-Muster
bestehende Auth-/Rollen-Anzeige
bestehende Status-/Recovery-Daten
keine Buttons, keine produktiven Handler
~~~

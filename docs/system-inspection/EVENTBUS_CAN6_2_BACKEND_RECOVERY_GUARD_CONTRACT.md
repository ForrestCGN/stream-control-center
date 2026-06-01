# EVENTBUS CAN-6.2 BACKEND-SCHUTZVERTRAG FUER MANUELLE RECOVERY

Stand: 2026-06-01
Status: Plan / Backend-Schutzvertrag / keine Umsetzung
Marker: STEP_CAN6_2_BACKEND_RECOVERY_GUARD_CONTRACT

## Zweck

CAN-6.2 definiert den technischen Schutzvertrag, der vor jeder spaeteren manuellen Recovery im Backend gelten muss.

Dieser Step aktiviert keine Recovery-Funktion.

~~~text
Keine Backend-Aenderung
Keine API-Aenderung
Keine Dashboard-Code-Aenderung
Keine neuen Routen
Keine Simulation-Buttons
Keine Recovery-Buttons
Keine Recovery-Automatik
Keine produktive Flow-Aenderung
Keine DB-/Config-Migration
~~~

## Ausgangsstand

CAN-6.1 hat die manuelle Recovery-Aktionsmatrix definiert.

Weiterhin hart blockiert:

~~~text
auto_replay_alert
manual_replay_alert
auto_replay_sound
manual_replay_sound
auto_retry_overlay
auto_recovery
~~~

CAN-6.2 plant nur, welche Backend-Schutzschichten spaeter vorhanden sein muessen, bevor ueberhaupt eine manuelle Recovery-Aktion technisch ausfuehrbar werden darf.

## Grundsatz

Jede spaetere manuelle Recovery-Aktion muss durch eine feste Guard-Kette laufen.

Keine Aktion darf direkt aus einer Dashboard-Route, einem Overlay, einem WebSocket-Event oder einem Modul heraus produktiv wirken.

Pflicht:

~~~text
AuthGuard
ActionMatrixGuard
ConfirmGuard
RecoveryStateGuard
SafetyStopGuard
StatusGuard
DuplicateGuard
RateLimitGuard
AuditGuard
RollbackGuard
~~~

Wenn ein Guard fehlschlaegt, muss die Aktion blockiert werden.

## Guard-Kette

### 1. AuthGuard

Prueft, ob der Dashboard-User die benoetigte Rolle hat.

Pflichtregeln:

~~~text
Nur Owner/Admin
Keine Mod-/Viewer-Ausloesung
Keine oeffentliche Route ohne Auth
Keine Aktion aus Overlay heraus
Keine Aktion nur durch Kenntnis einer URL
~~~

Ausgabe bei Fehler:

~~~text
blocked_auth_missing
blocked_role_not_allowed
blocked_public_route_not_allowed
~~~

### 2. ActionMatrixGuard

Prueft, ob die angeforderte Aktion laut CAN-6.1 Matrix fuer den aktuellen Zustand grundsaetzlich erlaubt ist.

Beispiele:

~~~text
missingAck -> mark_recovery_reviewed oder request_status_recheck geplant
noClient -> request_status_recheck geplant
bundle_wait_timeout -> manual_unlock_stale_bundle nur als Clear-stale-only geplant
manual_replay_alert -> hart blockiert
auto_recovery -> hart blockiert
~~~

Ausgabe bei Fehler:

~~~text
blocked_action_not_in_matrix
blocked_action_hard_blocked
blocked_unknown_recovery_state
~~~

### 3. ConfirmGuard

Spaetere manuelle Aktionen duerfen nur mit expliziter Bestaetigung laufen.

Mindestanforderungen:

~~~text
Confirm-Token / Nonce
kurze Ablaufzeit
Bindung an User
Bindung an Aktion
Bindung an traceId / alertId / eventId / bundleId / soundJobId
Anzeige der geplanten Aktion
Anzeige ob echte Ausgabe erfolgen wuerde
keine Wiederverwendung des Tokens
~~~

Ausgabe bei Fehler:

~~~text
blocked_confirm_missing
blocked_confirm_expired
blocked_confirm_mismatch
blocked_confirm_reused
~~~

### 4. RecoveryStateGuard

Prueft, ob der Recovery-State noch aktuell ist.

Pflichtpruefungen:

~~~text
Recovery-State existiert
State passt zur angeforderten Aktion
betroffene IDs stimmen
State wurde nicht bereits reviewed/cleared
State ist nicht unbekannt
State ist nicht neuer als die Preflight-Anzeige
~~~

Ausgabe bei Fehler:

~~~text
blocked_state_missing
blocked_state_changed
blocked_state_already_reviewed
blocked_state_already_cleared
blocked_state_unknown
~~~

### 5. SafetyStopGuard

Prueft globale und modulbezogene Sperren.

Pflichtflags fuer spaetere Umsetzung:

~~~text
globalRecoverySafetyStop
alertRecoverySafetyStop
soundRecoverySafetyStop
overlayRecoverySafetyStop
bundleRecoverySafetyStop
~~~

Wenn ein Safety-Stop aktiv ist, darf keine Recovery-Aktion ausfuehren.

Ausgabe bei Fehler:

~~~text
blocked_global_safety_stop
blocked_alert_safety_stop
blocked_sound_safety_stop
blocked_overlay_safety_stop
blocked_bundle_safety_stop
~~~

### 6. StatusGuard

Prueft, ob produktive Systeme gerade aktiv sind oder Locks halten.

Pflichtpruefungen:

~~~text
kein laufender Alert
kein laufender Sound
kein aktiver Bundle-Lock
kein aktiver Visual-Wait-State, ausser gezielt stale-clear geplant
Queue-Zustand bekannt
Sound-State bekannt
Alert-State bekannt
Overlay-Client-/Heartbeat-State bekannt
~~~

Ausgabe bei Fehler:

~~~text
blocked_alert_running
blocked_sound_running
blocked_bundle_lock_active
blocked_visual_wait_active
blocked_queue_state_unknown
blocked_sound_state_unknown
blocked_alert_state_unknown
blocked_overlay_state_unknown
~~~

### 7. DuplicateGuard

Verhindert doppelte produktive Wirkung.

CAN-6.2 aktiviert noch keine produktive Recovery, definiert aber die Pflichtsperren fuer spaeter.

Pflichtschluessel:

~~~text
traceId
alertId
eventId
bundleId
soundJobId
overlaySourceId
overlayClientId
recoveryActionId
confirmTokenId
~~~

Pflichtregeln:

~~~text
recoveryActionId darf nur einmal erfolgreich ausfuehren
confirmTokenId darf nur einmal verwendet werden
traceId/alertId/eventId duerfen keinen Replay ohne separate Freigabe haben
soundJobId/bundleId duerfen keinen Sound-Replay ohne separate Freigabe haben
overlay retry bleibt blockiert, solange kein separates Retry-Konzept existiert
~~~

Ausgabe bei Fehler:

~~~text
blocked_duplicate_action
blocked_duplicate_confirm
blocked_duplicate_trace
blocked_duplicate_alert
blocked_duplicate_sound_job
blocked_duplicate_bundle
~~~

### 8. RateLimitGuard

Verhindert wiederholte manuelle Klicks oder Preflight-Spam.

Mindestregeln:

~~~text
Rate-Limit pro User
Rate-Limit pro Aktion
Rate-Limit pro Recovery-State
Cooldown nach blockierter Aktion
Cooldown nach erfolgreicher Aktion
~~~

Ausgabe bei Fehler:

~~~text
blocked_rate_limit_user
blocked_rate_limit_action
blocked_rate_limit_state
~~~

### 9. AuditGuard

Jede spaetere manuelle Recovery-Aktion muss auditierbar sein.

Mindestens zwei Audit-Punkte:

~~~text
preflight_requested
confirmed_action_result
~~~

Pflichtfelder:

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
Guard-Ergebnisse
Safety-Stop-Status
Duplikat-Pruefergebnis
Ergebnis
Fehlertext
~~~

Wenn Audit nicht geschrieben werden kann, muss die Aktion blockiert werden.

Ausgabe bei Fehler:

~~~text
blocked_audit_unavailable
blocked_audit_write_failed
~~~

### 10. RollbackGuard

Jede spaetere Aktion braucht eine klare Ruecknahme-/Clear-Regel.

Zulaessig fuer fruehe manuelle Recovery sind nur nicht-produktive oder stale-clear Aktionen.

Pflicht:

~~~text
vorheriger Zustand bekannt
neuer Zustand bekannt
Clear nur fuer stale States
keine Ausgabe-Wiederholung
keine Queue-Manipulation ohne Statusnachweis
Rollback-Anweisung dokumentiert
~~~

Ausgabe bei Fehler:

~~~text
blocked_rollback_missing
blocked_clear_not_stale
blocked_previous_state_unknown
~~~

## Geplanter Ablauf fuer spaetere manuelle Aktion

Nur als Vertrag, nicht umgesetzt:

~~~text
1. Dashboard fordert Preflight fuer Recovery-State an.
2. Backend prueft AuthGuard.
3. Backend prueft ActionMatrixGuard.
4. Backend liest aktuellen Recovery-State.
5. Backend prueft SafetyStopGuard, StatusGuard, DuplicateGuard und RateLimitGuard.
6. Backend schreibt Audit: preflight_requested.
7. Backend liefert Preflight-Ergebnis + Confirm-Anforderung zurueck.
8. Dashboard zeigt Bestaetigungsdialog mit IDs, Aktion und Risiko.
9. User bestaetigt.
10. Backend prueft ConfirmGuard und alle Guards erneut.
11. Backend fuehrt nur erlaubte nicht-produktive Aktion aus.
12. Backend schreibt Audit: confirmed_action_result.
13. Backend liefert Ergebnis zurueck.
~~~

## Routenklassen fuer spaetere Planung

CAN-6.2 legt nur Klassen fest, keine echten Routen.

| Routenklasse | Zweck | Status nach CAN-6.2 |
|---|---|---|
| Read-only Status | Diagnose anzeigen | bereits vorhandene Muster weiter nutzen |
| Preflight | Aktion pruefen, noch nicht ausfuehren | nur geplant |
| Confirmed Action | bestaetigte Aktion ausfuehren | nur geplant, keine produktive Ausgabe |
| Audit List | Recovery-Audit anzeigen | nur geplant |
| Safety-Stop Config | globale/module Stops anzeigen oder spaeter setzen | nur geplant |

## Aktionen nach Schutzvertrag

| Aktion | CAN-6.2 Bewertung | Benoetigte Guards |
|---|---|---|
| `mark_recovery_reviewed` | spaeter niedrigstes Risiko | Auth, Matrix, Confirm, State, Audit, RateLimit |
| `request_status_recheck` | spaeter niedriges Risiko, wenn read-only | Auth, Matrix, Confirm, State, Audit, RateLimit |
| `refresh_overlay_state` | nur read-only/State-Refresh planen | Auth, Matrix, Confirm, State, Overlay-Status, Audit |
| `clear_stale_visual_wait` | hoeheres Risiko, nur stale-clear | alle Guards, besonders Status/Duplicate/Rollback |
| `manual_unlock_stale_bundle` | hoeheres Risiko, nur stale-clear | alle Guards, besonders Bundle/Queue/Sound/Alert-Status |
| `manual_replay_alert` | hart blockiert | nicht planen |
| `manual_replay_sound` | hart blockiert | nicht planen |
| `auto_retry_overlay` | hart blockiert | nicht planen |
| `auto_recovery` | hart blockiert | nicht planen |

## Keine DB-Migration in CAN-6.2

CAN-6.2 definiert nur konzeptionelle Datenfelder.

Eine spaetere Umsetzung darf DB-Strukturen erst nach separater Pruefung planen.

Moegliche spaetere Tabellen/Strukturen nur als Konzept:

~~~text
recovery_action_audit
recovery_confirm_tokens
recovery_duplicate_locks
recovery_safety_settings
~~~

Regel fuer spaeter bleibt:

~~~text
Produktive SQLite-Datenbank niemals neu bauen, ueberschreiben oder ersetzen.
Schemaaenderungen nur sanft per CREATE TABLE IF NOT EXISTS / gepruefter Migration.
~~~

## Nicht geaendert

~~~text
Keine Backend-Dateien
Keine API-Routen
Keine Dashboard-Dateien
Keine Overlay-Dateien
Keine Config-Dateien
Keine DB-Dateien
Keine produktive Queue-/Sound-/Alert-/Overlay-Logik
~~~

## Tests fuer CAN-6.2

Da CAN-6.2 nur Doku/Planung ist:

~~~text
Keine node -c Tests noetig
Keine API-Tests noetig
Keine Dashboard-Tests noetig
Doku pruefen
ZIP-Pfade pruefen
Keine Code-Dateien im ZIP enthalten
~~~

## Ergebnis

CAN-6.2 definiert den Backend-Schutzvertrag fuer spaetere manuelle Recovery.

Es wurde weiterhin nichts aktiviert.

Naechster sinnvoller Schritt:

~~~text
CAN-6.3: Recovery-Audit- und Confirm-Token-Konzept planen
~~~

CAN-6.3 soll noch keine produktive Recovery aktivieren. Ziel waere nur, Audit-Events, Confirm-Token-Lebenszyklus und nicht-produktive Preflight-Regeln so konkret festzulegen, dass danach ein sicherer read-only/preflight Backend-Step geplant werden kann.

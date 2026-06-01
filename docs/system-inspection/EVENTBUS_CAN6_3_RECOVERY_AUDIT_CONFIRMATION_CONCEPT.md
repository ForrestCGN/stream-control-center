# EVENTBUS CAN-6.3 RECOVERY-AUDIT- UND CONFIRM-TOKEN-KONZEPT

Stand: 2026-06-01
Status: Plan / Audit- und Bestätigungs-Code-Konzept / keine Umsetzung
Marker: STEP_CAN6_3_RECOVERY_AUDIT_CONFIRMATION_CONCEPT

## Zweck

CAN-6.3 definiert das spaetere Audit- und Bestätigungs-Code-Konzept fuer manuelle Recovery-Aktionen.

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
CAN-6.2 hat den Backend-Schutzvertrag mit Guard-Kette definiert.

CAN-6.3 plant nur, wie spaeter Audit-Events, Preflight-Anzeige und Bestätigungs-Code zusammenhaengen duerfen.

Wichtig:

~~~text
Ein Bestätigungs-Code ist keine Berechtigung allein.
Ein Bestätigungs-Code ersetzt niemals AuthGuard, ActionMatrixGuard, SafetyStopGuard, StatusGuard, DuplicateGuard oder AuditGuard.
Ein Bestätigungs-Code darf nur eine vorher angezeigte, konkrete Aktion bestaetigen.
~~~

## Grundsatz

Spaetere manuelle Recovery darf nur als Zwei-Schritt-Ablauf geplant werden:

~~~text
1. Preflight / Preview
2. Confirm / Execute
~~~

Der Preflight erzeugt nur eine pruefbare Vorschau und optional ein kurzlebiges Bestätigungs-Code.
Der Confirm verbraucht dieses Bestätigungs-Code und muss alle Guards erneut pruefen.

Keine Aktion darf allein durch das Vorhandensein eines Codes produktiv wirken.

## Audit-Eventtypen

Mindestens folgende Audit-Eventtypen sind fuer spaetere Umsetzung einzuplanen:

~~~text
recovery.preflight.requested
recovery.preflight.allowed
recovery.preflight.blocked
recovery.confirm.created
recovery.confirm.presented
recovery.confirm.used
recovery.confirm.expired
recovery.confirm.reused_blocked
recovery.confirm.mismatch_blocked
recovery.action.blocked
recovery.action.started
recovery.action.succeeded
recovery.action.failed
recovery.action.rollback_suggested
recovery.action.rollback_done
recovery.action.reviewed
~~~

## Audit-Pflichtfelder

Jedes Audit-Event muss spaeter mindestens folgende Felder enthalten:

~~~text
timestamp
actorUserId
actorDisplayName
actorRole
action
recoveryState
recoveryReason
traceId
alertId
eventId
bundleId
soundJobId
overlayClientId
overlaySourceId
confirmCodeId
preflightId
oldState
newState
result
blockedReason
errorMessage
requestSource
requestIpOrSessionId
~~~

Wenn IDs nicht vorhanden sind, muessen sie explizit als null/none gespeichert werden.
Nicht vorhandene IDs duerfen nicht erraten werden.

## Bestätigungs-Code-Lebenszyklus

### 1. Bestätigungs-Code erzeugen

Ein Bestätigungs-Code darf nur nach erfolgreichem Preflight erzeugt werden.

Pflichtpruefungen vor Bestätigungs-Code-Erzeugung:

~~~text
AuthGuard erfolgreich
ActionMatrixGuard erfolgreich
RecoveryStateGuard erfolgreich
SafetyStopGuard erfolgreich
StatusGuard erfolgreich
DuplicateGuard erfolgreich
AuditGuard fuer preflight.allowed erfolgreich
~~~

Wenn eine Pruefung fehlschlaegt, wird kein Bestätigungs-Code erzeugt.

### 2. Bestätigungs-Code binden

Ein Bestätigungs-Code muss an konkrete Werte gebunden sein:

~~~text
actorUserId
actorRole
action
recoveryState
traceId / alertId / eventId / bundleId / soundJobId
overlayClientId / overlaySourceId falls relevant
preflightId
expiresAt
createdAt
oneTimeUse=true
~~~

Ein Bestätigungs-Code darf nicht fuer andere User, andere Aktionen oder andere IDs nutzbar sein.

### 3. Bestätigungs-Code anzeigen

Das Dashboard darf spaeter nur eine klare Bestaetigung anzeigen.

Pflichtanzeige:

~~~text
Aktion
betroffener Zustand
betroffene IDs
ob produktive Ausgabe passieren wuerde
was nicht passieren darf
Ablaufzeit des Codes
Warnung bei blockierten Replay-Aktionen
~~~

### 4. Bestätigungs-Code verwenden

Beim Confirm muss das Backend erneut pruefen:

~~~text
Bestätigungs-Code existiert
Bestätigungs-Code ist nicht abgelaufen
Bestätigungs-Code wurde noch nicht verwendet
Bestätigungs-Code passt zu User/Rolle/Aktion/IDs
Recovery-State ist noch derselbe
keine Safety-Stops aktiv
keine produktiven Locks aktiv
DuplicateGuard weiterhin sauber
AuditGuard kann action.started schreiben
~~~

Erst danach darf spaeter eine erlaubte manuelle Aktion starten.

### 5. Bestätigungs-Code verbrauchen

Ein Bestätigungs-Code muss vor oder atomar mit Aktionsstart als verwendet markiert werden.

Pflicht:

~~~text
confirmCodeId usedAt setzen
usedByUserId setzen
usedForAction setzen
usedResult setzen
Wiederverwendung hart blockieren
~~~

### 6. Bestätigungs-Code ablaufen lassen

Kurzlebige Codes sind Pflicht.

Geplante Default-Regel:

~~~text
Ablaufzeit: 60 bis 120 Sekunden
Keine automatische Verlaengerung
Bei Ablauf neuer Preflight noetig
Abgelaufene Codes duerfen keine Aktion starten
~~~

## Preflight-Antwortfelder

Eine spaetere Preflight-Route duerfte nur eine Vorschau liefern.

Pflichtfelder:

~~~text
ok
mode=preflight
productiveAction=false|true
action
allowed
blocked
blockedReasons
requiredRole
actorRole
recoveryState
recoveryReason
ids
currentLocks
safetyStops
duplicateStatus
auditStatus
rollbackPlan
confirmRequired
confirmCodeId
confirmExpiresAt
warnings
~~~

Auch wenn `productiveAction=true` geplant waere, darf der Preflight selbst niemals produktiv wirken.

## Bestätigungs-Code-Wiederverwendung verhindern

Pflichtregeln:

~~~text
confirmCodeId eindeutig
confirmCodeId nur einmal nutzbar
usedAt darf nicht leer sein, wenn Bestätigungs-Code verbraucht wurde
zweiter Confirm mit gleichem Bestätigungs-Code -> blocked_confirm_reused
abgelaufenes Bestätigungs-Code -> blocked_confirm_expired
abweichende Aktion -> blocked_confirm_mismatch
aenderter Recovery-State -> blocked_state_changed
~~~

## Blockierende Audit-Fehler

Folgende Audit-Fehler muessen spaeter Aktionen hart blockieren:

~~~text
Audit-Storage nicht erreichbar
Audit-Write fuer preflight.allowed fehlgeschlagen
Audit-Write fuer confirm.created fehlgeschlagen
Audit-Write fuer action.started fehlgeschlagen
Bestätigungs-Code nicht speicherbar
Bestätigungs-Code-Used-State nicht atomar speicherbar
Audit-Event ohne actorUserId
Audit-Event ohne action
Audit-Event ohne betroffene IDs, wenn IDs vorhanden sein muessten
~~~

Grund:

~~~text
Keine manuelle Recovery ohne nachvollziehbare Spur.
Keine manuelle Recovery ohne verbrauchbares Bestätigungs-Code.
~~~

## Spaetere Storage-/DB-Planung

CAN-6.3 migriert keine produktive DB.

Fuer spaetere Umsetzung waeren konzeptionell zwei Speicherbereiche sinnvoll:

~~~text
recovery_audit_events
recovery_confirmation_codes
~~~

### recovery_audit_events – konzeptionelle Felder

~~~text
id
timestamp
actor_user_id
actor_display_name
actor_role
event_type
action
recovery_state
recovery_reason
trace_id
alert_id
event_id
bundle_id
sound_job_id
overlay_client_id
overlay_source_id
preflight_id
confirmation_code_id
old_state_json
new_state_json
result
blocked_reason
error_message
request_source
request_session_id
created_at
~~~

### recovery_confirmation_codes – konzeptionelle Felder

~~~text
id
preflight_id
code_hash
actor_user_id
actor_role
action
recovery_state
bound_ids_json
created_at
expires_at
used_at
used_by_user_id
used_result
revoked_at
revoked_reason
~~~

Wichtig:

~~~text
Keine Klartext-Codes speichern.
Keine produktive DB ohne echte Schema-Pruefung migrieren.
Keine bestehende app.sqlite ersetzen oder neu bauen.
~~~

## Weiterhin hart blockiert

Auch nach CAN-6.3 bleiben folgende Aktionen hart blockiert:

~~~text
auto_replay_alert
manual_replay_alert
auto_replay_sound
manual_replay_sound
auto_retry_overlay
auto_recovery
~~~

Diese Aktionen duerfen nicht durch Bestätigungs-Code indirekt erlaubt werden.

## Nicht geändert

~~~text
Keine Backend-Logik geändert
Keine API-Logik geändert
Keine Dashboard-Buttons ergänzt
Keine neuen Routen ergänzt
Keine Recovery-Automatik aktiviert
Keine Queue-/Sound-/Overlay-Logik geändert
Keine DB-/Config-Migration
Keine Code-Dateien geändert
~~~

## Ergebnis CAN-6.3

CAN-6.3 definiert:

~~~text
Audit-Eventtypen
Audit-Pflichtfelder
Bestätigungs-Code-Lebenszyklus
Bestätigungs-Code-Bindung
Preflight-Antwortfelder
Bestätigungs-Code-Wiederverwendungsschutz
blockierende Audit-Fehler
konzeptionelle Storage-/DB-Struktur
~~~

## Nächster sinnvoller Schritt

~~~text
CAN-6.4: Read-only Recovery-Preflight-API-Konzept planen
~~~

Ziel von CAN-6.4:

~~~text
Noch kein Code.
Noch keine Route aktivieren.
Nur definieren, welche read-only Preflight-Daten spaeter eine API liefern duerfte und welche Guards dabei nur pruefen, aber nichts ausfuehren.
~~~

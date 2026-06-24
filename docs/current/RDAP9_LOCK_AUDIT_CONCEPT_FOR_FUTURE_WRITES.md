# RDAP9 Lock-/Audit-Konzept fuer spaetere Remote-Writes

Stand: RDAP9_LOCK_AUDIT_CONCEPT_FOR_FUTURE_WRITES  
Datum: 2026-06-24

## Ziel

RDAP9 dokumentiert das Lock-/Audit-/Confirm-/Permission-Konzept fuer spaetere produktive Schreibaktionen im Remote-Modboard.

Dieser Stand ist bewusst nur Planung und Dokumentation. Es werden keine produktiven Schreibfunktionen gebaut oder aktiviert.

## Ausgangsstand

Bestaetigter vorheriger Stand:

```text
RDAP8B_PERMISSION_RESOLVER_LIVE_DEPLOY_TEST_DOCS
```

Bestaetigter Live-Status bleibt:

```text
Remote-Modboard: https://mods.forrestcgn.de/api/remote/
Service: scc-remote-modboard.service
Intern: 127.0.0.1:3010
statusApiVersion: rdap8a.v1
readOnly: true
writeEnabled: false
authEnabled: false
loginEnabled: false
databaseWriteEnabled: false
agentActionsEnabled: false
productivePermissionEnforcementEnabled: false
```

RDAP9 aendert daran nichts.

## Nicht-Ziele / weiterhin verboten

RDAP9 aktiviert oder baut nicht:

```text
kein Login
kein Twitch-OAuth
kein Redirect zu Twitch
kein OAuth-Code-gegen-Token-Tausch
keine Cookies
keine Session-Erstellung
keine Session-Verlaengerung
kein last_seen_at Update
keine User-/Rollen-/Gruppen-Schreibrouten
keine DB-Writes
keine Remote-Writes
keine Agent-Actions
keine OBS-/Sound-/Overlay-/Command-Steuerung
keine produktive Permission-Erzwingung fuer Writes
keine Secrets im Repo, Frontend, Log oder Chat
keine bestehenden Routen entfernen
keine Funktionalitaet entfernen
```

## Grundprinzip fuer spaetere Writes

Spaetere produktive Schreibaktionen duerfen nur erlaubt werden, wenn alle benoetigten Schutzstufen erfolgreich sind:

```text
1. readOnly/writeEnabled globale Safety pruefen
2. Login/Session pruefen
3. Permission pruefen
4. ggf. Ressource/Version pruefen
5. ggf. Lock erwerben oder bestaetigen
6. ggf. Confirm/Safety fuer riskante Aktion pruefen
7. Audit-Start schreiben
8. eigentlichen Write ausfuehren
9. Audit-Ergebnis schreiben
10. Lock freigeben oder Heartbeat weiterfuehren
```

Wichtig: Das Frontend darf spaeter Buttons verstecken oder Hinweise anzeigen, aber niemals die Sicherheitsentscheidung treffen. Die verbindliche Entscheidung liegt immer im Backend.

## Schreibbereiche und Lock-Pflicht

### Lock erforderlich

Locks sind spaeter erforderlich, wenn mehrere Personen dieselbe fachliche Ressource bearbeiten koennen und parallele Bearbeitung Daten ueberschreiben oder widerspruechliche Zustaende erzeugen kann.

| Bereich | Beispiele | Lock-Typ | Warum Lock |
|---|---|---|---|
| Texte / Textvarianten | Chattexte, Overlaytexte, Discordtexte, Fehlermeldungen | Resource-Lock pro Modul/Text-Key oder Textgruppe | verhindert Ueberschreiben paralleler Bearbeitung |
| Configs / Moduleinstellungen | Loyalty-Core, Events, Shot-System, Alerts, HypeTrain, Geburtstage | Resource-Lock pro Modul/Config-Bereich | verhindert inkonsistente Config-Staende |
| Media-Zuordnungen | Sound-ID fuer Alert, Reveal-Video, Kategorie-Zuordnung | Resource-Lock pro Modul/Media-Bezug | verhindert falsche Sound-/Video-Zuordnung |
| Commands / Channel Points | Chatcommand, Reward-Mapping, Aktivierung, Cooldowns | Resource-Lock pro Command/Reward oder Modulbereich | verhindert widerspruechliche Trigger-Regeln |
| Overlay-/Layout-Editoren | Boxpositionen, Raster, Gewinner-Overlay, Event-Layouts | Resource-Lock pro Overlay/Layout | verhindert Positions-/Layout-Konflikte |
| Rollen-/Gruppen-/User-Zuweisungen | User bekommt Gruppe, Gruppe bekommt Rolle, Modulmatrix | exklusiver Admin-Lock pro Admin-Bereich | sicherheitskritisch, keine Parallelbearbeitung |
| Agent-/Action-Allowlist | erlaubte Agent-Kommandos, Aktionstypen | exklusiver Owner/Admin-Lock | sicherheitskritisch, kann lokale Systeme beeinflussen |

### Lock nicht zwingend erforderlich

Kein harter Lock ist spaeter noetig, wenn die Aktion atomar, append-only oder konfliktarm ist.

| Bereich | Beispiele | Schutz statt Lock |
|---|---|---|
| reine Test-/Diagnose-Reads | Status, Health, Routes, Permissions-Diagnose | Login/Permission, kein Write |
| append-only Logs | neue Logzeile, Diagnoseereignis | Audit/Rate-Limit, kein Edit-Lock |
| einfache Einmalaktionen | Sound testen, Overlay-Vorschau lokal anzeigen | Permission + Confirm, ggf. Action-Audit |
| Heartbeat/Presence | Editor-Heartbeat, Client online | kurzer TTL, kein fachlicher Lock |

## Lock-Modell

Vorhandene bzw. geplante Tabelle:

```text
dashboard_locks
```

Empfohlene Felder / Konzepte:

```text
id / lock_id
resource_type
resource_key
resource_version
scope
owner_user_id
owner_display_name
owner_role_snapshot
client_id
edit_session_id
acquired_at
heartbeat_at
expires_at
released_at
released_reason
force_taken_by_user_id
force_taken_at
force_take_reason
metadata_json
created_at
updated_at
```

### Resource-Typen

Beispiele:

```text
text.module_key
config.module_key
media.assignment
command.mapping
channel_reward.mapping
overlay.layout
admin.user
admin.group
admin.role
agent.allowlist
```

### Lock-Key

Der `resource_key` muss fachlich eindeutig, aber nicht geheim sein.

Beispiele:

```text
loyalty:core:config
stream_events:event_winner_overlay:layout
shot_alarm:messages
sound_system:media_assignment:1602
remote_auth:user:123
remote_auth:group:mods
remote_agent:allowlist
```

Keine Secrets, Tokens, Passwoerter oder ungefilterten Payloads in `resource_key` speichern.

## Lock-Ablauf

### Lock erwerben

Spaeterer Ablauf:

```text
POST /api/remote/locks/acquire
```

Backend prueft:

```text
writeEnabled=true
Login/Session gueltig
Permission fuer resource_type/resource_key vorhanden
kein aktiver Lock durch anderen User vorhanden
bestehender Lock abgelaufen oder freigegeben
```

Ergebnis:

```text
lock_id
resource_type
resource_key
owner_user_id
heartbeat_at
expires_at
```

### Heartbeat

Locks brauchen Heartbeat, damit Browserabsturz, Tab-Schliessen oder Verbindungsverlust nicht dauerhaft blockiert.

Empfehlung:

```text
Heartbeat-Intervall Frontend: ca. 20-30 Sekunden
Lock-TTL: ca. 90-120 Sekunden
```

Backend darf einen Lock als abgelaufen behandeln, wenn `heartbeat_at` zu alt ist oder `expires_at` ueberschritten wurde.

### Lock freigeben

Bei Speichern, Abbrechen oder Editor-Schliessen:

```text
POST /api/remote/locks/release
```

Freigabe darf nur durch Owner des Locks oder durch Owner/Admin-Override erfolgen.

### Owner/Admin-Übernahme

Owner/Admin darf spaeter einen fremden Lock uebernehmen, aber nur mit:

```text
Login/Session
passender Admin-/Owner-Permission
sichtbarem Warnhinweis im Frontend
confirmWrite=true oder vergleichbarer Confirm-Mechanik
Pflichtgrund fuer Uebernahme
Audit-Log-Eintrag
```

Audit muss speichern:

```text
alter Lock-Owner
neuer Lock-Owner
resource_type
resource_key
force_take_reason
Zeitpunkt
Ergebnis
```

### Version-/Lost-Update-Schutz

Locks allein reichen nicht. Beim Speichern sollte spaeter zusaetzlich eine Version geprueft werden.

Empfohlen:

```text
resource_version oder updated_at beim Laden merken
beim Speichern erwartete Version mitsenden
Backend speichert nur, wenn Version noch passt
bei Konflikt: 409 conflict_resource_changed
```

Damit werden auch Faelle abgefangen, in denen ein Lock abgelaufen und von jemand anderem neu erworben wurde.

## Audit-Modell

Vorhandene bzw. geplante Tabelle:

```text
dashboard_audit_log
```

Audit ist fuer produktive Remote-Modboard-Aktionen Pflicht, sobald Writes erlaubt werden.

Empfohlene Felder / Konzepte:

```text
id / audit_id
request_id
correlation_id
actor_user_id
actor_login
actor_display_name
actor_roles_snapshot_json
source
ip_hash
user_agent_hash
action
resource_type
resource_key
permission_checked
permission_result
confirm_required
confirm_provided
lock_required
lock_id
lock_result
status
error_code
before_summary_json
after_summary_json
changed_fields_json
safe_metadata_json
created_at
completed_at
```

### Audit-Status

```text
started
allowed
blocked
confirmed
succeeded
failed
rejected
conflict
lock_denied
permission_denied
safety_denied
```

### Keine Secrets / keine sensiblen Rohdaten

Audit darf niemals speichern:

```text
Twitch Client Secret
OAuth Codes
Access Tokens
Refresh Tokens
Session Tokens
Cookie-Werte
Passwoerter
vollstaendige ENV-Dateien
ungekuerzte Request-Header
ungefilterte Request-Bodies
private Keys
DB-Passwoerter
```

Stattdessen:

```text
Secret vorhanden: ja/nein
Secret geaendert: ja/nein
Token ausgestellt: ja/nein
Hash/Fingerprint falls noetig, niemals Klarwert
Feldname geaendert, Wert maskiert
```

Beispiele fuer sichere Audit-Zusammenfassungen:

```json
{
  "changedFields": ["enabled", "mediaId", "cooldownSeconds"],
  "before": { "enabled": false, "mediaId": 1602, "cooldownSeconds": 600 },
  "after": { "enabled": true, "mediaId": 1602, "cooldownSeconds": 900 }
}
```

Beispiele fuer maskierte Werte:

```json
{
  "field": "TWITCH_CLIENT_SECRET",
  "changed": true,
  "oldValue": "***",
  "newValue": "***"
}
```

## Confirm-/Safety-Regeln

Confirm ist fuer riskante oder schwer rueckgaengig zu machende Aktionen Pflicht.

### Confirm erforderlich

```text
Rollen-/Gruppen-/User-Rechte aendern
Owner/Admin-Rechte vergeben oder entfernen
Agent-Allowlist aendern
Agent-Action ausloesen
OBS/Sound/Overlay/Command-Steuerung ausloesen
produktive Config aktivieren/deaktivieren, die live den Stream beeinflusst
Channel-Point-Reward-Verknuepfung aendern
Command aktivieren/deaktivieren
Media-Loeschung oder kritische Media-Zuordnung
Lock-Override/Force-Takeover
Massenaktionen / Bulk-Updates
```

### Confirm nicht zwingend erforderlich

```text
reine Reads
Vorschau ohne Live-Auswirkung
lokale Formularvalidierung
Editor-Heartbeat
Lock erwerben/freigeben durch Owner
```

### Confirm-Form

Fuer einfache riskante Aktionen reicht spaeter `confirmWrite=true` nicht immer. Fuer sehr kritische Aktionen sollte ein eindeutiger Confirm-Kontext verlangt werden.

Beispiele:

```text
confirmWrite=true
confirmAction=agent.allowlist.update
confirmResource=remote_agent:allowlist
confirmText=ALLOW AGENT ACTIONS
```

Das verhindert versehentliche oder falsch wiederverwendete Confirm-Parameter.

## Permission + Lock + Audit Zusammenspiel

### Standard-Write

```text
1. Request-ID erzeugen
2. globale Safety pruefen
3. Session lesen und validieren
4. User-Kontext lesen
5. Permission pruefen
6. Audit started
7. Lock pruefen/erwerben oder vorhandenen Lock validieren
8. Confirm pruefen, falls erforderlich
9. Version pruefen
10. Write ausfuehren
11. Audit succeeded/failed
12. Lock freigeben oder aktiv halten
13. Antwort ohne Secrets liefern
```

### Reihenfolge bei Ablehnung

Auch abgelehnte produktive Schreibversuche sollen spaeter auditierbar sein, aber ohne sensible Rohdaten.

Empfehlung:

```text
Safety blockiert -> Audit optional minimal, falls keine Session noetig
keine Session -> Audit minimal als anonymous_denied, rate-limit beachten
keine Permission -> Audit permission_denied
Lock blockiert -> Audit lock_denied
Confirm fehlt -> Audit confirm_required
Version-Konflikt -> Audit conflict
```

## Spaetere API-Bereiche mit Write-Schutz

Diese Bereiche duerfen spaeter erst nach Login + Permission + ggf. Lock + Audit + Confirm freigegeben werden:

```text
/api/remote/admin/users/*
/api/remote/admin/groups/*
/api/remote/admin/roles/*
/api/remote/admin/permissions/*
/api/remote/settings/*
/api/remote/modules/*/config
/api/remote/modules/*/texts
/api/remote/modules/*/commands
/api/remote/modules/*/channel-rewards
/api/remote/modules/*/media-assignments
/api/remote/overlays/*/layout
/api/remote/agent/actions/*
/api/remote/agent/allowlist/*
```

## Rollen-/Rechte-Leitplanken

Grundregeln bleiben:

```text
Owner/Admin entscheidet ueber System-/Security-/User-/Rollenbereiche.
Twitch-Rollen sind nur Kontext, keine alleinige Dashboard-Berechtigung.
VIP gibt keine Dashboard-Grundrechte.
sound_profi bekommt nur fachliche Sound-/Media-/Command-Rechte, keine System-/Security-/Owner-Rechte.
Backend entscheidet Rechte, Frontend ist Anzeige.
```

## Sound-Profi Beispiel

`sound_profi` darf spaeter moeglicherweise:

```text
Media hochladen/bearbeiten/loeschen, soweit freigegeben
Sounds testen
Sounds Modulen zuordnen
Soundbezogene Commands/Kanalpunkte-Aktionen bearbeiten
```

`sound_profi` darf nicht automatisch:

```text
User/Rollen/Gruppen bearbeiten
Security-/OAuth-/Session-Einstellungen aendern
Agent-Allowlist bearbeiten
freie Agent-Actions ausloesen
OBS global steuern
Secrets sehen oder bearbeiten
```

## Lock-/Audit-UX im Dashboard

Spaeteres Frontend-Verhalten:

```text
Beim Oeffnen eines Editors Lock anfordern.
Wenn Lock frei: Bearbeitung erlauben.
Wenn Lock belegt: lesend oeffnen und Besitzer + Ablauf anzeigen.
Heartbeat sichtbar/diagnostizierbar halten.
Bei ablaufendem Lock warnen.
Bei Speichern Version pruefen.
Bei Konflikt keine Daten ueberschreiben, sondern neu laden/vergleich anbieten.
Owner/Admin kann Lock mit Grund uebernehmen.
Jede Uebernahme wird auditierbar angezeigt.
```

## Retention / Aufbewahrung

Audit-Logs brauchen spaeter konfigurierbare Aufbewahrung.

Empfehlung:

```text
Standard-Retention: 90 Tage
Security-/Admin-Aktionen: laenger oder separat konfigurierbar
Debug-/Diagnose-Audit: kuerzer moeglich
Loeschung nur per geplanter Maintenance-Route/Job mit Audit
```

Keine Retention hart codieren. Spaeter in Config/DB-Einstellung abbilden.

## Offene Punkte fuer spaetere Implementierung

Vor einem Code-Step muessen echte Tabellen/Spalten erneut geprueft werden:

```text
dashboard_locks
dashboard_audit_log
remote_users
remote_roles
remote_groups
remote_permissions
remote_user_groups
remote_group_roles
remote_role_permissions
remote_sessions
```

Ausserdem vor Code-Step klaeren:

```text
exakte Lock-API-Routen
exakte Audit-Helper-Struktur
ob bestehende Helper fuer Request-ID/Logging genutzt werden koennen
wie MariaDB-Transaktionen genutzt werden
welche Actions zuerst produktiv schreibfaehig werden duerfen
wie Confirm-Parameter standardisiert werden
wie Frontend-Lock-Heartbeat technisch umgesetzt wird
```

## Ergebnis RDAP9

RDAP9 ist ein reiner Konzept-/Doku-Step.

```text
RDAP9_LOCK_AUDIT_CONCEPT_FOR_FUTURE_WRITES
```

Naechster sinnvoller Schritt nach RDAP9:

```text
RDAP10_LOCK_AUDIT_IMPLEMENTATION_PLAN_READONLY
```

RDAP10 sollte weiterhin nur planen oder maximal read-only/diagnostisch vorbereiten, solange kein separater Sicherheits-Scope fuer produktive Writes freigegeben wurde.

# RDAP16 - Handoff / Visible Next

Stand: RDAP16_HANDOFF_VISIBLE_NEXT
Datum: 2026-06-24

## Zweck

RDAP16 konsolidiert den aktuellen RDAP-/Remote-Modboard-Stand und bereitet den naechsten Chat vor.

Der naechste Fokus soll sichtbarer Fortschritt sein:

```text
Remote-Modboard UI / erste sichtbare Dashboard-Seite
```

RDAP16 ist ein reiner Doku-/Handoff-Step.

Keine Backend-Dateien, keine DB-Aenderung, keine Migration, keine Server-Schritte.

## Aktueller bestaetigter Stand

Bis RDAP15 abgeschlossen:

```text
RDAP15_LOCK_RESOURCE_TYPE_DECISION_PLAN
```

Wichtige Live-Basis:

```text
Remote-Modboard public read-only:
https://mods.forrestcgn.de/api/remote/

Interner Service:
127.0.0.1:3010

Systemd:
scc-remote-modboard.service
```

## Bisher erreicht

### Remote-Modboard Read-only Basis

Bestaetigt:

- Remote-Modboard laeuft public read-only.
- Service laeuft intern auf `127.0.0.1:3010`.
- Public Subdomain ist `mods.forrestcgn.de`.
- OAuth/Login/Writes bleiben deaktiviert.

### Permission-/Auth-Diagnose

Vorhanden/read-only:

```text
GET /api/remote/auth/permissions/check?permission=remote.view
GET /api/remote/auth/me
GET /api/remote/auth/session-status
GET /api/remote/auth/model
```

Ohne Login/Cookie bleibt Permission-Check korrekt:

```text
loggedIn=false
allowed=false
reason=auth_disabled_or_not_logged_in
```

### OAuth bleibt deaktiviert

Weiterhin:

```text
GET /api/remote/auth/twitch/start    -> HTTP 403
GET /api/remote/auth/twitch/callback -> HTTP 403
```

Keine Redirects, keine Cookies, keine Sessions, kein Token-Tausch.

### Lock-/Audit-Diagnose live

Vorhanden/read-only:

```text
GET /api/remote/lock-audit/status
GET /api/remote/lock-audit/status?db=1
```

### Schema-Adapter live

Vorhanden/read-only:

```text
GET /api/remote/lock-audit/schema-adapter/status
GET /api/remote/lock-audit/schema-adapter/status?db=1
```

Live bestaetigt:

```text
statusApiVersion=rdap14.v1
readOnly=true
writeEnabled=false
databaseWriteEnabled=false
schemaAdapterPrepared=true
lockSchemaAdapterPrepared=true
auditSchemaAdapterPrepared=true
lockAcquireEnabled=false
auditInsertEnabled=false
```

### resourceType Entscheidung

RDAP15 Entscheidung:

```text
Hybrid
```

Kurzfristig:

```text
resource_key muss typisiert geplant werden:
<resourceType>:<namespace>:<id>
```

Beispiele:

```text
text:message:welcome
config:module:loyalty
media:sound:1602
overlay:layout:event_winner
command:twitch:clip
```

Mittelfristig:

```text
resource_type als eigene DB-Spalte nur mit eigenem Scope, Backup und Rollback planen.
```

## Tooling-Fix

`stepdone.cmd` wurde angepasst, damit `remote-modboard/` kuenftig mitgenommen wird.

Wichtig:

- kein `git add .`
- `remote-modboard/` wird als erlaubter Projektbereich behandelt
- JS-Syntaxcheck erkennt `remote-modboard/backend/*.js`
- wenn nach Commit/Push relevante Projektdateien offen bleiben, soll nicht mehr falsch `[ok]` gemeldet werden

## Server-Regel

Nach `systemctl restart` immer Readiness-Wait/Retry vor API-Tests.

Bestaetigt aus RDAP14B:

```text
ready_after=2s
```

Regel:

```text
Restart -> warten bis Statusroute/Port bereit -> erst dann curl/API-Tests
```

## Strukturregel

Wenn fachlich passend:

```text
vorhandene Module/Services/Routen erweitern
```

Neue Module nur, wenn Verantwortung wirklich nicht sauber in vorhandene Struktur passt.

## Weiterhin verboten

Bis eigener Scope:

- kein Login aktivieren
- kein Twitch-OAuth aktivieren
- keine Cookies setzen
- keine Sessions erstellen
- keine Session-Verlaengerung
- kein last_seen_at Update
- keine produktiven DB-Writes
- keine Migration
- keine Remote-Writes
- keine Agent-Actions
- keine OBS-/Sound-/Overlay-/Command-Steuerung
- keine Secrets ins Repo, Frontend, Logs oder Chat

## Naechstes Ziel: sichtbarer Fortschritt

Der naechste Chat soll nicht weitere kleine Fundament-Dokus stapeln.

Empfohlenes Ziel:

```text
RDAP_UI1_REMOTE_MODBOARD_FIRST_VISIBLE_PAGE
```

Zweck:

- erste sichtbare Remote-Modboard-Webseite
- read-only Status-Dashboard
- keine Login-Aktivierung
- keine Writes
- keine Agent-Actions
- nur Anzeigen vorhandener Diagnose-Daten

## Vorschlag UI1

Erste sichtbare Seite:

```text
remote-modboard/frontend oder htdocs remote ui Bereich pruefen
```

Erst echte Dateien pruefen, nicht raten.

Mögliche Anzeige-Bloecke:

1. Service-Status
   - ok
   - readOnly
   - writeEnabled
   - statusApiVersion
   - service online

2. Sicherheit
   - Login disabled
   - OAuth disabled
   - Writes disabled
   - Agent-Actions disabled

3. Lock-/Audit Diagnose
   - schemaAdapterPrepared
   - locks compatibleForRead
   - locks compatibleForWrite false
   - locks missingForWrite resourceType
   - audit compatibleForRead
   - audit compatibleForWrite false

4. Routen-Uebersicht
   - health
   - status
   - routes
   - auth/me
   - permissions/check
   - lock-audit/status
   - schema-adapter/status

5. Hinweisbox
   - "Read-only Diagnosemodus"
   - "Keine Steuerung aktiv"
   - "Keine Login-/OAuth-Aktivierung"

## UI1 darf nicht

- Login UI aktivieren
- OAuth-Button aktivieren
- Cookies setzen
- Sessions erstellen
- POST/PUT/PATCH/DELETE bauen
- Agent-Actions ausloesen
- OBS/Sound/Overlay/Command steuern
- Secrets anzeigen
- DB-Writes ausfuehren

## Vorbereitung fuer neuen Chat

Im neuen Chat zuerst lesen:

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
docs/current/RDAP16_HANDOFF_VISIBLE_NEXT.md
docs/current/NEXT_CHAT_PROMPT_RDAP_UI1.txt
```

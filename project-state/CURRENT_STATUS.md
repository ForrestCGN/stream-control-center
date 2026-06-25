# CURRENT_STATUS

Stand: RDAP31B_ADMIN_NOTE_WRITE_BACKEND_DISABLED_UI_LIVE_CONFIRMED_DOCS  
Datum: 2026-06-25  
Projekt: `stream-control-center` / Remote-Modboard

## Produktiv

```text
URL: https://mods.forrestcgn.de/
Live-Pfad: /opt/stream-control-center/remote-modboard
Service: scc-remote-modboard.service
Repo: https://github.com/ForrestCGN/stream-control-center
Branch: dev
Lokales Repo: D:\Git\stream-control-center
```

## Bestaetigter Stand

```text
RDAP25 Login/OAuth/Session funktioniert.
RDAP26 Option B DB-Rollen/Permissions funktioniert.
RDAP27 echte read-only Admin-Notiztext-Route funktioniert.
RDAP28 read-only Admin-Notiz-UI funktioniert.
RDAP29/RDAP29B MariaDB-Testnotiz ist live sichtbar.
RDAP30 Write-Scope ist geplant.
RDAP31 Backend-Write-Routen sind als gesperrte Validierungsrouten live.
RDAP31B Live-Deploy und Sicherheitschecks sind dokumentiert.
```

## RDAP31 live bestaetigt

```text
Service active/running
/api/remote/routes -> statusApiVersion rdap_admin_note_write31.v1
adminUsersAdminNoteWriteDisabled vorhanden
writeEnabled false
productiveWritesEnabled false
writesStillBlocked true
uiWriteButtonsEnabled false
```

Tests:

```text
Ohne Confirm -> HTTP 400 confirm_write_required
Mit Body-Confirm ohne Session -> HTTP 401 not_logged_in_or_session_invalid
DB note_count bleibt 1
Keine neue Notiz geschrieben
```

Befund:

```text
confirmWrite=true per Query wurde nicht erkannt.
confirmWrite im JSON-Body funktioniert.
```

## Weiterhin blockiert

```text
Admin-Notiz produktiv schreiben
Admin-Notiz produktiv aendern
Admin-Notiz produktiv deaktivieren
Permission admin.users.note.write vergeben
UI-Schreibbuttons
Physisches Delete
Audit-Inserts
Lock acquire/heartbeat/release/force-takeover
User freigeben/sperren
Rollen vergeben/entziehen
Gruppen/Freigaben setzen/entfernen
Sessions widerrufen
Agent-Actions
OBS-/Sound-/Overlay-/Command-Steuerung
Community-Seiten-Anbindung fuer Admin-Notizen
```

# CURRENT_STATUS

Stand: RDAP32_ADMIN_AUDIT_LOCK_WRITE_FOUNDATION_PLAN  
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
RDAP32 Audit-/Lock-Write Foundation ist geplant.
```

## RDAP32 Ergebnis

```text
Audit-/Lock-Writes werden nicht sofort produktiv gebaut.
Zuerst sollen Audit-/Lock-Schema und Status read-only sichtbar gemacht werden.
Body-Confirm ist produktiver Standard-Kandidat.
Query-Confirm wurde nicht erkannt und wird bis zur Klaerung nicht als Standard genutzt.
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

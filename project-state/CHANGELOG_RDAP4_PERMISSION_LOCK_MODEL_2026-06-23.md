# CHANGELOG RDAP4 Permission-/Lock-Modell

Datum: 2026-06-23  
Stand: RDAP4.DOC1 / Permission- und Lock-Modell dokumentiert

## Art des Steps

Reiner Doku-/Planungsstep.

Keine Runtime-Änderung.

## Neu

- `docs/current/REMOTE_DASHBOARD_RDAP4_PERMISSION_LOCK_MODEL.md`

Dokumentiert wurden:

- Rollenmodell
- Permission-Namensschema
- Schutzstufen
- Modulfreigaben
- `resourceKey`-Schema
- `resourceType`
- `resourceVersion`
- Edit-Session-Modell
- Lock-Modell
- Lock-Heartbeat
- Lock-Timeout
- Lock-Übernahme
- Agent-Verlust während Bearbeitung
- Audit-Events für Edit-Sessions und Locks
- Version-Konfliktverhalten
- gemeinsamer Lock-/Edit-Session-Mechanismus für lokales Dashboard und Remote-Modboard

## Aktualisiert

- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/FILES.md`
- `project-state/CHANGELOG.md`

## Nicht geändert

- kein Backend-Code
- kein produktives Dashboard
- kein Frontend-Code
- kein Agent-Code
- keine DB-Änderung
- keine Projekt-Config-Änderung
- keine OBS-Änderung
- keine Runtime-Datei
- kein Reverse Proxy
- kein systemd-Service
- kein Node-Neustart nötig

## Nächster sinnvoller Schritt

DASHUI2 / Frontend-Tech-Entscheidung konkretisieren.

Dabei weiterhin nur planen, bis ein separater Umsetzungsstep freigegeben wird.

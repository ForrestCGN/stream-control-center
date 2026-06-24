# RDAP_ADMIN_USERS1_READONLY_OVERVIEW

Stand: 2026-06-24

## Ziel

Der Admin-Bereich des Remote-Modboards bekommt eine erste read-only Übersicht für User, Rollen, Gruppen und Sessions.

## Geändert

```text
remote-modboard/backend/src/services/auth-db-read.service.js
remote-modboard/backend/public/index.html
remote-modboard/backend/public/assets/remote-modboard.js
remote-modboard/backend/public/assets/remote-modboard.css
docs/current/RDAP_ADMIN_USERS1_READONLY_OVERVIEW.md
```

## Funktion

- Neuer Sidebar-Eintrag: `Admin -> User & Rollen`
- Zeigt read-only:
  - bekannte Dashboard-User aus `dashboard_users`
  - Rollen/Gruppen pro User, soweit vorhanden
  - User-/Session-/Rollen-/Permission-Zähler
  - Rollenmodell
  - Gruppenmodell
- `GET /api/remote/auth/model` bleibt read-only und wird um User-/Session-Daten erweitert.

## Nicht enthalten

- keine User freigeben/sperren
- keine Rollen vergeben/entziehen
- keine Sessions widerrufen
- keine Admin-Write-Funktionen
- keine DB-Migration
- keine Remote-Actions
- keine OBS-/Sound-/Overlay-/Command-Steuerung

## Nächste Ausbaustufe

Später eigener Write-Scope für Admin-Userverwaltung:

- Owner/Admin-Permission-Middleware
- Confirm-Write
- Locking
- Audit-Log
- klare Rollback-/Backup-Regeln

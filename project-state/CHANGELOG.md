# CHANGELOG

## 2026-06-24 - RDAP10 / Lock-/Audit-Implementierungsplan read-only dokumentiert

Status: Doku-/Plan-Step vorbereitet

Geaendert:

- `docs/current/START_HERE_FOR_NEW_CHAT.md`
- `docs/current/RDAP10_LOCK_AUDIT_IMPLEMENTATION_PLAN_READONLY.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/FILES.md`
- `project-state/CHANGELOG.md`

Dokumentiert:

- konkrete spaetere Lock-/Audit-Service-Struktur
- geplante read-only Diagnose-Routen fuer Locks/Audit/Write-Safety
- Permission-Gate-Reihenfolge fuer spaetere Writes
- Confirm-/Safety-Gate-Regeln
- Request-/Correlation-ID-Konzept
- MariaDB-Transaktions-/Fehlerfall-Konzept
- Version-/Lost-Update-Schutz
- Testplan fuer spaetere read-only Diagnose
- Backup-/Rollback-Regeln
- empfohlene Folge ab RDAP11

Nicht geaendert:

- kein Backend-Code
- kein produktiver Login
- keine Twitch-OAuth-Secrets ins Repo
- kein Redirect zu Twitch
- kein OAuth-Code-gegen-Token-Tausch
- kein Cookie gesetzt
- keine Session erstellt/verlaengert
- kein `last_seen_at` Update
- keine DB-Writes
- keine User-/Rollen-/Gruppen-Schreibroute
- keine Remote-Writes
- keine Agent-Actions
- keine OBS-/Sound-/Overlay-/Command-Steuerung
- keine produktive Permission-Erzwingung fuer Writes
- kein `moduleBuild`-Kosmetik-Fix in `remote-modboard/backend/server.js`

Naechster sinnvoller Schritt:

- `RDAP11_LOCK_AUDIT_READONLY_DIAGNOSTIC`

## 2026-06-24 - RDAP9 / Lock-/Audit-Konzept fuer spaetere Writes dokumentiert

Status: Doku-/Plan-Step vorbereitet

Geaendert:

- `docs/current/START_HERE_FOR_NEW_CHAT.md`
- `docs/current/RDAP9_LOCK_AUDIT_CONCEPT_FOR_FUTURE_WRITES.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/FILES.md`
- `project-state/CHANGELOG.md`

Dokumentiert:

- Lock-Pflicht fuer spaetere bearbeitbare Ressourcen wie Texte, Configs, Media-Zuordnungen, Commands, Channel-Point-Mappings, Overlay-Layouts, Rollen-/Gruppen-/User-Verwaltung und Agent-Allowlist.
- Audit-Pflicht fuer spaetere produktive Writes, Lock-Overrides, Permission-/Rollen-Aenderungen, Confirm-pflichtige Aktionen und Agent-Actions.
- Nutzungskonzept fuer `dashboard_locks` mit Resource-Typ, Resource-Key, Lock-ID, Owner, Heartbeat, Timeout, Freigabe und Owner/Admin-Uebernahme.
- Nutzungskonzept fuer `dashboard_audit_log` mit Actor, Action, Resource, Permission-Ergebnis, Lock-Ergebnis, Confirm-Status, Erfolg/Fehler und sicheren Zusammenfassungen.
- Confirm-/Safety-Regeln fuer riskante Aktionen.
- Zusammenspiel von Login, Session, Permission, Lock, Version-Schutz, Confirm und Audit.
- Regel: Audit speichert keine Secrets, keine Tokens, keine Cookies, keine Passwoerter und keine ungefilterten Rohdaten.
- Naechster sinnvoller Schritt: `RDAP10_LOCK_AUDIT_IMPLEMENTATION_PLAN_READONLY`.

Nicht geaendert:

- kein Backend-Code
- kein produktiver Login
- keine Twitch-OAuth-Secrets ins Repo
- kein Redirect zu Twitch
- kein OAuth-Code-gegen-Token-Tausch
- kein Cookie gesetzt
- keine Session erstellt/verlaengert
- kein `last_seen_at` Update
- keine DB-Writes
- keine User-/Rollen-/Gruppen-Schreibroute
- keine Remote-Writes
- keine Agent-Actions
- keine OBS-/Sound-/Overlay-/Command-Steuerung
- keine produktive Permission-Erzwingung fuer Writes
- kein `moduleBuild`-Kosmetik-Fix in `remote-modboard/backend/server.js`

## 2026-06-24 - RDAP8B / Permission Resolver Live Deploy/Test dokumentiert

Status: live deployed, getestet und dokumentiert

Geaendert:

- `docs/current/START_HERE_FOR_NEW_CHAT.md`
- `docs/current/RDAP8B_PERMISSION_RESOLVER_LIVE_DEPLOY_TEST_DOCS.md`
- `docs/current/NEXT_CHAT_PROMPT_RDAP9.txt`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/FILES.md`
- `project-state/CHANGELOG.md`

Dokumentiert:

- RDAP8A wurde aus GitHub/dev auf `web.cgn.community` deployed.
- Deploy-Clone: `/opt/stream-control-center/_deploy_tmp/RDAP8A_READONLY_PERMISSION_RESOLVER_DIAGNOSTIC_20260624_080242`.
- Backup: `/var/backups/stream-control-center/RDAP8A_READONLY_PERMISSION_RESOLVER_DIAGNOSTIC_remote-modboard-backend_20260624_080242.tar.gz`.
- `npm install --omit=dev` war erfolgreich.
- `npm run check` war erfolgreich.
- `scc-remote-modboard.service` wurde neu gestartet und ist `active`.
- `GET /api/remote/status` meldet `statusApiVersion=rdap8a.v1`.
- `GET /api/remote/routes` enthaelt `GET /api/remote/auth/permissions/check`.
- `GET /api/remote/auth/permissions/check?permission=remote.view` liefert ohne Cookie `allowed=false` und `reason=auth_disabled_or_not_logged_in`.
- OAuth Start und Callback bleiben HTTP 403.
- Kein Redirect, kein Set-Cookie, kein Token-Tausch, keine Session-Erstellung, keine DB-Writes, keine Agent-Actions.
- `jq` wurde nach dem Test installiert und ist nur ein optionales Anzeige-/Filtertool fuer JSON.

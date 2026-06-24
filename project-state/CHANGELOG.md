# CHANGELOG

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

Nicht geaendert:

- kein Backend-Code in RDAP8B
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
- kein `moduleBuild`-Kosmetik-Fix in `remote-modboard/backend/server.js`

Naechster Schritt:

- `RDAP9_LOCK_AUDIT_CONCEPT_FOR_FUTURE_WRITES`

## 2026-06-24 - RDAP8A / Read-only Permission Resolver Diagnostic vorbereitet

Status: Code-/Doku-Step vorbereitet

Geaendert:

- `remote-modboard/backend/package.json`
- `remote-modboard/backend/README.md`
- `remote-modboard/backend/src/routes/auth-status.routes.js`
- `remote-modboard/backend/src/routes/status.routes.js`
- `remote-modboard/backend/src/routes/routes.routes.js`
- `remote-modboard/backend/src/services/auth-permission-read.service.js`
- `remote-modboard/backend/src/security/permissions.js`
- `docs/current/RDAP8A_READONLY_PERMISSION_RESOLVER_DIAGNOSTIC.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/FILES.md`
- `project-state/CHANGELOG.md`

Dokumentiert:

- RDAP8A bereitet einen read-only Permission-Resolver fuer das Remote-Modboard vor.
- Neue Diagnose-Route: `GET /api/remote/auth/permissions/check?permission=remote.view`.
- Ohne aktiven Login bleibt `allowed=false`.
- Ohne Cookie ist `reason=auth_disabled_or_not_logged_in` erwartet.
- Mit diagnostisch gueltiger Session darf der Resolver Rollen/Gruppen/Permissions read-only lesen, bleibt aber produktiv gesperrt.
- Status-/Routes-Ausgaben melden `statusApiVersion=rdap8a.v1`.
- Naechster sinnvoller Schritt: `RDAP8B_PERMISSION_RESOLVER_LIVE_DEPLOY_TEST_DOCS`.

Nicht geaendert:

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
- kein `moduleBuild`-Kosmetik-Fix in `remote-modboard/backend/server.js`

## 2026-06-24 - RDAP8 / Permission Check Middleware Plan dokumentiert

Status: Doku-/Plan-Step vorbereitet

Geaendert:

- `docs/current/RDAP8_PERMISSION_CHECK_MIDDLEWARE_PLAN.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/FILES.md`
- `project-state/CHANGELOG.md`

Dokumentiert:

- RDAP8 plant die spaetere Permission-Check-Middleware fuer Remote-Modboard-Bereiche.
- Backend entscheidet Rechte, Frontend ist nur Anzeige.
- Bestehendes Rollen-/Gruppen-/Permission-Modell bleibt Grundlage.
- Rollen und Gruppen bleiben getrennt.
- `sound_profi` bekommt keine globalen Grundrechte.
- Produktive Writes brauchen spaeter Permission + Lock + Audit + Confirm/Safety.

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
- kein `moduleBuild`-Kosmetik-Fix in `remote-modboard/backend/server.js`

## 2026-06-23 - RDAP7I / Session Store Read-only Validation Layer live bestaetigt

Status: live deployed und dokumentiert

Dokumentiert:

- RDAP7I ist nach GitHub/dev gepusht.

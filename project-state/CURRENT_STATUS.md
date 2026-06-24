# CURRENT STATUS - stream-control-center

Stand: RDAP_ADMIN_USERS5_PERMISSION_READ_DIAGNOSTIC
Datum: 2026-06-24

## Aktueller bestaetigter RDAP-/Remote-Modboard-Stand

Remote-Modboard/Auth:

- `mods.forrestcgn.de` laeuft.
- Twitch Login funktioniert live.
- Dashboard-Zugriff wird serverseitig geprueft.
- ForrestCGN kann sich anmelden und das Dashboard nutzen.
- EngelCGN kann nach Allowlist-Erweiterung mittesten und ist als User sichtbar.
- Avatar oben rechts wird angezeigt.
- Profilpanel oben rechts ist vorhanden.
- `Profil aktualisieren` synchronisiert eigene Twitch-Daten.
- Login-/Denied-Layout ist zentriert.
- Dashboard-Karten/Grid-Abstaende sind nach V13-Fix sauberer.
- Topbar-Ausloggen wurde entfernt; Logout bleibt im Profilpanel.
- Profilpanel ist auf die Self-Service-Aktionen `Profil aktualisieren` und `Ausloggen` reduziert.
- Admin -> User & Rollen zeigt eine read-only Uebersicht bekannter Dashboard-User, Rollen, Gruppen, Permissions und Sessions.

## Aktueller Arbeitsstand

`RDAP_ADMIN_USERS5_PERMISSION_READ_DIAGNOSTIC` ist der naechste einzuspielende/abzuschliessende Step.

Gebaut:

- neue read-only Diagnose-Route `GET /api/remote/admin/users/permission-diagnostic`,
- neuer Service `admin-user-permission-read.service.js`,
- neue Route-Datei `admin-users.routes.js`,
- Registrierung in `app.js`,
- Eintrag in `/api/remote/routes`,
- Doku/Projektstatus aktualisiert.

## Zweck RDAP5

RDAP5 prueft serverseitig diagnostisch:

- gueltige Session,
- Dashboard-Zugriff,
- Actor-Rollen,
- Actor-Gruppen,
- Owner/Admin-Erkennung,
- Sound-Profi als Gruppe/Freigabe,
- `remote.admin.users.read`,
- `remote.admin.users.write` als rein diagnostische Auswertung.

## Weiterhin deaktiviert

- Remote-Writes ausserhalb Auth-/Session-/Self-Profil-Scope
- Agent-Actions
- OBS-Steuerung
- Sound-Steuerung
- Overlay-Steuerung
- Command-Steuerung
- Admin-Userverwaltung mit produktiven Writes
- Rollen-/Freigabe-Writes
- Gruppen-Writes
- Session-Widerrufe
- UI-Schreibbuttons
- DB-Migrationen

`canWriteAdminUsers` bleibt in RDAP5 immer `false`.

## Wichtige offene Sicherheitsaufgabe

- `SESSION_SECRET` und `OAUTH_STATE_SECRET` rotieren, falls noch nicht erledigt.
- Nach Rotation Service neu starten und Browser-Login erneut pruefen.

## Naechster sinnvoller Block

Nach Abschluss dieses Steps:

```text
RDAP_ADMIN_USERS6_CONFIRM_AUDIT_LOCK_FOUNDATION
```

Ziel: Confirm-/Audit-/Locking-Foundation technisch vorbereiten, weiterhin ohne grosse User-/Rollen-Writes.

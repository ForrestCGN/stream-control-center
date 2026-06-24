# CURRENT STATUS - stream-control-center

Stand: RDAP_USERMENU2_CLEAN_PROFILE_ACTIONS_AND_DOCS
Datum: 2026-06-24

## Aktueller bestätigter RDAP-/Remote-Modboard-Stand

Remote-Modboard/Auth:

- `mods.forrestcgn.de` läuft.
- Twitch Login funktioniert live.
- Dashboard-Zugriff wird serverseitig geprüft.
- ForrestCGN kann sich anmelden und das Dashboard nutzen.
- EngelCGN kann nach Allowlist-Erweiterung mittesten und ist als User sichtbar.
- Avatar oben rechts wird angezeigt.
- Profilpanel oben rechts ist vorhanden.
- `Profil aktualisieren` synchronisiert eigene Twitch-Daten.
- Login-/Denied-Layout ist zentriert.
- Dashboard-Karten/Grid-Abstände sind nach V13-Fix sauberer.
- Topbar-Ausloggen wurde entfernt; Logout bleibt im Profilpanel.
- Profilpanel ist auf die Self-Service-Aktionen `Profil aktualisieren` und `Ausloggen` reduziert.
- Admin -> User & Rollen zeigt eine read-only Übersicht bekannter Dashboard-User, Rollen, Gruppen, Permissions und Sessions.

## Aktueller Arbeitsstand

`RDAP_USERMENU2_CLEAN_PROFILE_ACTIONS_AND_DOCS` ist der nächste einzuspielende/abzuschließende Step.

Funktional vorhanden:

- Twitch-Avatar wird beim Login gespeichert, wenn DB-Spalten vorhanden sind.
- DB-Spalten für Avatar wurden produktiv angelegt:
  - `dashboard_users.profile_image_url`
  - `dashboard_identities.provider_profile_image_url`
- `/api/remote/auth/me` liefert Avatar-/Profilbilddaten.
- Im Self-Profilpanel gibt es `Profil aktualisieren`.
- Der Sync aktualisiert nur den aktuell eingeloggten User.
- `/api/remote/auth/model` liefert read-only Auth-/Rollenmodell inklusive Userliste für Admin-Übersicht.

## Weiterhin deaktiviert

- Remote-Writes außerhalb Auth-/Session-/Self-Profil-Scope
- Agent-Actions
- OBS-Steuerung
- Sound-Steuerung
- Overlay-Steuerung
- Command-Steuerung
- Admin-Userverwaltung mit Writes
- Rollen-/Freigabe-Writes

## Wichtige offene Sicherheitsaufgabe

- `SESSION_SECRET` und `OAUTH_STATE_SECRET` rotieren, falls noch nicht erledigt.
- Nach Rotation Service neu starten und Browser-Login erneut prüfen.

## Nächster sinnvoller Block

Nach Abschluss dieses Steps:

```text
RDAP_ADMIN_USERS2_MANAGEMENT_PLAN
```

Ziel: echte Admin-Userverwaltung zuerst planen, nicht direkt schreiben. Benötigt Owner/Admin-Permission, Confirm-Write, Audit-Log, Locking, Rollback und klare UI-Trennung.

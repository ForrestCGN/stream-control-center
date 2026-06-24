# CURRENT STATUS - stream-control-center

Stand: RDAP_ADMIN_USERS2_MANAGEMENT_PLAN  
Datum: 2026-06-24

## Aktueller bestätigter RDAP-/Remote-Modboard-Stand

Remote-Modboard/Auth:

- `mods.forrestcgn.de` läuft.
- Twitch Login funktioniert live.
- Dashboard-Zugriff wird serverseitig geprüft.
- ForrestCGN kann sich anmelden und das Dashboard nutzen.
- EngelCGN ist als User sichtbar bzw. für Tests vorgesehen.
- Avatar oben rechts wird angezeigt.
- Profilpanel oben rechts ist vorhanden.
- `Profil aktualisieren` synchronisiert eigene Twitch-Daten.
- Profilpanel zeigt nur noch `Profil aktualisieren` und `Ausloggen`.
- Login-/Denied-Layout ist zentriert.
- Dashboard-Karten/Grid-Abstände sind nach V13-Fix sauberer.
- Topbar-Ausloggen wurde entfernt; Logout bleibt im Profilpanel.
- Admin -> User & Rollen zeigt eine read-only Übersicht bekannter Dashboard-User, Rollen, Gruppen, Permissions und Sessions.

## Aktueller Arbeitsstand

`RDAP_ADMIN_USERS2_MANAGEMENT_PLAN` ist ein reiner Doku-/Plan-Step.

Neu dokumentiert:

- spätere Admin-Userverwaltung zuerst planen, nicht direkt schreiben
- Self-Profil oben rechts bleibt getrennt von Admin-Verwaltung
- Admin-Verwaltung bleibt unter `Admin -> User & Rollen`
- Owner/Admin-Permission als Pflicht für spätere Writes
- Confirm-Write für produktive Aktionen
- Audit-Log für jede Admin-Schreibaktion
- Locking gegen gleichzeitige Bearbeitung
- Backup/Rollback vor DB-/Write-Steps
- `Sound-Profi` als Spezialgruppe/Freigabe, nicht als globale System-/Owner-Rolle

## In diesem Step nicht geändert

- kein Backend-Code
- kein Frontend-Code
- keine DB
- keine Routen
- keine Services
- keine Migrationen
- keine produktiven Admin-Writes
- keine Remote-Agent-Actions

## Weiterhin deaktiviert/verboten ohne eigenen Scope

- Remote-Writes außerhalb Auth-/Session-/Self-Profil-Scope
- Agent-Actions
- OBS-Steuerung
- Sound-Steuerung
- Overlay-Steuerung
- Command-Steuerung
- Admin-Userverwaltung mit Writes
- Rollen-/Freigabe-Writes
- DB-Migration ohne Backup/Rollback/Go
- Secrets im Repo/Frontend/Chat/Logs

## Wichtige offene Sicherheitsaufgabe

- `SESSION_SECRET` und `OAUTH_STATE_SECRET` rotieren, falls noch nicht erledigt.
- Nach Rotation Service neu starten und Browser-Login erneut prüfen.

## Nächster sinnvoller Block

Nach Abschluss dieses Plan-Steps:

```text
RDAP_ADMIN_USERS3_WRITE_FOUNDATION_PLAN_OR_BACKUP_SCOPE
```

Ziel: noch keine große Admin-UI bauen, sondern zuerst DB-Tabellenstand, Backup-/Rollback, Permission-Middleware, Confirm-Write, Audit und Locking als Grundlage planen.

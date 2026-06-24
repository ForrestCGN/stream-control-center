# CURRENT STATUS - stream-control-center

Stand: RDAP_ADMIN_USERS3_WRITE_FOUNDATION_PLAN  
Datum: 2026-06-24

## Aktueller bestätigter RDAP-/Remote-Modboard-Stand

Remote-Modboard/Auth:

- `mods.forrestcgn.de` läuft.
- Twitch Login funktioniert live.
- Dashboard-Zugriff wird serverseitig geprüft.
- ForrestCGN und EngelCGN sind sichtbar.
- Avatar oben rechts wird angezeigt.
- Profilpanel oben rechts ist vorhanden.
- `Profil aktualisieren` synchronisiert eigene Twitch-Daten.
- Login-/Denied-Layout ist zentriert.
- Dashboard-Karten/Grid-Abstände sind nach V13-Fix sauberer.
- Topbar-Ausloggen wurde entfernt; Logout bleibt im Profilpanel.
- Profilpanel ist auf die Self-Service-Aktionen `Profil aktualisieren` und `Ausloggen` reduziert.
- `Admin -> User & Rollen` zeigt eine read-only Übersicht bekannter Dashboard-User, Rollen, Gruppen, Permissions und Sessions.

## Aktueller Arbeitsstand

`RDAP_ADMIN_USERS2_MANAGEMENT_PLAN` wurde als reiner Planungs-/Doku-Step abgeschlossen.

`RDAP_ADMIN_USERS3_WRITE_FOUNDATION_PLAN` konkretisiert jetzt die spätere Write-Grundlage.

Funktional weiterhin unverändert:

- Self-Profil darf nur eigene Twitch-Daten synchronisieren.
- Admin-Userverwaltung bleibt read-only.
- Keine Rollen-/Freigabe-Writes.
- Keine produktiven Admin-Writes.
- Keine DB-Migration.
- Keine Remote-Agent-Actions.

## Weiterhin deaktiviert

- Remote-Writes außerhalb Auth-/Session-/Self-Profil-Scope
- Agent-Actions
- OBS-Steuerung
- Sound-Steuerung
- Overlay-Steuerung
- Command-Steuerung
- Admin-Userverwaltung mit Writes
- Rollen-/Freigabe-Writes
- Session-Widerrufe über Admin-UI

## Wichtige offene Sicherheitsaufgabe

- `SESSION_SECRET` rotieren, falls noch nicht erledigt.
- `OAUTH_STATE_SECRET` rotieren, falls noch nicht erledigt.
- Nach Rotation Service neu starten und Browser-Login erneut prüfen.

## Nächster sinnvoller Block

Nach Abschluss dieses Steps:

```text
RDAP_ADMIN_USERS4_BACKUP_AND_PERMISSION_FOUNDATION
```

Ziel: echte Tabellen/Spalten prüfen, Backup/Rollback festlegen, Permission-Read prüfen, Confirm-/Audit-/Locking-Foundation vorbereiten. Noch keine großen User-/Rollen-Writes bauen.

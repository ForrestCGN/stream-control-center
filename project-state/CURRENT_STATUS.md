# CURRENT STATUS - stream-control-center

Stand: RDAP_AUTH4_SELF_TWITCH_PROFILE_SYNC
Datum: 2026-06-24

## Aktueller bestätigter Stand

Remote-Modboard/Auth:

- `mods.forrestcgn.de` läuft.
- Twitch Login funktioniert live.
- Dashboard-Zugriff wird serverseitig geprüft.
- ForrestCGN kann sich anmelden und das Dashboard nutzen.
- EngelCGN kann nach Allowlist-Erweiterung mittesten.
- Avatar oben rechts wird angezeigt.
- Profilpanel oben rechts ist vorhanden.
- `Profil aktualisieren` synchronisiert eigene Twitch-Daten.
- Login-/Denied-Layout ist zentriert.
- Dashboard-Karten/Grid-Abstände sind nach V13-Fix sauberer.

## Aktueller Arbeitsstand

`RDAP_AUTH4_SELF_TWITCH_PROFILE_SYNC` ist bestätigt.

Funktional vorhanden:

- Twitch-Avatar wird beim Login gespeichert, wenn DB-Spalten vorhanden sind.
- DB-Spalten für Avatar wurden produktiv angelegt:
  - `dashboard_users.profile_image_url`
  - `dashboard_identities.provider_profile_image_url`
- `/api/remote/auth/me` liefert Avatar-/Profilbilddaten.
- Im Self-Profilpanel gibt es `Profil aktualisieren`.
- Der Sync aktualisiert nur den aktuell eingeloggten User.

## Weiterhin deaktiviert

- Remote-Writes außerhalb Auth-/Session-/Self-Profil-Scope
- Agent-Actions
- OBS-Steuerung
- Sound-Steuerung
- Overlay-Steuerung
- Command-Steuerung
- Admin-Userverwaltung
- Rollen-/Freigabe-Writes

## Wichtige offene Sicherheitsaufgabe

- `SESSION_SECRET` und `OAUTH_STATE_SECRET` rotieren, falls noch nicht erledigt.
- Nach Rotation Service neu starten und Browser-Login erneut prüfen.

## Nächster sinnvoller Block

`RDAP_ADMIN_USERS1_READONLY_OVERVIEW`

Ziel: Admin-Bereich für User-/Rollenübersicht zunächst read-only vorbereiten. Noch keine Rollen schreiben, keine Freigaben ändern.

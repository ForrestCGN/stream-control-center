# RDAP_AUTH4_SELF_TWITCH_PROFILE_SYNC

Stand: 2026-06-24

## Zweck

Ergänzt im Self-Profilpanel oben rechts die Aktion **Profil aktualisieren**.

Der eingeloggte User kann damit nur sein eigenes Twitch-Profil neu synchronisieren:

- Twitch-Anzeigename
- Twitch-Loginname
- Twitch-Avatar / `profile_image_url`

## Sicherheit / Scope

Dieser Step ist ein Self-Service-Auth-Write, aber keine Remote-Action:

- keine User-Verwaltung
- keine Rollen-/Freigabe-Writes
- keine Admin-Funktionen
- keine OBS-/Sound-/Overlay-/Command-Steuerung
- keine Agent-Actions
- nur eigener eingeloggter User

## Route

```text
POST /api/remote/auth/me/sync-twitch
```

Die Route prüft die aktuelle Session, liest die eigene Twitch-Identity, holt den Twitch-User per Helix und schreibt nur die eigenen Profilfelder.

## Voraussetzung

Die Avatar-Spalten aus `RDAP_AUTH3_TWITCH_AVATAR_PROFILE_IMAGE` müssen vorhanden sein:

```text
dashboard_users.profile_image_url
dashboard_identities.provider_profile_image_url
```

## Frontend

Im Profilpanel:

- Button `Profil aktualisieren`
- Hinweis `Twitch-Daten werden neu gelesen …`
- Erfolg `Profil wurde synchronisiert`
- Fehlerhinweis, wenn Twitch/DB nicht erreichbar ist

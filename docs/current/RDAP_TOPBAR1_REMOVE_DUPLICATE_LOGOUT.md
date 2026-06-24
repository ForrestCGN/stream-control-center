# RDAP_TOPBAR1_REMOVE_DUPLICATE_LOGOUT

Stand: 2026-06-24

## Ziel

Der doppelte `Ausloggen`-Button in der Topbar wurde entfernt. Ausloggen bleibt weiterhin im Profilpanel über Avatar/Name verfügbar.

## Geänderte Datei

```text
remote-modboard/backend/public/index.html
```

## Änderung

- Topbar-Button `#logoutButton` entfernt.
- Profilpanel-Logout `#selfProfileLogoutButton` bleibt unverändert.
- Auth-/Logout-Logik bleibt unverändert.
- Usermenü/Avatar bleibt unverändert.

## Nicht geändert

- Kein Backend.
- Keine DB.
- Keine Auth-Logik.
- Keine Rollen-/Userverwaltung.
- Keine Remote-Writes.
- Keine Agent-Actions.
- Keine OBS-/Sound-/Overlay-/Command-Steuerung.

## Test

1. Dashboard öffnen.
2. Topbar prüfen: kein separater `Ausloggen`-Button mehr neben Avatar/Name.
3. Avatar/Name öffnen.
4. Im Profilpanel ist `Ausloggen` weiterhin vorhanden und nutzbar.
5. Dashboard-Layout bleibt sauber.

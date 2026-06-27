# Changelog

## Version 0.2.5 - Lokales Dashboard vorbereitet

- Sichtbare Version `0.2.5` eingefuehrt.
- Deutscher kurzer Buildname `Lokales Dashboard vorbereitet` eingefuehrt.
- Hauptbereich `Lokales Dashboard` im zentralen Modulmanifest registriert.
- Drei lokale read-only Seiten registriert:
  - `Stream-PC Status`,
  - `LAN / Zugriff`,
  - `Start / Env`.
- Alle lokalen Seiten nutzen `runtime: local`.
- Sprachdateien Deutsch/Englisch erweitert.
- Status-API meldet lokale Dashboard-Seiten als vorbereitet.
- Keine DB-Migration, keine neuen produktiven Writes, keine Agent-Actions.

## RDAP123 - Routes-Status angeglichen

- Sichtbare Version `0.2.4` eingefuehrt.
- Deutscher kurzer Buildname `Routes-Status angeglichen` eingefuehrt.
- `/api/remote/routes` meldet `routeStatusBuild: RDAP123_ROUTES_STATUS_AND_HANDOFF_CLEANUP`.
- `/api/remote/routes` enthaelt jetzt `localDashboardProfile` passend zum RDAP122-Status.
- Alter `localLanMode`-Block in `/routes` wurde durch Runtime-basierte Werte ersetzt.
- Doku-/Projektstatus-Dateien auf den RDAP122/RDAP123-Live-Stand nachgezogen.
- Keine DB-Migration, keine neuen produktiven Writes, keine Agent-Actions.

## RDAP122 - Lokales Dashboard-Profil

- Sichtbare Version `0.2.3` eingefuehrt.
- Deutscher kurzer Buildname `Lokales Dashboard-Profil` eingefuehrt.
- `localDashboardProfile` in Config und Status-API vorbereitet.
- Runtime-Modus `online/local` wird in der UI sichtbar angezeigt.
- `REMOTE_MODBOARD_MODE=lan` wird weiter als `local` normalisiert.
- Modulmanifest auf Version `0.2.3` gesetzt und Runtime-Profile dokumentiert.
- Neues Frontend-Helferfile `runtime-profile.js` markiert Navigation anhand `runtime: online|local|both`.
- Zentrale Sprachdateien um Runtime-Texte erweitert.
- Keine DB-Migration, keine neuen produktiven Writes, keine Agent-Actions.

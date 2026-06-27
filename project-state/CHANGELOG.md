# Changelog

## RDAP128 - Handoff nach Version 0.2.5

- Live-Bestaetigung fuer `0.2.5 - Lokales Dashboard vorbereitet` dokumentiert.
- Startdatei und Next-Chat-Prompt auf den bestaetigten Live-Stand aktualisiert.
- Geparkte Idee `Kontrollierter Online-Sync lokaler Aenderungen` dokumentiert.
- Naechster sinnvoller technischer Fokus auf `0.2.6 - Lokale Statusdaten verbessert` gesetzt.
- Doku-only: keine Codeaenderung, kein Webserver-Deploy noetig.

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

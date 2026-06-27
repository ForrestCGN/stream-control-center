# Changelog

## RDAP126 - Lokales Dashboard Modul-Shell-Plan

- Lokalen Hauptbereich `local-dashboard` geplant.
- Drei lokale read-only Seiten geplant:
  - `stream-pc-status`,
  - `lan-connections`,
  - `local-runtime-help`.
- Manifest-Beispiele fuer `manifest.modules` und `manifest.pages` dokumentiert.
- Sprachkey-Bedarf fuer `languages/de.js` und `languages/en.js` dokumentiert.
- Erlaubte read-only Datenquellen fuer spaetere Implementierung festgelegt.
- Doku-Tippfehler in lokalen Stream-PC-Agent PowerShell-Pfaden korrigiert.
- Naechster Code-Step `RDAP127_LOCAL_DASHBOARD_MODULE_SHELL_IMPLEMENTATION_READONLY` definiert.
- Keine Codeaenderung, keine DB-Migration, keine neuen produktiven Writes, keine Agent-Actions.

## RDAP125 - Lokales Stream-PC-/LAN-Env- und Startprofil

- Backend-Env fuer Online-/Lokalmodus dokumentiert.
- Stream-PC-Agent-Env `SCC_AGENT_*` dokumentiert.
- Manuelles Startprofil und Diagnoseprofil dokumentiert.
- Forrest-/Engel-LAN-Zielbild dokumentiert.
- Keine Codeaenderung, kein Webserver-Deploy.

## RDAP124 - Doku-Handoff und Modulregistrierungsregeln

- Live-Stand RDAP123 in Current-Dokus aktualisiert.
- Modulregistrierungsregeln ergaenzt.
- Geklaert: Seiten geben ueber `moduleId` an, wo sie hingehoeren.
- Geklaert: Neue Hauptmenues entstehen kontrolliert ueber `manifest.modules`.

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

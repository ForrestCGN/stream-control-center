# Changelog

## RDAP125 - Lokales Stream-PC-/LAN-Env- und Startprofil

- Doku fuer lokales Stream-PC-/LAN-Env- und Startprofil erstellt.
- Backend-Env fuer `REMOTE_MODBOARD_MODE=online|local|lan` dokumentiert.
- Webserver-Onlineprofil und spaeteres LAN-Profil getrennt beschrieben.
- Stream-PC-Agent-Env `SCC_AGENT_*` anhand echter Agent-Konfiguration dokumentiert.
- Manuelles Webserver-Agent-Startprofil dokumentiert.
- Manuelles lokales Diagnoseprofil dokumentiert.
- Forrest-/Engel-LAN-Zielbild dokumentiert.
- Naechster Schritt `RDAP126_LOCAL_DASHBOARD_MODULE_SHELL_PLAN` vorbereitet.
- Doku-only: keine Codeaenderung, kein Webserver-Deploy noetig.
- Keine DB-Migration, keine neuen produktiven Writes, keine Agent-Actions.

## RDAP124 - Doku-Handoff und Modulregistrierungsregeln

- Start-/Current-/Next-Chat-Doku auf RDAP123-Live-Stand aktualisiert.
- Modulregistrierungsregeln dokumentiert.
- Geklaert: Module/Seiten geben ueber `moduleId`/`pageId` an, wo sie hingehoeren.
- Geklaert: neue Hauptmenuepunkte sind ueber `manifest.modules` erlaubt, aber nur bei fachlich eigenem Modulbereich.
- Doku-only: kein Webserver-Deploy noetig.

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

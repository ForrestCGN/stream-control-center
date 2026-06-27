# Changelog

## Doku-/Handoff-Step nach RDAP123

- `START_HERE_FOR_NEW_CHAT.md` auf Live-Stand `0.2.4 - Routes-Status angeglichen` aktualisiert.
- `CURRENT_REMOTE_MODBOARD_STATE.md` auf RDAP123-Live-Bestaetigung aktualisiert.
- `REMOTE_MODBOARD_ROADMAP_CURRENT.md` auf RDAP119 bis RDAP123 nachgezogen.
- `NEXT_CHAT_PROMPT_RDAP_REMOTE_MODBOARD_NEXT.md` neu auf RDAP123 ausgerichtet.
- `DOCS_CURRENT_FINAL_INDEX.md` aktualisiert.
- Neue Current-Doku `MODULE_REGISTRATION_RULES_CURRENT.md` erstellt.
- Modulregel dokumentiert: Hauptmenues ueber `manifest.modules`, Seiten ueber `manifest.pages`, Zuordnung ueber `moduleId`.
- Keine Code-Aenderung, keine DB-Migration, keine neuen produktiven Writes, keine Agent-Actions.

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

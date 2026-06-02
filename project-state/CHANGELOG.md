# CHANGELOG

## CAN-28.2

- Erfolgreichen Live-Test von CAN-28.1 dokumentiert.
- Bestätigtes Ergebnis:
  - `loaded=52`
  - `skipped=1`
  - `failed=0`
  - `warnings=0`
  - `routes=1180`
  - `duplicateRoutes=0`
- `obs_shared.js` wird korrekt als Shared-Helper ohne init geloggt:
  - `shared=yes`
  - `reason=no_init_export`
- Keine irritierenden `module-warning`-Zeilen fuer `obs_shared.js` mehr.
- Keine Codeänderung in CAN-28.2.

## CAN-28.1

- `backend/server.js` Modul-Loader-Diagnostik rein lesbarer gemacht.
- Server-Version auf `0.1.1-can28-1-loader-log-summary` gesetzt.
- Loader-Diagnostik-Version auf `0.1.1` gesetzt.
- Modulscan gibt am Ende eine kompakte Summary aus:
  - loaded
  - skipped
  - failed
  - warnings
  - routes
  - duplicateRoutes
- Bekannter Shared-Helper `obs_shared.js` wird bei `no_init_export` als `shared=yes` geloggt.
- Fehlende `MODULE_META`/Version bei bekanntem Shared-Helper erzeugt keine irritierende `module-warning` mehr.
- Failed-Module werden am Ende kompakt gelistet.
- Keine Modul-Ladereihenfolge, keine init-Logik, keine Routen, keine DB und keine produktiven Flows geändert.

## CAN-27.2

- Repo/Live-Doku-Sync geprüft.
- `project-state/*` und `docs/current/CURRENT_CHAT_HANDOFF_CAN27_1.md` waren Repo/Live synchron.
- Doku-Deploy-Weg nach CAN-26.5 bestätigt.

## CAN-27.1

- Getrackten Doppelordner `htdocs/htdocs/...` entfernt.
- Echte Zielpfade blieben vorhanden:
  - `htdocs/dashboard/modules/overlays.js`
  - `htdocs/overlays/_overlay-birthday.html`
  - `htdocs/overlays/_rahmen.html`
- Keine Runtime-Funktionalität entfernt.

## CAN-26.5

- `tools/deploy_repo_to_streamassets.ps1` um Doku-/Projektstand-Deploy erweitert:
  - `docs/current`
  - `docs/system-inspection`
  - `docs/modules`
  - `project-state`
- Doku-Deploy funktioniert seitdem über `stepdone.cmd`.

# Next Steps

## Kurzfristig

1. Aktuellen lokalen STEP007-Stand in das Repo ueberfuehren.
2. Dateien sauber nach Zielpfaden ablegen:
   - `htdocs/dashboard/...`
   - `config/...`
   - `backend/modules/...`
   - `backend/modules/helpers/...`
   - `docs/...`
3. Pruefen, welche Dateien aus dem echten lokalen Projektstand kommen muessen, damit bestehende Alerts/OBS-Funktionen nicht ueberschrieben werden.

## Danach

1. Admin > Configs weiter ausbauen.
2. Stream-Desk QuickScenes sauber aus `config/streamdesk.json` laden.
3. Backend-Routen fuer Dashboard-Config lesen vorbereiten.
4. Config-Schreiben erst spaeter und nur mit Rechte-/Audit-Konzept aktivieren.
5. Twitch-Login nur vorbereiten, nicht sofort live schalten.

## Spaeter

- Twitch OAuth fuer Mods/SuperMods.
- Chatten als eigener Twitch-Account.
- echte Twitch-Modaktionen ueber eigenen OAuth-Token.
- Audit-Log in eigener SQLite-Datei.
- Admin > Logs.
- Admin > Configs mit Allowlist und Schemas.

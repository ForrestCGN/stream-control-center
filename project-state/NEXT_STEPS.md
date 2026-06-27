# Next Steps

Stand: 2026-06-27

1. `RDAP123_ROUTES_STATUS_AND_HANDOFF_CLEANUP.zip` lokal einspielen.
2. Lokale Syntax-Checks ausfuehren.
3. Browser/API pruefen:
   - `/api/remote/status`
   - `/api/remote/routes`
   - System / Übersicht
   - Module / Modulübersicht
4. Besonders pruefen:
   - `/status` meldet `v0.2.4 - Routes-Status angeglichen`.
   - `/routes` enthaelt `routeStatusBuild: RDAP123_ROUTES_STATUS_AND_HANDOFF_CLEANUP`.
   - `/routes.localDashboardProfile.visibleLabel` ist `Onlinemodus` im Webserver-Onlinebetrieb.
   - `/routes.localLanMode.routeStatusAligned` ist `true`.
   - Keine roten Console-Fehler.
5. Wenn sauber: `stepdone.cmd`.
6. Danach Webserver-Deploy, weil `remote-modboard/...` geaendert wurde.
7. Naechster sinnvoller Schritt danach: lokale Start-/Env-Doku fuer Stream-PC/LAN konkretisieren, weiterhin ohne Agent-Actions.

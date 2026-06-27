# Next Steps

Stand: 2026-06-27

1. `RDAP122_LOCAL_DASHBOARD_RUNTIME_PROFILE.zip` lokal einspielen.
2. Lokale Syntax-Checks ausfuehren.
3. Browser pruefen:
   - System / Übersicht
   - System / Diagnose
   - Module / Modulübersicht
   - Admin / Verbindungen
4. Besonders pruefen:
   - Topbar zeigt `Onlinemodus`.
   - Bei lokaler Env `REMOTE_MODBOARD_MODE=local` zeigt die UI `Lokalmodus`.
   - Modulnavigation bleibt nutzbar.
   - Keine roten Console-Fehler.
5. Wenn sauber: `stepdone.cmd`.
6. Danach Webserver-Deploy, weil `remote-modboard/...` geaendert wurde.
7. Naechster sinnvoller Schritt danach: lokale Start-/Env-Doku fuer Stream-PC/LAN konkretisieren oder lokale Dashboard-Module schrittweise planen, weiterhin ohne Agent-Actions.

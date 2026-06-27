# Next Steps

Stand: 2026-06-27

1. ZIP `RDAP127_LOCAL_DASHBOARD_FOUNDATION.zip` lokal einspielen.
2. Syntax-Checks ausfuehren.
3. Browser/API pruefen:
   - `/api/remote/status`,
   - Module / Modulübersicht,
   - Navigation: Lokales Dashboard ist im Onlinebetrieb sichtbar, aber wegen `runtime: local` gesperrt/markiert,
   - bei lokaler Env `REMOTE_MODBOARD_MODE=local` werden die drei lokalen Seiten nutzbar.
4. Wenn sauber: `stepdone.cmd`.
5. Danach Webserver-Deploy, weil `remote-modboard/...` Code geaendert wurde.
6. Naechster sinnvoller Schritt danach: lokale read-only Seiten mit echten, sicheren Daten verfeinern.

# Current Status

Stand: 2026-06-28

Aktueller vorbereiteter Stand dieses Steps:

```text
0.2.10H - Dashboard-v2 Remote-Asset-Pfade lokal repariert
```

Geaendert:

```text
- 0.2.10G zeigte nacktes HTML, weil /assets/... lokal nicht auf Remote-Modboard-Assets zeigte.
- Lokaler Adapter liefert fuer Remote-Modboard-Assets jetzt lokale Dateien, wenn vorhanden, sonst Redirect auf https://mods.forrestcgn.de/assets.
- /api/remote/auth/login/start wird lokal auf /dashboard-v2/ zurueckgeleitet und startet keinen Login-Flow.
- /dashboard-v2 bleibt echte Remote-Modboard-App mit lokalen read-only /api/remote/* Adaptern.
```

Nicht geaendert:

- keine DB-Migration,
- keine produktiven Writes,
- keine Agent-Actions,
- keine OBS-/Sound-/Overlay-/Command-Steuerung,
- keine Shell-/Datei-/Prozess-Actions,
- keine Aenderung an /dashboard,
- kein Webserver-Deploy noetig.

# Current Status

Stand: 2026-06-27

Aktueller vorbereiteter Stand dieses Steps:

```text
v0.2.10C - Dashboard-v2 V13/Modboard-Design wirklich uebernommen
```

Geaendert:

```text
Lokale Dashboard-v2 System-Seite:
- V13/Remote-Modboard-Design als Ziel uebernommen.
- Topbar, Sidebar und Uebersicht weiter an Online-Modboard angenaehert.
- `body.is-scrolled .cgn-topbar` fuer hellen Rand/Glow beim Scrollen vorbereitet.
- Menuepunkt System -> Stream-PC aktiviert.
- Read-only-Seite fuer lokalen Stream-PC Status vorbereitet.
- Ausschliesslich bestehende GET-Routen verwendet:
  - /api/_status
  - /api/stream-status/current
  - /api/diag/ws
- Server-, Modul-, Routen-, WebSocket- und gecachter Streamstatus sichtbar.
- Keine Refresh-, Test-, Log-, Session- oder Schreibroute aufgerufen.
- Keine Actions oder Steuerfunktionen.
- /dashboard bleibt unveraendert.
```

Sichttest-Hinweis:

```text
0.2.10C ist noch nicht optisch final.
Forrest hat gemeldet: Die obere feste Leiste/Topbar sieht lokal weiterhin nicht gut aus.
Naechster Pflicht-Fix: 0.2.10D - Dashboard-v2 Topbar V13 exakt nachziehen.
```

Vorher bestaetigt:

```text
v0.2.9 - Dashboard-v2 Navigation angeglichen
```

Nicht geaendert:

- keine Backend-Aenderung,
- keine DB-Migration,
- keine neuen produktiven Writes,
- keine Agent-Actions,
- keine OBS-/Sound-/Overlay-/Command-Steuerung,
- keine Shell-/Datei-/Prozess-Actions,
- keine Aenderung an `/dashboard`,
- kein Webserver-Deploy noetig.

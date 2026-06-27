# Current Status

Stand: 2026-06-27

Aktueller bestaetigter Stand nach lokalem Einspielen/Tests dieses Steps:

```text
v0.2.8 - Dashboard-v2 Einstieg vorbereitet
```

Geaendert:

```text
Lokaler Dashboard-v2 Einstieg:
- bestehende React/Vite- und Node/Express-Struktur verwendet.
- /dashboard-v2 zeigt eine erste lokale Startseite im Modboard-Look.
- sichtbare Fake-Zustaende und scheinbar aktive Demo-Bedienelemente entfernt.
- noch nicht migrierte Module bleiben sichtbar geplant, aber deaktiviert.
- Startseite ist ausdruecklich lokal und read-only.
- Build liegt unter htdocs/dashboard-v2.
- /dashboard bleibt unveraendert.
```

Vorher bestaetigt:

```text
v0.2.7 - Lokaler Dashboard-Ersatz geplant
```

- Lokaler Server auf Port 8080 als Wahrheit festgelegt.
- `/dashboard-v2` als kuenftiger lokaler Dashboard-Ersatz geplant.
- Modulweise Migration mit Read-only-Start festgelegt.

Nicht geaendert:

- keine Backend-Aenderung,
- keine DB-Migration,
- keine neuen produktiven Writes,
- keine Agent-Actions,
- keine OBS-/Sound-/Overlay-/Command-Steuerung,
- keine Shell-/Datei-/Prozess-Actions,
- keine Aenderung an `/dashboard`,
- kein Webserver-Deploy noetig.

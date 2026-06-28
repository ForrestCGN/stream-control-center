# Changelog

## Version 0.2.10H - Dashboard-v2 Remote-Asset-Pfade lokal repariert

- Fehler aus 0.2.10G korrigiert: `/dashboard-v2` lud nacktes HTML, weil Remote-Modboard-CSS/JS unter `/assets/...` lokal nicht gefunden wurden.
- Lokaler Adapter kann Remote-Modboard-Assets jetzt aus lokalen Dateien bedienen, wenn vorhanden, oder auf `https://mods.forrestcgn.de/assets/...` weiterleiten.
- `/api/remote/auth/login/start` startet lokal keinen Login, sondern leitet zurueck nach `/dashboard-v2/`.
- Lokale `/api/remote/*` Adapter bleiben read-only.
- Keine DB-Migration, keine produktiven Writes, keine Agent-/OBS-/Sound-/Overlay-/Command-Actions.
- `/dashboard` bleibt unveraendert.

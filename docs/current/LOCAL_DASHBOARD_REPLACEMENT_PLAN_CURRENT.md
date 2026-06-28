# Lokaler Dashboard-Ersatz - aktueller Plan

Stand: 2026-06-28

## Aktueller Stand

```text
0.2.10H - Dashboard-v2 Remote-Asset-Pfade lokal repariert
```

## Zielregel

```text
Das lokale Dashboard-v2 soll optisch und strukturell eine exakte Kopie des Remote-Modboards sein.
```

Abweichungen sind nur erlaubt bei:

```text
- Datenquelle: lokal/read-only statt Remote-Backend,
- Sicherheit: keine Writes, keine Agent-Actions, keine OBS-/Sound-/Overlay-/Command-Steuerung,
- Login: lokal kein echter Twitch-/Remote-Login-Flow.
```

## 0.2.10H

0.2.10G zeigte nacktes HTML, weil die echte Remote-Modboard-App `/assets/...` referenziert, der lokale Server aber `/assets` auf `htdocs/assets` mappt.

0.2.10H repariert das ueber den lokalen Adapter:

```text
/assets/remote-modboard.css
/assets/remote-modboard.js
/assets/runtime-profile.js
/assets/languages/*
/assets/modules/*
/dashboard-v2/assets/*
```

Wenn lokale Remote-Modboard-Assets vorhanden sind, werden sie lokal geliefert. Wenn nicht, wird auf `https://mods.forrestcgn.de/assets/...` weitergeleitet.

## Sicherheitsgrenzen

- keine DB-Migration,
- keine produktiven Writes,
- keine Agent-Actions,
- keine OBS-/Sound-/Overlay-/Command-Steuerung,
- keine Shell-/Datei-/Prozess-Actions,
- `/dashboard` bleibt unveraendert,
- kein Webserver-Deploy noetig.

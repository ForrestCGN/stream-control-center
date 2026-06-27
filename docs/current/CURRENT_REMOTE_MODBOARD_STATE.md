# Aktueller Remote-Modboard-Stand

Stand: 2026-06-27  
Version: `0.2.5 - Lokales Dashboard vorbereitet`

## Live-/Code-Stand

Das Remote-Modboard laeuft als Webserver-Dashboard mit modularer UI und deutscher sichtbarer Build-Kommunikation.

Aktueller sichtbarer Build:

```text
0.2.5 - Lokales Dashboard vorbereitet
```

## Aktuell vorhanden

- Modularisierte UI-Shell.
- Modulmanifest mit Hauptbereichen und Seiten.
- Zentrale Sprachdateien `languages/de.js` und `languages/en.js`.
- Runtime-Scope `online`, `local`, `both`.
- Runtime-Chip `Onlinemodus` / `Lokalmodus`.
- Hauptbereich `Lokales Dashboard`.
- Lokale read-only Seiten:
  - `Stream-PC Status`,
  - `LAN / Zugriff`,
  - `Start / Env`.

## Sicherheitsgrenze

Version 0.2.5 aktiviert keine neuen produktiven Funktionen.

Weiterhin gesperrt:

- keine DB-Migration,
- keine neuen produktiven Writes,
- keine Agent-Actions,
- keine OBS-Steuerung,
- keine Sound-Steuerung,
- keine Overlay-Steuerung,
- keine Command-/Channelpoints-Steuerung,
- keine Shell-/Datei-/Prozess-Actions,
- keine freie URL-Ausfuehrung.

Frontend-Module sind Anzeige und Navigation. Backend-Routen entscheiden echte Sicherheit.

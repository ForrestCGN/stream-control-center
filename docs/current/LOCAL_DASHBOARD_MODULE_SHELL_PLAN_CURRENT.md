# Lokales Dashboard - aktueller Foundation-Stand

Stand: 2026-06-27  
Gilt ab: `0.2.5 - Lokales Dashboard vorbereitet`

## Umgesetzt

Der lokale Dashboard-Bereich ist jetzt nicht mehr nur geplant, sondern als read-only Foundation vorbereitet.

Im zentralen Manifest gibt es den Hauptbereich:

```text
Lokales Dashboard
```

Registrierte Seiten:

```text
Stream-PC Status
LAN / Zugriff
Start / Env
```

Alle drei Seiten:

- sind im zentralen Manifest registriert,
- haben `runtime: local`,
- haben eigene Permission-Hinweise,
- laden eigene Script-Dateien unter `assets/modules/local-dashboard/`,
- zeigen nur read-only Informationen,
- starten keine Aktionen.

## Nicht umgesetzt

- keine Actions,
- keine OBS-Steuerung,
- keine Sound-/Overlay-/Command-Steuerung,
- keine Shell-/Datei-/Prozess-Actions,
- keine DB-Migration,
- keine neuen produktiven Writes,
- kein Autostart,
- kein Windows-Dienst.

## Regel fuer weitere lokale Module

Weitere lokale Seiten muessen weiterhin ueber `remote-modboard/backend/public/assets/modules/module-manifest.js` registriert werden.

Neue Hauptmenues nur, wenn fachlich eigener Bereich begruendet ist. Sonst muss die Seite per `moduleId` unter einen bestehenden Bereich.

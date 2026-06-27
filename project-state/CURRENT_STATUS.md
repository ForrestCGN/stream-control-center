# Current Status

Stand: 2026-06-27

Aktueller bestaetigter Stand nach lokalem Einspielen/Tests dieses Steps:

```text
v0.2.6 - Online-Modoberflaeche bereinigt
```

Geaendert:

```text
Online-Modoberflaeche / linke Navigation:
- `Lokales Dashboard` nicht mehr als Hauptmenue in der Online-Modoberflaeche.
- `Mein Konto` nicht mehr als Hauptmenue in der linken Navigation.
- `Routen` nicht mehr unter System.
- Technische Routen-/Detailansicht bleibt unter Admin -> Doku / Details.
- Konto-/Rechtefunktionen bleiben oben rechts im User-Panel.
```

Vorher bestaetigt:

```text
v0.2.5 - Lokales Dashboard vorbereitet
/api/remote/status -> version 0.2.5, buildName Lokales Dashboard vorbereitet, runtimeMode online
```

Nicht geaendert:

- keine DB-Migration,
- keine neuen produktiven Writes,
- keine Agent-Actions,
- keine OBS-/Sound-/Overlay-/Command-Steuerung,
- keine Shell-/Datei-/Prozess-Actions,
- keine Backend-Routen entfernt,
- keine Account-/Rechtefunktionen entfernt.

Hinweis:

Die lokale Oberflaeche wird spaeter als lokale Instanz/Kopie derselben App auf dem Streaming-PC geplant. Sie ist kein Menuepunkt in der Online-Modoberflaeche.

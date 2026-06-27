# Current Status

Stand: 2026-06-27

Aktueller bestaetigter Stand nach lokalem Einspielen/Tests dieses Steps:

```text
v0.2.7 - Lokaler Dashboard-Ersatz geplant
```

Geaendert:

```text
Doku-/Plan-Step fuer lokalen Dashboard-Ersatz:
- lokaler Server auf Port 8080 ist Wahrheit fuer lokale Oberflaeche.
- neue lokale Oberflaeche soll /dashboard-v2 werden.
- /dashboard bleibt zuerst stabil/alt.
- /dashboard kann spaeter auf /dashboard-v2 zeigen oder ersetzt werden.
- alte Dashboard-Funktionen werden nach und nach uebernommen.
- kritische lokale Module werden einzeln geprueft.
- Start je Modul zuerst read-only: anzeigen ja, ausloesen/aendern erstmal nein.
```

Vorher bestaetigt:

```text
v0.2.6 - Online-Modoberflaeche bereinigt
```

- `Lokales Dashboard` nicht mehr als Hauptmenue in der Online-Modoberflaeche.
- `Mein Konto` nicht mehr als Hauptmenue in der linken Navigation.
- `Routen` nicht mehr unter System.
- Technische Routen-/Detailansicht bleibt unter Admin -> Doku / Details.
- Konto-/Rechtefunktionen bleiben oben rechts im User-Panel.

Nicht geaendert:

- keine Codeaenderung,
- keine DB-Migration,
- keine neuen produktiven Writes,
- keine Agent-Actions,
- keine OBS-/Sound-/Overlay-/Command-Steuerung,
- keine Shell-/Datei-/Prozess-Actions,
- kein Webserver-Deploy noetig.

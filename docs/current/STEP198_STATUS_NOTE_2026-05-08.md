# STEP198 Status-Notiz – Globaler Modul-/DB-/Dashboard-Standard

Stand: 2026-05-08

## Kurzfassung

Für `stream-control-center` gilt künftig als Zielstandard:

```text
ENV / Secrets > DB > JSON > Code-Default
```

Dashboardfähige und laufzeitänderbare Einstellungen sollen in die DB. JSON-Dateien bleiben nur noch Seed/Fallback/technische Boot-Konfiguration. Das Dashboard darf nicht direkt auf SQLite oder Dateien zugreifen, sondern nur über Backend-APIs.

## Standard-Endpunkte je größerem Modul

```text
GET  /api/<modul>/status
GET  /api/<modul>/config
GET  /api/<modul>/settings
POST /api/<modul>/settings
POST /api/<modul>/reload
GET  /api/<modul>/integration-check
```

Optional:

```text
GET  /api/<modul>/routes
GET  /api/<modul>/stats
GET  /api/<modul>/history
GET  /api/<modul>/texts
POST /api/<modul>/texts
```

## Dashboard-Regel

Das Dashboard soll je Modul konsistent zwischen Status, Settings, Regeln, Texten, Assets, Historie und Diagnose trennen. Einstellungen werden über Backend-APIs gelesen/geschrieben und DB-basiert gespeichert.

## Aktueller Anlass

STEP196 hat beim Alert-System einen DB/JSON-Mismatch behoben: `livealert.soundSystemEnabled=true` aus der DB wurde vorher nicht auf `liveAlert.soundSystemEnabled` in der aktiven Runtime-Config angewendet.

STEP197.1 hat den richtigen Alert-Overlay-Pfad korrigiert: `htdocs/overlays/_overlay-alerts-v2.html`.

## Nächster Kandidat

TTS-System:

```text
/api/tts/status  vorhanden
/api/tts/config  fehlt aktuell
/api/tts/voices  fehlt aktuell
/api/tts/routes  fehlt aktuell
```

TTS soll als nächster Modulblock nach diesem Standard geprüft und geplant werden.

# STEP197.1 - Alert Overlay Audio-Fix auf echten OBS-Pfad legen

Datum: 2026-05-08
Projekt: stream-control-center

## Anlass

STEP197 wurde versehentlich unter `htdocs/overlay/_overlay-alerts-v2.html` abgelegt.
OBS lädt aber die reale Alert-Quelle `_AlertsV2` über:

`http://127.0.0.1:8080/overlay/_overlay-alerts-v2.html`

Die Server-Route zeigt dabei auf die Datei:

`htdocs/overlays/_overlay-alerts-v2.html`

Dadurch blieb die echte Live-Datei unverändert und `_AlertsV2` spielte weiterhin eigenen Browser-Audio-Sound ab.

## Änderung

Die in STEP197 geänderte Overlay-Datei wurde auf den echten Projektpfad gelegt:

`htdocs/overlays/_overlay-alerts-v2.html`

## Zielzustand

- `_AlertsV2` zeigt nur Alert-Bild, Text und Animation.
- Alert-Audio läuft über das neue Sound-System.
- Doppelte Audio-Ausgabe über `_AlertsV2` und Sound-System soll dadurch verhindert werden.

## Nacharbeit

Der versehentlich erzeugte falsche Pfad sollte aus dem Repo entfernt werden:

`htdocs/overlay/_overlay-alerts-v2.html`

Wenn der Ordner `htdocs/overlay` danach leer ist, kann er ebenfalls entfernt werden.

## Tests

Nach Deploy:

1. OBS Browsercache von `_AlertsV2` aktualisieren.
2. Follow-Test auslösen.
3. Erwartung:
   - Alert sichtbar in `_AlertsV2`.
   - Audio nur einmal über Sound-System/Device.
   - `_AlertsV2` zeigt keinen Audiomixer-Pegel mehr oder bleibt stummgeschaltet.

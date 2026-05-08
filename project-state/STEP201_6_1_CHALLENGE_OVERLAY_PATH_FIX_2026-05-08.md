# STEP201.6.1 – Challenge Integration-Check Overlay-Pfad-Fix

Stand: 2026-05-08  
Projekt: stream-control-center  
Status: vorbereitet

## Zweck

Nach STEP201.6 war `challenge` im Modulstandard 6/6 grün, aber der Integration-Check meldete eine Warnung für `overlay_status_file`.

Die Warnung entstand durch einen falsch aufgelösten Pfad:

```text
D:\Streaming\stramAssets\backend\htdocs\overlays\_overlay-challenge_status.html
```

Korrekt ist:

```text
D:\Streaming\stramAssets\htdocs\overlays\_overlay-challenge_status.html
```

## Änderung

Betroffene Datei:

```text
backend/modules/challenge.js
```

Geändert wurde nur die Hilfsfunktion `fileStatusFromRelative(parts)`.

Sie prüft jetzt:

1. Projektroot + relativer Pfad
2. Falls das erkannte Projektroot auf `backend` endet, zusätzlich Parent-Root + relativer Pfad

Dadurch funktioniert der Check sowohl im Repo-Kontext als auch im Live-System, wenn `configHelper.getProjectRoot()` auf den Backend-Ordner zeigt.

## Nicht geändert

- keine Start-/Queue-/Reset-/Timer-Logik
- keine WebSocket-Payloads
- keine Stats-Logik
- keine Config-Datei
- keine Message-Datei
- keine DB-Struktur
- keine Routenänderung

## Erwartung nach Deploy

```text
GET /api/challenge/integration-check
```

soll weiterhin 200 liefern und bei vorhandener Overlay-Datei keine `overlay_status_file`-Warnung mehr zeigen.

## Tests

Lokal geprüft:

```text
node -c backend/modules/challenge.js
```

Erwartung: Syntax OK.

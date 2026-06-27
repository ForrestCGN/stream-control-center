# Current Chat Handoff - CAN42.7

## Projekt

ForrestCGN `stream-control-center`

```text
Repo: https://github.com/ForrestCGN/stream-control-center
Branch: dev
Lokales Repo: D:\Git\stream-control-center
Live-Ziel: D:\Streaming\stramAssets
Produktive SQLite-DB: D:\Streaming\stramAssets\data\sqlite\app.sqlite
```

## Aktueller Stand

CAN-42.7 vorbereitet: Admin-Diagnose liest Todo `diagnostics`-Block bevorzugt.

## Änderung

```text
Admin > Diagnose > Todo nutzt status.diagnostics bevorzugt.
Fallback auf integration-check bleibt erhalten.
```

## Nicht geändert

```text
backend/*
bestehende Modul-Dateien
```

## Erwartung

```text
Todo bleibt OK.
Todo-Details zeigen Counts aus diagnostics.counts.
Rohdaten enthalten status.diagnostics.
```

## Nächster Schritt

```text
CAN-42.7 anwenden und Sichttest prüfen.
Danach CAN-42.8 Tagebuch /status auf diagnostics-Standard prüfen/angleichen.
```

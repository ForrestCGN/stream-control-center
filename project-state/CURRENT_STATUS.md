# CURRENT_STATUS

## Stand: CAN-42.7 vorbereitet

CAN-42.7 passt die zentrale Admin-Diagnose an, sodass `Admin > Diagnose > Todo` bevorzugt den neuen standardisierten `diagnostics`-Block aus `GET /api/todo/status` liest.

## Änderung

Geändert:

```text
htdocs/dashboard/modules/diagnostics.js
htdocs/dashboard/modules/diagnostics.css
docs/current/ADMIN_DIAGNOSTICS_TODO_STANDARD_BLOCK_CAN42_7.md
project-state/*
docs/current/CURRENT_CHAT_HANDOFF_CAN42_7.md
```

Nicht geändert:

```text
backend/*
bestehende Modul-Dateien
```

## Ergebnis

```text
Todo-Health/Ampel liest diagnostics.health/diagnostics.ok.
Todo-Details lesen diagnostics.counts.
Fallback auf integration-check bleibt erhalten.
```

## Nächster Schritt

```text
CAN-42.7 anwenden und Admin > Diagnose > Todo prüfen.
Danach CAN-42.8 Tagebuch /status auf diagnostics-Standard prüfen/angleichen.
```

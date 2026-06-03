# CURRENT_STATUS

## Stand: CAN-36.3 vorbereitet

CAN-36.3 ergänzt eine nachgeladene Read-only-Diagnosekarte im Message-Rotator-Dashboard.

## Änderung

Betroffene Dateien:

```text
htdocs/dashboard/index.html
htdocs/dashboard/modules/message_rotator_readonly_diagnostics.js
htdocs/dashboard/modules/message_rotator_readonly_diagnostics.css
project-state/*
docs/current/CURRENT_CHAT_HANDOFF_CAN36_3.md
```

Nicht geändert:

```text
htdocs/dashboard/modules/message_rotator.js
backend/modules/message_rotator.js
```

## Neue Karte

```text
Dashboard > Message-Rotator > Read-only
```

Abschnitte:

```text
Status & Runtime
Konfiguration & Items
Textsystem & Samples
Live-Status-Konfiguration
Routen-Sicherheit
```

## Sicherheit

Genutzt werden nur:

```text
GET /api/message-rotator/status
GET /api/message-rotator/routes
GET /api/message-rotator/integration-check
```

Nicht genutzt:

```text
start, stop, tick, next, manual, preview, reload, live-status, admin/settings POST, admin/texts POST
```

## Stabilität

```text
Kein MutationObserver.
Kein Dauer-Rendering.
Nur kontrolliertes Click-/Show-Handling.
```

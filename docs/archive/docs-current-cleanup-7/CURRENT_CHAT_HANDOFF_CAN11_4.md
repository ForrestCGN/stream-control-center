# Current Chat Handoff - CAN-11.4

## Stand

CAN-11.4 hat die Dashboard-UI fuer `manual_status_resync_request` umgesetzt.

## Geaenderte Datei

```text
htdocs/dashboard/modules/bus_diagnostics.js
```

## Neue UI

Bereich:

```text
Event-Bus / Communication Bus -> Recovery -> Preflight
```

Karte:

```text
Manueller Status-Resync
```

Button:

```text
Status neu synchronisieren
```

## Verhalten

Der Button ruft nur bestehende GET-Routen ab:

```text
GET /api/bus-diagnostics/status
GET /api/bus-diagnostics/recovery-preflight
```

Keine Backend-Aenderung, keine Recovery-Ausfuehrung.

## Naechster Schritt

CAN-11.5:

```text
Manual Status Resync Dashboard UI Live-Test Acceptance
```

Nur Doku/Abnahme.

# Next Steps

Stand: 2026-06-27

Naechster sinnvoller technischer Schritt nach `0.2.10 - Stream-PC Status read-only vorbereitet`:

```text
0.2.11 - Moduluebersicht read-only vorbereiten
```

Ziel:

1. Vorhandenen Menuepunkt `Module -> Moduluebersicht` aktivieren.
2. Nur bestehende sichere lokale Status-/Diagnose-Daten lesen.
3. Geladene lokale Module, Routen-Status und geplante Migrationsbereiche anzeigen.
4. Keine Reload-, Refresh-, Test-, Log-, Session- oder Schreibroute aufrufen.
5. Keine Buttons, Actions oder Steuerfunktionen aktivieren.
6. `/dashboard` stabil lassen.

Pflicht-Pruefdateien:

```text
backend/server.js
backend/modules/diagnostics.js
frontend/dashboard-v2/src/app/navigation.js
frontend/dashboard-v2/src/app/moduleRegistry.js
frontend/dashboard-v2/src/services/apiClient.js
frontend/dashboard-v2/src/modules/stream-pc/StreamPcStatusPage.jsx
frontend/dashboard-v2/src/services/localStatusClient.js
```

Nicht sofort bauen:

```text
Kontrollierter Online-Sync lokaler Aenderungen
OBS-/Sound-/Overlay-/Command-Steuerung
produktive lokale Writes
```

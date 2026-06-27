# Next Steps

Stand: 2026-06-27

Naechster sinnvoller technischer Schritt nach `0.2.10C - Dashboard-v2 V13/Modboard-Design wirklich uebernommen`:

```text
0.2.11 - Moduluebersicht read-only vorbereiten
```

Ziel:

1. Vorhandenen Menuepunkt `Module -> Moduluebersicht` aktivieren.
2. Im jetzt angeglichenen V13/Modboard-Layout bleiben.
3. Nur bestehende sichere lokale Status-/Diagnose-Daten lesen.
4. Geladene lokale Module, Routen-Status und geplante Migrationsbereiche anzeigen.
5. Keine Reload-, Refresh-, Test-, Log-, Session- oder Schreibroute aufrufen.
6. Keine Buttons, Actions oder Steuerfunktionen aktivieren.
7. `/dashboard` stabil lassen.

Pflicht-Pruefdateien:

```text
backend/server.js
backend/modules/diagnostics.js
frontend/dashboard-v2/src/app/navigation.js
frontend/dashboard-v2/src/app/moduleRegistry.js
frontend/dashboard-v2/src/services/apiClient.js
frontend/dashboard-v2/src/services/localStatusClient.js
frontend/dashboard-v2/src/modules/stream-pc/StreamPcStatusPage.jsx
frontend/dashboard-v2/src/styles/global.css
```

Nicht sofort bauen:

```text
Kontrollierter Online-Sync lokaler Aenderungen
OBS-/Sound-/Overlay-/Command-Steuerung
produktive lokale Writes
```

# STEP616 – Overlay-Clients in Bus-Diagnose anzeigen

Stand: 2026-05-30
Version: 0.1.0

## Ziel

Die bestehende Dashboard-Seite `bus_diagnostics` zeigt Overlay-Clients aus dem vorhandenen Communication Bus jetzt in einer eigenen kompakten Read-only-Sektion an.

## Betroffene Dateien

```text
htdocs/dashboard/modules/bus_diagnostics.js
htdocs/dashboard/modules/bus_diagnostics.css
docs/current/OVERLAY_MONITOR_STEP.md
project-state/STEP616_OVERLAY_CLIENT_DASHBOARD_VIEW.md
```

## Änderung

- `bus_diagnostics.js` filtert Communication-Bus-Clients mit `type === "overlay"` oder `id` mit Prefix `overlay:`.
- Es wird eine eigene Sektion `Overlay-Clients` gerendert.
- Angezeigt werden:
  - Overlay-Name / Client-ID / Modul
  - Status `online`, `stale`, `offline`, `dead`
  - Verbindungsstatus
  - letzter Heartbeat als relative Zeit und ISO-Zeit
  - Capabilities
- Der Schnellzugriff enthält zusätzlich den Testclient `/overlays/_overlay-bus-test.html?debug=1`.
- `bus_diagnostics.css` ergänzt nur Styles für die Overlay-Sektion.

## Bewusst nicht geändert

- Kein Backend.
- Kein OBS-Refresh.
- Keine OBS-Szenenprüfung.
- Keine echten Overlays angebunden.
- Keine Änderung am Communication Bus.
- Keine eigene Registry.
- Keine DB-Änderung.
- Keine Alert-/VIP-/Sound-/TTS-Flows geändert.

## Tests nach Entpacken

Syntaxcheck:

```powershell
cd D:\Git\stream-control-center
node --check htdocs\dashboard\modules\bus_diagnostics.js
```

Danach wie gewohnt:

```powershell
.\stepdone.cmd "Overlay Clients in Bus-Diagnose anzeigen"
```

Nach Backend-/Frontend-Deploy im Dashboard:

1. Dashboard öffnen.
2. Modul `Bus-Diagnose` öffnen.
3. Status laden.
4. Test-Overlay öffnen:

```powershell
Start-Process "http://127.0.0.1:8080/overlays/_overlay-bus-test.html?debug=1"
```

5. In der Bus-Diagnose muss unter `Overlay-Clients` mindestens `overlay:bus_test` erscheinen.

Kurzer API-Gegencheck, falls nötig:

```powershell
$r = Invoke-RestMethod "http://127.0.0.1:8080/api/overlay-monitor/status"
$r.overlays | Select-Object id,module,name,connected,status,lastHeartbeatAt
```

## Ergebnis-Erwartung

```text
overlay:bus_test
connected=True
status=online
```

Nach Schließen des Test-Overlays muss der Status nach kurzer Zeit auf `offline` wechseln.

## Nächster sinnvoller Schritt

Nach Sichtprüfung im Dashboard können echte Overlays einzeln und kontrolliert mit `overlay_bus_client.js` angebunden werden. Alerts sollten nicht als erstes echtes Overlay umgestellt werden.

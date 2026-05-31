# STEP620B – Overlay-Monitor Log-Spam reduzieren + Dashboard aufteilen

## Ziel

Der Overlay-Monitor wurde so angepasst, dass online/stale-Flapping nicht mehr dauerhaft das Node-Server-Log zumüllt. Gleichzeitig wurde die Dashboard-Seite `Control → Overlays` in klare Bereiche aufgeteilt.

## Geänderte Dateien

```text
backend/modules/overlay_monitor.js
htdocs/dashboard/modules/overlays.js
htdocs/dashboard/modules/overlays.css
```

## Backend

### Datei

```text
backend/modules/overlay_monitor.js
```

### Änderungen

- Modulversion auf `0.1.2` erhöht.
- `STATUS_API_VERSION` auf `1.0.2` erhöht.
- Neue Logging-Konfiguration ergänzt:

```js
logging: {
  consoleEnabled: true,
  seenConsole: false,
  suppressOnlineStaleConsole: true,
  statusChangeThrottleMs: 60000,
  alwaysLogStatuses: ['offline', 'dead'],
  alwaysLogTypes: ['overlay_missing']
}
```

- `overlay_seen` wird weiter intern als Event gespeichert, aber nicht mehr standardmäßig ins Server-Log geschrieben.
- `online ↔ stale` Status-Flapping wird intern weiter erfasst, aber standardmäßig nicht mehr ins Server-Log geschrieben.
- `offline`, `dead` und `overlay_missing` bleiben weiterhin sichtbar im Server-Log.
- Statistik `consoleLogsSuppressed` ergänzt, damit sichtbar bleibt, wie viele Console-Logs bewusst unterdrückt wurden.

## Dashboard

### Dateien

```text
htdocs/dashboard/modules/overlays.js
htdocs/dashboard/modules/overlays.css
```

### Änderungen

`Control → Overlays` wurde in Tabs aufgeteilt:

```text
Übersicht
Bus-Clients
OBS-Quellen
Probleme
Rohdaten
```

Die Seite zeigt weiterhin read-only:

- Overlay-Monitor-Status aus `/api/overlay-monitor/status?events=10`
- OBS-Status aus `/api/obs/status`
- OBS-Browserquellen aus `/api/obs/browser-sources`

## Nicht enthalten

- Keine DB-Migration.
- Keine OBS-Aktionen.
- Kein Ein-/Ausblenden.
- Kein Browser-Cache-Refresh.
- Keine Reparaturautomatik.
- Kein Mapping zwischen OBS-Quelle und Bus-Client.
- Keine Änderung an Overlay-HTML-Dateien.

## Test

```powershell
cd D:\Git\stream-control-center
node --check backend\modules\overlay_monitor.js
node --check htdocs\dashboard\modules\overlays.js
.\stepdone.cmd "STEP620B Overlay-Monitor Log und UI bereinigen"
```

Nach Backend-Neustart prüfen:

- Node-Log spammt nicht mehr dauerhaft `online -> stale` / `stale -> online`.
- `Control → Overlays` zeigt Tabs.
- `OBS-Quellen` bleibt read-only.

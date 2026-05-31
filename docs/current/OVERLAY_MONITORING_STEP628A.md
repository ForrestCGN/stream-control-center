# Overlay Monitoring – STEP628A

## Fokus

Manuelle OBS-Reparaturaktionen direkt aus dem Overlay-Monitor.

## Dashboard

Im Tab `OBS-Inventar` erscheinen bei reparierbaren Browserquellen Aktionen:

- Neu laden
- Cache
- Aus/An
- Aus oder An abhängig vom Sichtbarkeitsstatus

Platzhalter wie `about:blank` erhalten keine Reparaturbuttons.

## Backend

Neue Route:

```http
POST /api/overlay-monitor/obs-source/action
```

Payload:

```json
{
  "action": "cycle",
  "sceneName": "_Alerts",
  "sourceName": "_VIP-Sound 1.5",
  "inputName": "_VIP-Sound 1.5"
}
```

## Aktionen

- `refresh`: OBS-Browserquelle neu laden
- `refresh-cache`: Browserquelle mit Cache-Refresh neu laden, falls OBS verfügbar
- `show`: SceneItem sichtbar schalten
- `hide`: SceneItem ausblenden
- `toggle`: SceneItem umschalten
- `cycle`: kurz aus- und wieder einschalten

## Sicherheit

- Aktionen sind manuell
- sichtbare Quellen fragen vor kritischen Aktionen nach
- keine Automatik
- keine Reparaturbuttons für Platzhalter

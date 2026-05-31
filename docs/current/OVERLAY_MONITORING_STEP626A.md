# Overlay Monitoring – STEP626A

STEP626A ergänzt im Dashboard `Control → Overlays` einen Detail-Tab für einzelne Overlays.

## Was der neue Tab zeigt

Pro erkanntem Overlay / pro erkannter Browserquelle:

- Anzeigename
- OBS-Quelle
- Dateiname / URL
- Szene / Pfad inkl. verschachtelter Szenen
- direkte Sichtbarkeit
- effektive Sichtbarkeit
- Bus-Client
- Modul / Mode / Version
- letzter Hello
- letzter Heartbeat
- Heartbeat-Zähler
- Capabilities
- aktive und erledigte Monitoring-Issues

## Bewertung

Die technische Bus-ID bleibt sichtbar, wird aber um einen freundlichen Namen ergänzt. Dadurch sieht man schneller, welches echte Overlay gemeint ist.

## Grenzen

Dieser Step ist weiterhin read-only. Reparaturaktionen wie Cache neu laden oder Quelle aus/ein folgen separat.

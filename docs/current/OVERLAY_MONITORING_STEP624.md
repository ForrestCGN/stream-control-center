# Overlay Monitoring – STEP624

Der Overlay-Monitor arbeitet ab diesem Stand szenenbezogen.

## Bedienlogik
- Beim Öffnen ist automatisch die aktuelle OBS-Program-Szene ausgewählt.
- Bei OBS-Szenenwechsel folgt die Anzeige automatisch, solange im Dropdown „Aktuelle Szene automatisch folgen“ aktiv ist.
- Eine manuelle Szenenauswahl bleibt aktiv, bis wieder die Auto-Follow-Option gewählt wird.

## Bewertung
Pro Browser-/Overlayquelle der ausgewählten Szene werden weiterhin getrennt angezeigt:
- OBS-Quelle vorhanden
- Sichtbar ja/nein
- zugeordneter Bus-Client, falls erkennbar
- Hello/Heartbeat
- Gesamtbewertung

Ausgeblendete Quellen sind nicht automatisch Fehler. Kritisch ist vor allem: sichtbar, aber ohne Heartbeat.

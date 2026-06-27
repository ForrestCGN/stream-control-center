# Overlay Monitoring – STEP628C

STEP628C ergänzt die Bedienoberfläche des Overlay-Monitors um kompakte Icon-Reparaturbuttons.

## Zweck

Die OBS-Reparaturaktionen aus STEP628A/B sollen direkt dort verfügbar sein, wo ein Overlay auffällt: im Quellenstatus, in den Overlay-Details sowie weiterhin im OBS-Inventar.

## Icons

- `↻` – Browserquelle neu laden
- `🧹` – Browsercache neu laden
- `⏻` – Quelle ein-/ausblenden
- `⚡` – Quelle kurz aus/an

Die Icons haben Tooltips und `aria-label`, damit die UI kompakt bleibt, aber trotzdem verständlich ist.

## Sicherheit

- Keine Automatik.
- Keine Buttons bei Platzhaltern/about:blank.
- Sicherheitsabfrage bei sichtbaren Quellen bleibt erhalten.
- Bestehende STEP628B-API wird weiterverwendet.

# STEP628B – Nested OBS Repair Actions

Stand: 2026-05-31

## Zusammenfassung

Die Reparaturbuttons im OBS-Inventar wurden für verschachtelte OBS-Quellen korrigiert. Quellen, die über Unter-Szenen eingebunden sind, werden nun zuverlässiger als Teil des aktiven Program-Pfads erkannt und Sichtbarkeitsaktionen nutzen die echte `parentSceneName` + `sceneItemId`.

## Betroffene Dateien

- `backend/modules/overlay_monitor.js`
- `htdocs/dashboard/modules/overlays.js`
- `htdocs/dashboard/modules/overlays.css`

## Verhalten

- `Neu laden` und `Cache neu laden` wirken weiterhin auf die Browserquelle/Input.
- `Kurz aus/an` toggelt das konkrete SceneItem kurz aus und wieder an.
- `Ausblenden` / `Einblenden` ist der einfache manuelle Sichtbarkeits-Schalter.
- Bei inaktiven Program-Pfaden wird ein Hinweis angezeigt.

## Offene Punkte

- Echten OBS-Test mit verschachtelter Quelle durchführen.
- Danach ggf. UX der Buttons weiter vereinfachen.

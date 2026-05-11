# ALERT SYSTEM STEP175 – Navigation Fix + Design löschen

Stand: 2026-05-01

## Dateien

- backend/modules/alert_system.js
- htdocs/dashboard/modules/alerts.js
- htdocs/overlays/_overlay-alerts-v2.html

## Änderungen

- Fehler `parseChatTexts is not defined` im Dashboard behoben.
- Regeln / Staffelungen und Chat-/Overlay-Textseiten sind dadurch wieder aufrufbar.
- Design / Live-Vorschau: Button `Löschen` ergänzt.
- Standard-Design kann nicht gelöscht werden.
- Beim Löschen eines Designs fallen zugewiesene Regeln im Backend auf Standard zurück.
- `Grafik-Rahmen` im Editor zu `Grafik-Outline` bereinigt.
- Grafik-Outline nur noch `dezent` und `normal`.
- `Grafik zentrieren` zu `Zentrieren` gekürzt.
- Neue Chat-Textzeilen werden beim Bearbeiten oben eingefügt und direkt fokussiert.
- Innerer Rand beim Ausblenden der Innenlinie optisch bereinigt.

## Einbau

1. Dateien ersetzen.
2. Node neu starten.
3. Dashboard mit STRG+F5 neu laden.
4. OBS-Browserquelle aktualisieren / Cache leeren.

## Prüfung

- `node --check backend/modules/alert_system.js`
- `node --check htdocs/dashboard/modules/alerts.js`
- Overlay-Script extrahiert und mit `node --check` geprüft.

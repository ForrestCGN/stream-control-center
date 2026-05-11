# ALERT SYSTEM STEP173 – Alert/Design-Begriff korrigiert + Navigation zurückgesetzt

## Zweck
STEP172 hat die Regel-/Design-Speicherlogik zu stark vermischt. Dadurch konnten "Regeln / Staffelungen" und "Overlay-Texte" im Dashboard nicht mehr zuverlässig geöffnet werden.

STEP173 setzt das Dashboard auf den stabilen STEP171-Stand zurück und übernimmt nur die sauberen Änderungen:

- Im Bereich "Design / Live-Vorschau" bedeutet "+ Neuer Alert" jetzt: neues Alert-Design / neues Display-Profil erstellen.
- Kein Öffnen des Regel-Editors aus dem Designbereich mehr.
- Ein bestehend ausgewählter Alert wird beim Speichern nur selbst aktualisiert.
- Name/Beschreibung werden übernommen.
- Doppelte Alert-/Design-Namen werden frontend- und backendseitig verhindert.
- Chat-Textblock im Regel-Editor bleibt nur: Nein oder Textblock auswählen.
- Aus dem Textblock wird später zufällig genau ein Text genommen.
- Regeln / Staffelungen und Overlay-Texte bleiben wieder normal erreichbar.

## Dateien ersetzen
- backend/modules/alert_system.js
- htdocs/dashboard/modules/alerts.js
- htdocs/overlays/_overlay-alerts-v2.html

## Nach dem Einbau
1. Node neu starten
2. Dashboard mit STRG+F5 neu laden
3. OBS-Browserquelle aktualisieren / Cache leeren

## Prüfung
- node --check backend/modules/alert_system.js
- node --check htdocs/dashboard/modules/alerts.js

# STEP007 - Dashboard Mojibake repariert

Stand: 2026-05-03

## Ziel

Sichtbare Encoding-/Mojibake-Fehler im Dashboard wurden behoben.

Betroffene Dateien:

- htdocs/dashboard/modules/adminconfigs.js
- htdocs/dashboard/modules/sound.js

## Ausgangslage

In beiden Dateien gab es kaputte UI-Texte, z. B.:

- fÃ¼r statt für
- GerÃ¤t statt Gerät
- PrioritÃ¤t statt Priorität
- Ã„nderungen statt Änderungen
- Â· statt ·
- â€” statt —

## Änderung

Es wurden ausschließlich sichtbare Text-/Encoding-Fehler korrigiert.

Keine Funktionslogik geändert.
Keine Routen geändert.
Keine Funktionen entfernt.

## Vorher-Dokumentation

Die ursprünglichen Treffer wurden gespeichert unter:

- project-state/STEP007_mojibake_findings_before.txt

## Tests

Lokal geprüft:

- node -c htdocs/dashboard/modules/adminconfigs.js
- node -c htdocs/dashboard/modules/sound.js
- Suche nach Mojibake-Mustern in beiden Dateien

Nach Deploy live geprüft:

- D:\Streaming\stramAssets\htdocs\dashboard\modules\adminconfigs.js
- D:\Streaming\stramAssets\htdocs\dashboard\modules\sound.js

Suchmuster:

- Ã
- Â
- â€
- �

Ergebnis:

- Keine Treffer mehr in den beiden Live-Dateien.

## Ergebnis

STEP007 erfolgreich abgeschlossen.

Dashboard-Texte im Sound-System und Admin-Config-Modul sind wieder lesbar.
GitHub/dev und Live sind sauber.

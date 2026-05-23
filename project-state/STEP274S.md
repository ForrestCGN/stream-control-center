# STEP274S – Media Dashboard Live-Filter ohne Lupe

## Ziel

Die Medienverwaltung soll beim Tippen direkt filtern: `R` zeigt passende Medien, `Ro` verfeinert sofort weiter. Der Lupe-Button bleibt als manuelle Sofort-Aktion erhalten, ist aber nicht mehr nötig.

## Geändert

- `htdocs/dashboard/modules/media.js`
  - Suchfeld reagiert auf `input` mit kurzem Debounce.
  - Modul-/Kategorie-/Statusfilter reagieren direkt auf `change`.
  - Enter im Suchfeld löst sofort aus.
  - Lupe bleibt für manuelles Anwenden vorhanden.

## Sicherheit

- Keine Backend-Änderung.
- Keine DB-Änderung.
- Keine Migration.
- Keine Funktionalität entfernt.

## Test

1. Dashboard öffnen.
2. Medienverwaltung öffnen.
3. In Audio/Recent im Suchfeld `R`, dann `Ro`, dann `Rox` tippen.
4. Ergebnisliste soll ohne Klick auf Lupe automatisch aktualisieren.
5. Modulfilter `commands` testen.
6. Kategorie `roxxy` testen.

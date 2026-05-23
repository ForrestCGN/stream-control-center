# STEP274S FIX1 – Media Dashboard Live-Filter Focus/Recent Fix

## Zweck
Hotfix fuer den Live-Filter der Medienverwaltung.

## Problem
Der Live-Filter aus STEP274S konnte im Dashboard weiterhin wie ein Lupe-Filter wirken bzw. beim Tippen nicht sauber sichtbar aktualisieren.
Ursachen:
- Im Recent-Tab wurde teilweise der falsche Listen-Typ geladen.
- Beim Re-Render nach Filteranwendung konnte das Suchfeld den Fokus verlieren.

## Änderungen
- Einheitliche Zielauswahl per activeListTarget().
- Live-Suche nutzt im Recent-Tab jetzt auch wirklich die Recent-Liste.
- Filter-Re-Render erhaelt Fokus und Cursorposition im Suchfeld.
- Eingabe reagiert mit kurzer Debounce-Zeit direkt beim Tippen.

## Geänderte Dateien
- htdocs/dashboard/modules/media.js

## Test
1. Dashboard hart neu laden.
2. Medienverwaltung öffnen.
3. In Recent oder Audio suchen: `R`, dann `Ro`, dann `Rox`.
4. Ergebnisliste muss ohne Klick auf die Lupe aktualisieren und der Cursor im Suchfeld bleiben.

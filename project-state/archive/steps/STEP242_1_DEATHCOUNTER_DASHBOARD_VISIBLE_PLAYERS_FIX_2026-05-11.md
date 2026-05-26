# STEP242.1 DeathCounter Dashboard sichtbare Spieler Fix

Datum: 2026-05-11

## Ziel

Kleiner Dashboard-Fix nach Browser-Test: Die Karte „Sichtbare Spieler“ zeigte keine Spieler, obwohl die API `selectedPlayerIds` korrekt lieferte.

## Betroffene Datei

- `htdocs/dashboard/modules/deathcounter.js`

## Änderung

- Overlay-State wird jetzt robust aus mehreren möglichen API-Formen gelesen:
  - `/api/deathcounter/v2/overlay` mit verschachteltem `overlay`
  - `/api/deathcounter/v2/status` mit `overlay`
  - Fallback aus Spieler-/Runtime-Daten
- Spieler-IDs werden beim Vergleich normalisiert.
- Übersicht und Steuerung nutzen dieselben Helper für Spieler- und Overlay-State.

## Bewusst nicht geändert

- Keine Backend-Änderung
- Keine DB-/Count-Migration
- Kein Overlay-Design
- Keine Streamer.bot-Änderung

## Test

- `node --check htdocs/dashboard/modules/deathcounter.js` OK
- Browser-Test: Community → DeathCounter, Karte „Sichtbare Spieler“ soll ForrestCGN und EngelCGN anzeigen.

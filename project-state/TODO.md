# TODO

Stand: STEP233 / Project Audit nach STEP232

## Blockiert bis Audit

- Keine weiteren Dashboard-Shell-Änderungen.
- Keine Hauptdashboard-Karten weiterbauen.
- Keine neuen Apply-/Patch-Scripte.
- Keine Regex-/Set-Content-Fixes.

## Audit-Aufgaben

- GitHub/dev mit Live-System vergleichen.
- Prüfen, ob STEP232-Dateien in Live und/oder GitHub/dev vorhanden sind.
- Prüfen, ob `htdocs/dashboard/index.html` fachlich korrekt verändert wurde.
- Prüfen, ob die Shell-Karte im echten Dashboard-Konzept überhaupt sinnvoll ist.
- Entscheiden:
  - STEP232 behalten
  - STEP232 bereinigen
  - STEP232 zurücknehmen
  - später sauber neu integrieren

## Offene fachliche Punkte

- StreamElements-Gamble läuft übergangsweise parallel. Später sauber ablösen oder endgültig deaktivieren.
- Gamble-Dashboard-UX im Browser manuell prüfen.
- Statistikbereich fachlich bewerten:
  - Zeitraum
  - Gesamt-Gambles
  - Wins/Losses
  - Netto
  - Top-Spieler später optional
- Dashboard-Rechte-/Sessionmodell später sauber an die echte Control-Center-Benutzerverwaltung anbinden.

# CURRENT STATUS

Stand: EVS-5b / Stream Events Text Game Rule Rebalance  
Datum: 2026-06-13  
Projekt: ForrestCGN / stream-control-center

## Zweck dieses Stands

EVS-5b korrigiert den Text-/Geheimsatz-Bereich im Event-Erstellen/Bearbeiten-Dialog fachlich und optisch.

## Bestätigte Grundlage

- EVS-2 Backendstatus wurde vom Nutzer erfolgreich getestet.
- EVS-3 Dashboard Skeleton wurde übernommen.
- EVS-4 MediaPicker-Prep wurde im Dashboard sichtbar getestet.
- EVS-4b Sound-/Video-Karten wurden sichtbar getestet.
- EVS-5 Text-Karten wurden getestet, aber als optisch schlechter bewertet.
- Nutzerhinweis bleibt verbindlich: `stepdone.cmd` vor Live-/Dashboard-Test.

## EVS-5b Änderung

Text-Spiel V1 ist jetzt fachlich festgelegt:

```text
- Erster kompletter Löser gewinnt.
- Keine weiteren Löser in V1.
- Kein Zeitfenster für weitere Löser.
- Satz wird nach Lösung aus der aktuellen Event-Rotation entfernt.
- Teiltreffer-Hinweise sind optional.
- Teiltreffer werden aus den Wörtern des Geheimsatzes berechnet.
- Pro Event/Satz/User/Wort wird nur einmal gemeldet/gezählt.
```

UI wurde vereinfacht:

```text
Geheimsatz / Lösungssatz
Erlaubte Antworten / Varianten
Punkte für den ersten richtigen Löser
Teiltreffer-Hinweise
```

Entfernt aus der UI:

```text
Hinweiswörter / Suchwörter
Zeitfenster für weitere Löser
```

## Nicht geändert

```text
Backend
Datenbank
Twitch-Chat-Auswertung
Sound-/Video-Playback
Overlay
Media-System
Sound-Konfig-Logik
```

## Testregel

Vor Live-/Dashboard-Test:

```powershell
.\stepdone.cmd "EVS-5b Stream Events Text Game Rule Rebalance"
```

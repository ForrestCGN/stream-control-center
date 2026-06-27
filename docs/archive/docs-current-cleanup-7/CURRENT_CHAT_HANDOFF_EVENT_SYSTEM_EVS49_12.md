# CURRENT_CHAT_HANDOFF_EVENT_SYSTEM_EVS49_12

Stand: 2026-06-18

## Kurzfassung
Wir arbeiten am Winner-Finale-Overlay des `stream_events` Event-Systems. EVS43 und EVS44 sind bestätigt. Das aktuelle Problem ist ausschließlich das Winner-Finale-Overlay.

## Harte Regeln
- Deutsch antworten.
- Ruhig, direkt, schrittweise.
- Erst prüfen, dann planen, dann auf ausdrückliches `go` warten.
- Keine Funktionalität entfernen.
- Keine Apply-/Patch-Scripte.
- Änderungen nur als vollständige Ersatzdateien mit echten Zielpfaden im ZIP.
- Produktive SQLite niemals ersetzen.
- Nach ZIP-Datei-Step: entpacken → `stepdone.cmd` ausführen → dann testen.
- Bei fehlenden Dateien exakt anfordern.
- Bestehende Systeme nutzen.

## Aktueller Stand
EVS49.12 wurde gebaut, aber ist nicht stabil:
- Test-URL zeigte nur schwarzen Hintergrund.
- Screenshot: Browser auf `event_winner_overlay.html?debug=boxes&grid=1&v=4912`, aber keine Grafik/Boxen sichtbar.

## Wichtigster nächster Auftrag
Nicht weiter designen. Erst EVS49.12 Schwarzbild reparieren.

Prüfen:
1. Browser-Konsole.
2. Lädt `winner_finale_bg_1920x1080.png`?
3. Wird `#stage.visible` gesetzt?
4. Wird `renderLayoutBoxes()` ausgeführt?
5. Funktioniert `?demo=long&state=final&debug=boxes&grid=1&v=4912`?
6. Gibt es JS-Fehler durch Funktionsreihenfolge oder Query-Modus?

## Ziel danach
Eine sichtbare Schablonenansicht:
- Hintergrund sichtbar.
- Komplette Slot-Schablonen sichtbar.
- Header-Schablone sichtbar.
- Top3-Schablonen sichtbar.
- Honor-Schablonen sichtbar.
- Keine echten Texte nötig.

## Danach
Wenn die Schablonen sichtbar sind:
- Komplette Slot-Container per Raster auf Rahmen setzen.
- Dann Innenzonen feinjustieren.
- Dann echte Texte/Avatare aktivieren.

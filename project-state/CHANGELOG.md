# CHANGELOG

## EVS-5c / Text Game Backend TODO Documentation – 2026-06-13

- Text-Spiel-Regel aus EVS-5b als verbindliches Backend-/Runtime-TODO dokumentiert.
- Festgelegt: erster kompletter Löser gewinnt, Satz danach aus Rotation entfernen.
- Festgelegt: Teiltreffer-Hinweise optional, Wörter aus Geheimsatz berechnen.
- Festgelegt: pro Event/Satz/User/Wort nur einmal melden/zählen.
- Festgelegt: Teiltreffer geben keine Punkte.
- TODOs für spätere Backend-, Config- und Multi-Text-Dashboard-Schritte ergänzt.
- Keine Codeänderung.
- Keine Datenbankänderung.
- Keine Runtime-Änderung.


## EVS-5b / Stream Events Text Game Rule Rebalance – 2026-06-13

- Text-Spiel-Regel für V1 festgelegt: erster kompletter Löser gewinnt.
- Weitere Löser und Zeitfenster für weitere Löser aus der UI entfernt.
- Hinweiswörter/Suchwörter-Feld aus der UI entfernt.
- Teiltreffer-Hinweise als optionale Einstellung vorbereitet.
- Teiltreffer-Regel vorbereitet: pro Event/Satz/User/Wort nur einmal melden/zählen.
- Text-Spiel-Layout wieder ruhiger/kompakter gemacht.
- Keine Backendänderung.
- Keine Datenbankänderung.
- Keine Chat-/Playback-/Overlay-Änderung.

## EVS-5 / Stream Events Text Game Config Layout Cleanup – 2026-06-13

- Text-Spiel-Konfiguration im Dashboard-Modal in Karten aufgeteilt.
- `Geheimsatz` als Pflichtbereich markiert.
- `Antworten & Hinweise` als optionaler Bereich markiert.
- Hinweiswörter/Suchwörter-Feld vorbereitet.
- Punkte und Zeitfenster in eigene Karte verschoben.
- Feldtext `Zeitfenster für weitere Löser` verständlicher formuliert.
- Keine Backendänderung.
- Keine Datenbankänderung.
- Keine Chat-/Playback-/Overlay-Änderung.

## EVS-4b / Sound Media Layout Cleanup – 2026-06-13

- Sound-Konfiguration im Dashboard-Modal in zwei Karten aufgeteilt.
- Audio-Schnipsel als Pflichtbereich markiert.
- Auflösungs-Video als optionaler Bereich markiert.
- MediaField-Buttons kompakter angeordnet.
- Keine Backend-/DB-/Playback-Änderung.

## EVS-4 / Media Picker Prep – 2026-06-13

- Sound-Schnipsel-Auswahl über vorhandenes Media-System vorbereitet.
- Optionales Auflösungs-Video über vorhandenes Media-System vorbereitet.
- Keine eigene Upload-Struktur gebaut.

## EVS-3 / Dashboard Skeleton – 2026-06-13

- Dashboard-Modul für Stream Events erstellt.
- Eventliste, Event-Erstellung, Validierung und Ranking-Anzeige vorbereitet.

## EVS-2 / Backend Foundation – 2026-06-13

- Backend-Modul `stream_events` erstellt.
- Routen, DB-Schema, Validierung, Ranking und Bus-Heartbeat vorbereitet.

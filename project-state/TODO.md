# TODO

Stand: EVS-5c / Text Game Backend TODO Documentation  
Datum: 2026-06-13

## Kurzfristig

- [ ] EVS-5b ZIP in `D:\Git\stream-control-center` entpacken.
- [ ] `node -c .\htdocs\dashboard\modules\stream_events.js` ausführen.
- [ ] `stepdone.cmd` für EVS-5b ausführen.
- [ ] Erst danach Dashboard/Live-System prüfen.

## Event-System

- [x] Backend-Basis `stream_events` erstellt.
- [x] Dashboard-Skeleton erstellt.
- [x] MediaPicker für Audio-Schnipsel vorbereitet.
- [x] MediaPicker für optionales Auflösungs-Video vorbereitet.
- [x] Sound-Konfiguration optisch in Audio/Video-Karten aufgeteilt.
- [x] Text-Spiel-Regel für V1 festgelegt: erster kompletter Löser gewinnt.
- [x] Teiltreffer-Hinweise als Konfiguration vorbereitet.
- [ ] Mehrere Sound-Schnipsel pro Event planen/umsetzen.
- [ ] Mehrere Text-/Geheimsätze pro Event planen/umsetzen.
- [ ] Sound-Rundensteuerung planen.
- [ ] Text-/Chat-Auswertung über `twitch.chat.message` planen.
- [ ] Event-Overlay planen.
- [ ] Playback-Anbindung an Sound-/Media-System planen.


## EVS-5c festgehaltene Backend-TODOs

- [ ] Text-Spiel-Regel im Backend umsetzen: erster kompletter Löser gewinnt.
- [ ] Nach Lösung Satz im aktuellen Event als gelöst markieren und aus Rotation entfernen.
- [ ] Keine weiteren Löser / kein Follow-up-Zeitfenster in V1 umsetzen.
- [ ] Teiltreffer-Hinweise runtimefähig machen.
- [ ] Teiltreffer-Wörter automatisch aus dem Geheimsatz berechnen.
- [ ] Pro Event/Satz/User/Wort speichern, welche Wörter bereits erkannt/gemeldet wurden.
- [ ] Doppelte Teiltreffer pro User/Satz/Wort nicht erneut melden/zählen.
- [ ] Optionalen Teiltreffer-Cooldown berücksichtigen.
- [ ] Teiltreffer ohne Punkte behandeln.
- [ ] Text-/Phrase-Items pro Event planen/umsetzen.
- [ ] Mehrere Geheimsätze pro Event planen/umsetzen.
- [ ] Chat-Auswertung über bestehendes `twitch.chat.message` / Communication Bus planen.
- [ ] Chatmeldungen über `helper_texts` / `module_text_variants` vorbereiten.
- [ ] Config-Dashboard für Event-System planen/einbauen.
- [ ] Text-Config / Multi-Texte im Dashboard planen/einbauen.

# TODO

Stand: EVS-5b / Stream Events Text Game Rule Rebalance  
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

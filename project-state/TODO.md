# TODO – stream_events / Event-System

Stand: 2026-06-13 nach EVS-17b

## Erledigt / bestätigt

- [x] Backend Foundation `stream_events`
- [x] Dashboard Skeleton
- [x] MediaPicker-Vorbereitung für Sound-Snippets und Reveal-Videos
- [x] Sound-Media-Layout Cleanup
- [x] Text-Spiel-Regeln bereinigt
- [x] Multi-Phrase Text-Config vorbereitet
- [x] Textvarianten / Multi-Texte vorbereitet
- [x] Dashboard Tabs aufgeräumt
- [x] Event-Übersicht + Editor-Modal Flow
- [x] Config-Dashboard vorbereitet
- [x] EventBus/Heartbeat integriert
- [x] Text-Chat-Runtime vorbereitet
- [x] Text-Testhelper
- [x] Text-ChatOutputs vorbereitet
- [x] Text-Report im Dashboard
- [x] User-Statistikfilter und User-Detailmodal
- [x] Statistik-Tab Layout Cleanup
- [x] Texte-Tab Bereichsfilter
- [x] Sound-Runtime vorbereitet
- [x] Sound-Testhelper
- [x] Sound-Report im Dashboard
- [x] Sound-Testchat-Antwortauswertung
- [x] Sound-Debug Accepted Answers

## Kurzfristig offen

- [ ] EVS-18: Echten `twitch.chat.message` Bus-Stream für Soundantworten nutzen.
- [ ] Prüfen, ob Text-Runtime und Sound-Runtime gemeinsam denselben Twitch-Chat-Event sauber auswerten, ohne sich gegenseitig zu stören.
- [ ] Sound-Misses zählen und im Report anzeigen, aber nicht spammen.
- [ ] Dashboard Sound-Spiel: aktive Runde noch deutlicher anzeigen.
- [ ] Dashboard Statistik/User-Popup nach EVS-16b/16c im Browser prüfen.

## Mittelfristig offen

- [ ] ChatOutput-Dispatcher vorbereiten.
- [ ] Config-Schalter für direkte Chat-Ausgabe vorbereiten.
- [ ] Sound-System-Playback-Anbindung vorbereitet und später geschützt aktivierbar machen.
- [ ] Event-Overlay vorbereiten.
- [ ] Event-Abschluss mit Top 3 vorbereiten.
- [ ] Langzeitstatistiken und User-Historie ausbauen.

## Sicherheits-/Architektur-TODO

- [ ] Keine direkte Twitch-Ausgabe ohne expliziten Go/Config.
- [ ] Kein direktes Sound-Playback ohne expliziten Go/Config.
- [ ] Sound-System-Queue nur über vorhandenes Sound-System und geschützt berühren.
- [ ] Keine zweite Media-/Player-Struktur bauen.
- [ ] Keine neue Textvarianten-Struktur bauen.
- [ ] Keine Funktionalität entfernen.

## Testbefehle allgemein

```powershell
node -c .\backend\modules\stream_events.js
node -c .\htdocs\dashboard\modules\stream_events.js
```

Status:

```powershell
Invoke-RestMethod http://127.0.0.1:8080/api/stream-events/status
Invoke-RestMethod http://127.0.0.1:8080/api/stream-events/text-runtime/status
Invoke-RestMethod http://127.0.0.1:8080/api/stream-events/sound-runtime/status
Invoke-RestMethod http://127.0.0.1:8080/api/stream-events/sound-runtime/report
```

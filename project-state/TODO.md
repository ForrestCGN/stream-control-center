# TODO – stream_events / Event-System

Stand: 2026-06-13 nach EVS-20

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
- [x] EVS-18: echten `twitch.chat.message` Bus-Stream für Soundantworten nutzen
- [x] EVS-18c: Eventwerte eventUid-gebunden/Archivregeln dokumentiert
- [x] EVS-19e: Sound/Text Parallel-UND-Regel bestätigt
- [x] EVS-20: ChatOutput Dispatcher Prep / Dry-Run-Status vorbereitet

## Kurzfristig offen

- [ ] EVS-20 im Live-System testen: `/chat-output/status`, `/chat-output/report`, `/chat-output/test-dispatch`.
- [ ] EVS-21: Dashboard-Anzeige für ChatOutput-Status/Report vorbereiten.
- [ ] Dashboard Sound-Spiel: aktive Runde noch deutlicher anzeigen.
- [ ] Dashboard Statistik/User-Popup weiter im Browser prüfen.

## Mittelfristig offen

- [ ] Live-Schalter-Konzept im Dashboard streamer-/modfreundlich sichtbar machen.
- [ ] Config-Schalter für direkte Chat-Ausgabe erst nach ausdrücklichem Go aktivierbar machen.
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
Invoke-RestMethod http://127.0.0.1:8080/api/stream-events/chat-output/status
Invoke-RestMethod http://127.0.0.1:8080/api/stream-events/chat-output/report
```

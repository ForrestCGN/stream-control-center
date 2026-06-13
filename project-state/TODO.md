# TODO – stream_events / Event-System

Stand: 2026-06-13 nach EVS-19e

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
- [x] EVS-18c: Event-Lifecycle-/Archiv-Regeln dokumentieren
- [x] EVS-19: Sound/Text Parallel-UND-Auswertung einführen
- [x] EVS-19a: Stealth-Testevent Helper reparieren
- [x] EVS-19b: Stealth-Testevent aktivieren und alte Testevents archivieren
- [x] EVS-19c/19d/19e: Options-/Context-Regressionen im Parallel-Testpfad reparieren
- [x] EVS-19e: eine Nachricht löst Sound UND Text im selben Event

## Kurzfristig offen

- [ ] Doku-/Dashboard-Anzeige für Kombi-Runtime noch im Browser prüfen.
- [ ] Text-Runtime-Report nach EVS-19e erneut gegen echtes Stealth-Event prüfen.
- [ ] Sound-Misses zählen und im Report übersichtlich anzeigen, ohne Chat-Spam.
- [ ] Dashboard Sound-Spiel: aktive Runde deutlicher anzeigen.
- [ ] Dashboard Statistik/User-Popup nach EVS-19e im Browser prüfen.

## Mittelfristig offen

- [ ] EVS-20: ChatOutput-Dispatcher vorbereiten.
- [ ] Config-/Dashboard-Schalter für direkte Chat-Ausgabe vorbereiten.
- [ ] Live-Ausgabe niemals ohne klaren Dashboard-Warnstatus aktivieren.
- [ ] Kombinierte ChatOutput-Zusammenfassung für gleichzeitige Sound+Text-Lösung planen.
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
- [ ] Hard-Delete von Events nur später mit Owner/Admin, Bestätigung und Audit.

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

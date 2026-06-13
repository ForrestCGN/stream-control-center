Wir arbeiten am Projekt `stream-control-center` von ForrestCGN, Modul `stream_events` / Event-System. Bitte auf Deutsch antworten und strikt schrittweise arbeiten: erst Infos/Plan, dann erst bei meinem ausdrücklichen `go` umsetzen. Wichtige Regel: **keine Funktionalität entfernen**. Immer echte aktuelle Dateien/Repo/ZIP als Source of Truth nehmen, keine Parallelstrukturen erfinden, vorhandene Systeme nutzen.

Repo/Umgebung:

```text
GitHub: ForrestCGN/stream-control-center
Branch: dev
Lokal: D:\Git\stream-control-center
Live: D:\Streaming\stramAssets
Dashboard: http://127.0.0.1:8080/dashboard
```

Projektregeln:

```text
- Keine Funktionalität entfernen.
- Keine neuen Parallel-Systeme bauen.
- Vorhandenen communication_bus/helper_communication nutzen, keinen neuen Bus.
- Vorhandenes sound_system nutzen, keinen zweiten Player.
- Vorhandenes Media-System/MediaPicker nutzen.
- Vorhandene helper_texts/module_text_variants für Texte nutzen.
- Dashboard streamer-/modfreundlich halten.
- Direkte Twitch-Chat-Ausgabe erst nach explizitem Go/Config.
- Direktes Sound-Playback erst nach explizitem Go/Config.
- Sound-System-Queue nicht unkontrolliert berühren.
- StepDone vor Live-/Systemtest.
- ZIPs immer mit echten Zielpfaden bauen.
- Keine Patch-/Apply-Scripte liefern.
```

Aktueller bestätigter Stand:

```text
EVS-17b – Sound Debug Accepted Answers
MODULE_VERSION = 0.5.4
MODULE_BUILD = STEP_EVS_17B_SOUND_DEBUG_ACCEPTED_ANSWERS
```

Wichtige Dateien:

```text
backend/modules/stream_events.js
htdocs/dashboard/modules/stream_events.js
htdocs/dashboard/modules/stream_events.css
docs/modules/stream_events.md
project-state/CURRENT_STATUS.md
project-state/TODO.md
project-state/NEXT_STEPS.md
project-state/FILES.md
project-state/CHANGELOG.md
```

Was bereits funktioniert:

```text
- stream_events Backend/Dashboard-Grundstruktur
- EventBus/Heartbeat über vorhandenen CommunicationBus
- Event-Erstellung/Bearbeitung/Validierung/Start/Cancel/Finish vorbereitet
- Dashboard-Tabs: Übersicht, Events, Texte, Config, Statistik, Overlay
- Statistik-Untertabs: Übersicht, Ranking, Text-Spiel, Sound-Spiel, User
- Texte-Tab mit Bereichs-Dropdown und Suche
- Text-Spiel Runtime: Worttreffer, Satzlösung, Wortpunkte, Satzpunkte
- Text-ChatOutputs vorbereitet, directSend=false
- User-Statistik mit User-Dropdown/Detailmodal/AutoReload vorbereitet
- Sound-Runtime prepared-only: next-round, resolve, unresolved, report
- Sound-Testevent mit Test-Snippets
- Sound-Testchat: richtige Antwort löst Runde, falsche Antwort spammt nicht
- Sound-Punkte werden ins gemeinsame Ranking gebucht
- Sound-ChatOutputs prepared-only
- Playback-Payloads prepared-only, directPlay=false
- Sound-System-Queue wird nicht berührt
- Debug Accepted Answers im API-/Dashboard-Test sichtbar
```

Zuletzt getestet:

```text
/api/stream-events/sound-runtime/report liefert:
- soundDebug.testOnly=True
- visibleFor=dashboard_api_debug_only
- acceptedAnswersByRound[]
```

Beispiele:

```text
test_sound_2:
engel disco | rentner disco | engel rentner disco

test_sound_1:
forrest heimleitung | heimleitung | forrest hymn | forrest hymne
```

Diese Debug-Antworten dürfen nur Dashboard/API-Test sein, nicht Overlay oder Twitch-Chat.

Nächster sinnvoller Step:

```text
EVS-18 – Sound Twitch Chat Answer Runtime
```

Ziel EVS-18:

```text
- echte twitch.chat.message Bus-Events für aktive Sound-Runden auswerten
- bestehende sound-runtime/test-chat Logik als Basis verwenden
- richtige Antwort löst aktive Soundrunde
- Punkte buchen
- sound.solved ChatOutput vorbereiten
- falsche Antworten nicht ausgeben/spammen
- keine direkte Twitch-Chat-Ausgabe
- kein direktes Sound-Playback
- keine Sound-System-Queue-Berührung
```

Wichtig: Text-Runtime nutzt auch Twitch-Chat. EVS-18 muss beachten, dass Sound- und Text-Runtime sich nicht gegenseitig stören. Erst prepared-only weiterarbeiten.

# CHANGELOG – stream-control-center

## 2026-06-18 – EVS52.9 Doku/Handoff: Chatquelle stoppen und sauber neu ansetzen

### Dokumentiert

- Diagnoseauswertung von `/api/communication/status` und `/api/twitch/events/status`.
- Festgehalten: spezifische `twitch.chat/message` Subscriber hatten `delivered=0`.
- Festgehalten: `twitch_events.eventSubChat` war aktiv, aber `notifications=0` und `chatMessagesEmitted=0`.
- Festgehalten: EVS52.6–EVS52.8 waren Diagnose-/Fallback-Versuche und dürfen nicht weiter blind ausgebaut werden.
- Zielarchitektur dokumentiert: eine zentrale normalisierte Chatquelle für Sound- und Satz-Teilspiel.
- Neuer Chat-Prompt für EVS52.9 erstellt.

### Keine Codeänderung

- Keine produktive Logik geändert.
- Keine DB-Änderung.
- Keine weiteren Hooks ergänzt.
- Sound-Spiel und Satz-Spiel wurden in diesem Doku-Step nicht angefasst.

## 2026-06-18 – EVS52.8 Twitch-Chat Bus-Fallback

- `stream_events` um Wildcard-Bus-Fallback fuer `twitch.chat.message` erweitert.
- Diagnose `text-runtime/live-debug` um `twitchChatBusFallback` erweitert.
- Testscript `EVS52_8_TWITCH_CHAT_BUS_FALLBACK_CHECK.ps1` ergänzt.
- Nach Diagnose nicht als fertige Lösung bestätigt.

## 2026-06-18 – EVS52.7 Twitch-Presence Chat-Bridge

- Twitch-Presence-Direct-Bridge für Satz-/Text-System ergänzt.
- Nach Diagnose nicht als fertige Lösung bestätigt.

## 2026-06-18 – EVS52.6 Live-Chat Direct-Bridge

- Direct-Bridge-Fallback über `twitch_events.handleIrcEvent()` ergänzt.
- Nach Diagnose nicht als fertige Lösung bestätigt.

## 2026-06-18 – EVS52.5 Text Live Flow Fix

- Satz-/Text-Runtime akzeptiert Dashboard-Aliase.
- Teiltreffer werden auch bei `wordPointsEnabled=false` erkannt.
- Testscript `EVS52_5_TEXT_LIVE_FLOW_CHECK.ps1` bestanden.

## 2026-06-18 – EVS52.4 Text-Chat-Ausgaben aktiv

- Satz-Spiel-Textvarianten vorbereitet.
- `helper_texts` und `helper_chat_output` vorgesehen.

## 2026-06-18 – EVS52.3 Satzlösung-Celebration Overlay

- 15s Celebration-Overlay bei kompletter Satzlösung vorbereitet.

## 2026-06-18 – EVS51.x / EVS50.x

- Punkte-Historie, Punktecheck, Satz-Testbereich, Duplikat-Schutz und kombinierter Sound/Text-Abschluss bestätigt.

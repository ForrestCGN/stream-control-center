# Modul-Doku – Stream Events / Eventsystem

Stand: 2026-06-18 – EVS52.21

## Aufgabe des Moduls

Das Modul `stream_events` verwaltet Events mit Sound- und Satz-/Text-Teilspielen, verarbeitet Twitch-Chatantworten, vergibt Punkte, führt Ranking und zeigt am Ende ein Gewinner-Finale im OBS-Overlay.

## Aktueller stabiler Schwerpunkt

EVS52.21 stabilisiert die Gewinner-Finale-Bedienung:

```text
Auswertung starten → sichtbar bleiben → manuell beenden → erneut abspielen
```

## Wichtige Dateien

```text
backend/modules/stream_events.js
htdocs/dashboard/modules/stream_events.js
htdocs/overlays/stream_events/event_winner_overlay.html
```

## Chat-Verarbeitung

Die produktive Chatverarbeitung läuft zentral über Twitch-Events/Communication-Bus. Sound- und Satz-/Textteilspiel nutzen dieselbe normalisierte Chatmessage.

Wichtig:

- keine doppelten Direct-Hooks blind ergänzen
- keine neue Parallel-Chatquelle bauen
- Bot-/Self-Filter beachten

Ignorierte Bot-/Systemlogins aktuell:

```text
heimaufsichtcgn
kofistreambot
streamstickers
streamelements
```

## Finale-Routen

```text
GET  /api/stream-events/events/:eventUid/finale
POST /api/stream-events/events/:eventUid/finale/start?confirm=1
POST /api/stream-events/events/:eventUid/finale/end?confirm=1
```

`start` erzeugt ein Finale oder spielt ein vorhandenes Finale erneut ab. Es soll nicht neu auslosen, wenn bereits ein Finale existiert.

`end` beendet/versteckt das aktive Finale.

## Dashboard-Finale-Buttons

```text
🏆 Auswertung starten
⏹ Finale beenden
🔁 Auswertung erneut abspielen
```

Regeln:

- Start nur bei beendetem Event mit Ranking und ohne vorhandenes Finale.
- Ende nur bei aktivem Finale.
- Replay nur bei vorhandenem, aber nicht aktivem Finale.

## Winner-Overlay

OBS-Link:

```text
http://127.0.0.1:8080/overlays/stream_events/event_winner_overlay.html
```

Regeln:

- Im Idle unsichtbar.
- Bei Finale-Start sichtbar.
- Während aktiver Auswertung nicht durch Poll/fehlenden Latest-State verstecken.
- Dasselbe aktive Finale nicht erneut rendern.
- Nur durch manuelles Finale-Ende ausblenden.

## Bekannte offene Punkte

- `!event status` prüfen/fixen.
- Bot-/Ignore-Liste dashboardfähig machen.
- Satz-/Teiltreffer-Textvarianten dashboardfähig machen.
- Finale-Overlay nach echtem Streamtest optisch finalisieren.

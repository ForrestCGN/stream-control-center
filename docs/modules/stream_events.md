# Modul-Doku – Stream Events / Eventsystem

Stand: 2026-06-19 – EVS52.26

## Aufgabe des Moduls

Das Modul `stream_events` verwaltet Events mit Sound- und Satz-/Text-Teilspielen, verarbeitet Twitch-Chatantworten, vergibt Punkte, führt Ranking und zeigt am Ende ein Gewinner-Finale im OBS-Overlay.

## Aktueller Stand

Der aktuelle Backend-Notfallstand ist:

```text
Datei: backend/modules/stream_events.js
moduleVersion: 0.5.92
moduleBuild: STEP_EVS52_26_WINNER_FINALE_NULLSAFE_PREVIEW
```

EVS52.26 ist ein minimaler Backend-Fix auf Basis des echten Live-Stands EVS52.25.

Behoben wurde ein Crash in der Finale-Preview, wenn ein Event fertig ist, Ranking vorhanden ist, aber noch kein `winnerFinale` existiert.

Fehler vor dem Fix:

```text
Cannot read properties of null (reading 'startedAt')
```

## Wichtige Dateien

```text
backend/modules/stream_events.js
htdocs/dashboard/modules/stream_events.js
htdocs/overlays/stream_events/event_winner_overlay.html
```

Für Reveal-Video/Sound-Schnittstelle zusätzlich relevant:

```text
backend/modules/sound_system.js
htdocs/overlays/sound_system_overlay.html
htdocs/overlays/event_runtime_overlay.html
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

`GET /finale` baut die Preview für das Dashboard.

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

EVS52.26 bestätigt:

```text
winnerFinale: null
finaleStarted: false
ranking.count: 2
canStartFinale: true
dashboardCanStartFinale: true
```

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

## Sound-/Reveal-Video-Schnittstelle

Nach einer richtigen Sound-Antwort kann ein Reveal-Video über das Sound-/Media-System abgespielt werden.

Aktuell zu prüfen:

- Video-Item muss sauber mit `mediaType=video` laufen.
- `durationMs` muss gesetzt bzw. vom Sound-System zuverlässig ermittelbar sein.
- `eventUid`, `roundUid` und `requestId` sollen zur Diagnose vorhanden sein.
- Nach Video-Ende muss die Sound-Queue automatisch freigegeben werden.
- Kanalpunkte-Sounds dürfen nicht dauerhaft blockieren.

Notfallbefehl bei blockierter Sound-Queue:

```powershell
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/sound/skip"
```

## Bekannte offene Punkte

Streamkritisch:

- Finale-Start nach EVS52.26 noch live/API testen.
- Reveal-Video/Sound-Queue-Safety prüfen.
- Soundrotation/Zufall prüfen.

Nicht sofort streamkritisch:

- `finaleActivity.active:true` bei `finaleStarted:false` bereinigen.
- `!event status` prüfen/fixen.
- Bot-/Ignore-Liste dashboardfähig machen.
- Satz-/Teiltreffer-Textvarianten dashboardfähig machen.

## Nicht wieder anfassen ohne konkreten reproduzierbaren Fehler

- zentrale Chatquelle Sound/Satz
- Punktevergabe
- Ranking
- Satzlösung/Duplicate-Logik
- Soundantworten
- Finale-Auslosungslogik
- Winner-Overlay-State-Maschine

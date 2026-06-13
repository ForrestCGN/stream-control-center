# CURRENT CHAT HANDOFF – EVS-18c Event Lifecycle Archive Rules

Stand: 2026-06-13
Projekt: `stream-control-center`
Modul: `stream_events`

## Aktueller bestätigter Stand

```text
MODULE_VERSION = 0.5.5
MODULE_BUILD   = STEP_EVS_18_SOUND_TWITCH_CHAT_ANSWER_RUNTIME
EVS-18c         = Doku-/Lifecycle-Regel-Step ohne Codeänderung
```

EVS-18 wurde vorher erfolgreich live/systemnah getestet:

```text
status.ok=True
subscriptionCount=9
soundChatMessagesProcessed=2
soundAnswerMisses=1
soundAnswerMatches=1
active=0
solved=4
soundScoreEntries=4
chatOutputs=4
playbackPayloads=0
directSend=False
```

Ranking im Testevent:

```text
soundtester: 55 Punkte / 2 Einträge
ForrestCGN: 45 Punkte / 2 Einträge
```

## Was EVS-18c festlegt

Eventdaten dürfen nicht blind gelöscht werden, nur weil ein neues Event gestartet wird.

Verbindliche Regeln:

- Jedes Event besitzt eine eigene `eventUid`.
- Alle Runtime-/Statistikdaten bleiben an diese `eventUid` gebunden.
- Neues Event = neue `eventUid` = eigenes Event-Ranking.
- Alte Werte dürfen nicht in aktive Reports gemischt werden.
- Alte Events sollen historisch/archiviert abrufbar bleiben.
- Standard ist Archivieren, nicht Löschen.
- Hard-Delete später nur geschützt: Owner/Admin, Bestätigung, Audit, konsistentes Löschen aller zugehörigen Eventdaten.

Aktuell relevante Datenbereiche:

```text
stream_events_events.event_uid
stream_events_score_entries.event_uid
stream_events_rounds.event_uid
stream_events_text_word_hits.event_uid
stream_events_text_phrase_solves.event_uid
```

## Geänderte Dateien in EVS-18c

```text
docs/modules/stream_events.md
project-state/CURRENT_STATUS.md
project-state/TODO.md
project-state/NEXT_STEPS.md
project-state/FILES.md
project-state/CHANGELOG.md
docs/current/CURRENT_CHAT_HANDOFF_EVS_18C_EVENT_LIFECYCLE_ARCHIVE_RULES.md
```

## Nicht geändert

```text
backend/modules/stream_events.js
htdocs/dashboard/modules/stream_events.js
htdocs/dashboard/modules/stream_events.css
Datenbank-Schema
Runtime-Logik
Dashboard-Logik
Twitch-Chat-Ausgabe
Sound-Playback
Sound-System-Queue
```

## Weiterhin bewusst deaktiviert

```text
directSend=false
directPlay=false
soundSystemTouched=false
queueTouched=false
preparedOnly=true
```

## Nächster sinnvoller Step

EVS-19 – Sound/Text Runtime Koexistenz + Stealth-Testevent

Ziel:

- Kombi-Event mit Sound + Text testen.
- Falsche Soundantwort darf Textprüfung nicht blockieren.
- Richtige Soundantwort darf nicht zusätzlich Textpunkte auslösen.
- Reports klar trennen, was Sound und was Text verarbeitet hat.
- Stealth-Testantworten nutzen, damit echter Chat-Test unauffällig bleibt.
- Keine direkte Twitch-Ausgabe.
- Kein direktes Sound-Playback.
- Keine Sound-System-Queue-Berührung.

## StepDone

Nach Einspielen dieses Doku-Steps:

```powershell
.\stepdone.cmd "EVS-18c Event Lifecycle Archive Rules"
```

Erst danach weiter testen oder EVS-19 beginnen.

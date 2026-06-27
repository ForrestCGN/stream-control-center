# STEP LC-CORE-POINTS-2A/2B/2C – Confirmed Core Flow

Stand: 2026-06-15

## Status

```text
Bestätigt / dokumentiert
```

## Zusammenfassung

Dieser Stand dokumentiert die nach `LC-CORE-POINTS-1` bestätigten Core-Prüfungen:

```text
LC-CORE-POINTS-2A – Diagnose/Logging für Runner/Presence
LC-CORE-POINTS-2B – EventBus/AutoRunner-Autostart
LC-CORE-POINTS-2C – Twitch Presence / aktive User
```

Es wurden keine Codeänderungen vorgenommen. Dieser STEP ist eine reine Doku-Konsolidierung.

## LC-CORE-POINTS-2A

### Ergebnis

```text
Das Diagnose-/Logging-Script wurde genutzt.
Normaler Online-Override ohne Confirm setzt twitch_events auf pending.
Pending ist kein echter AutoRunner-Starttest.
Loyalty kann den zentralen Stream-State per run-once lesen.
```

### Fachliche Erkenntnis

```text
Online-Override live=true ohne confirmed=true bedeutet:
manualOverride.live=true
streamState.status=pending
streamState.live=false
kein twitch.stream.online Event
kein AutoRunner-Autostart
```

## LC-CORE-POINTS-2B

### Ergebnis

```text
Confirmed Override funktioniert.
twitch_events publiziert twitch.stream.online.
Loyalty empfängt das Event und startet den AutoRunner automatisch.
Clear-Override publiziert twitch.stream.offline.
```

### Bestätigtes Verhalten

```text
POST /api/twitch/events/stream-state/override
Body: live=true, confirmed=true, status=confirmed

Ergebnis:
lastEventKey=twitch.stream.online
lastAction=online
onlineEmitted=1
Loyalty runner trigger=stream_state_start:twitch.stream.online
```

## LC-CORE-POINTS-2C

### Ergebnis

```text
Twitch Presence ist funktionsfähig.
Bot heimaufsichtcgn kann Twitch IRC verbinden und #forrestcgn joinen.
JOIN-Events werden gespeichert.
Active-User-Liste liefert aktuell presente User.
Loyalty-Presence-Runner verarbeitet diese User.
```

### Bestätigter Runner-Test

```text
presence.count=5
count=5
awarded=2
skippedUsers=3
errors=0
```

### Beobachtung

```text
Subscriber wurden im JOIN-basierten Test als subscriber=true erkannt,
aber subscriberTier kam als none.
Der Loyalty-Core nutzte korrekt den Subscriber-Fallback und vergab 6 Punkte.
```

### Offener Entscheid

```text
forrestcgn erhielt Watch-Punkte.
Bitte entscheiden, ob forrestcgn wieder dauerhaft in loyalty_ignored_users aktiviert werden soll.
```

## Keine Codeänderung

```text
Keine Backend-Datei geändert.
Keine produktive SQLite ersetzt.
Keine Commands aktiviert.
Keine Live-/Shadow-Umstellung.
Keine Giveaway-/Games-Änderung.
```

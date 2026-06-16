# NEXT_STEPS – stream-control-center

Stand: 2026-06-16

## Neuer Chat / nächster Startpunkt

Im neuen Chat mit diesem Block weitermachen:

```text
EVENTSYS-27B – Live-Statusfenster für laufende Events mit Punkten/Rangliste
```

## Ausgangslage

```text
EVENTSYS-27A ist funktional bestätigt.
Config-Fenster ist brauchbar aufgebaut.
Sound-Defaults werden gespeichert.
Event-spezifisches Einstellungsfenster ist vorhanden.
Sound-Schnipsel und Text-Spiel sind getrennte Editor-Fenster.
Konkrete Sound-Schnipsel-Validierung funktioniert.
Eventdetails aktualisieren sich nach Speichern ohne manuellen Reload.
```

## Wichtige aktuelle UI-Regel

```text
Config-Tab = globale Defaults für neue Events.
Event-Einstellungen = Regeln für ein konkretes Event.
Sound-Schnipsel-Fenster = Sound-Dateien, Antworten, optionales Video.
Text-Spiel-Fenster = Textaufgaben / Sätze / Lösungen.
Live-Statusfenster = laufendes Event, Punkte, Ranking, Rundenstatus.
```

Nicht wieder alles in ein langes Hauptmodal packen.

## Schritt 1 – EVENTSYS-27B planen/bauen

Ziel:

```text
Wenn ein Event läuft, soll ein eigenes Statusfenster geöffnet werden können.
```

Inhalt:

```text
Event-Status
- Eventname
- Status: läuft / pausiert / beendet
- Spieltyp: Sound / Text / Kombi
- gestartet seit
- aktive Runde
- verbleibende Antwortzeit, sobald Runtime aktiv ist

Punkte / Rangliste
- Platz
- User
- Punkte
- richtige Antworten
- schnellste Antwort, sobald messbar
- letzte Aktion

Rundenverlauf
- Schnipsel/Text
- gelöst / nicht gelöst / übersprungen
- Gewinner
- Punkte
- Zeit

Sound-Rotation
- offene Schnipsel
- gelöste Schnipsel
- nicht erkannte Schnipsel
- wieder eingereiht
- aus Rotation entfernt
```

## Schritt 2 – EVENTSYS-27C danach

```text
Manuelle Sound-Rundensteuerung.
```

Muss dauerhaft möglich bleiben:

```text
- zum Testen
- wenn der Streamer/Mod das Event bewusst steuern will
```

Geplante Buttons bei laufendem Sound-Event:

```text
- Nächsten Schnipsel abspielen/vorbereiten
- Runde überspringen
- Runde als ungelöst markieren
- Runde wiederholen
```

## Schritt 3 – EVENTSYS-27D danach

```text
Sound-/Media-Playback-Anbindung.
```

Vorher prüfen:

```text
- vorhandenes Sound-System
- vorhandenes Media-System
- vorhandene Playback-/Overlay-Routen
- kein paralleles Sound-System bauen
```

## Schritt 4 – EVENTSYS-27E danach

```text
Automatik: zufälliges Abspielen alle X ± Y Minuten.
```

Muss die Event-spezifischen Einstellungen aus EVS-27A verwenden:

```text
playbackMode
intervalMinutes
intervalJitterMinutes
orderMode
avoidImmediateRepeat
minRepeatDistance
solvedPolicy
unresolvedPolicy
autoStartFirstRound
autoAdvanceRounds
roundDelaySeconds
```

## Schritt 5 – EVENTSYS-27F danach

```text
Auflösungs-Video nach Lösung.
```

Regel:

```text
Wenn gelöst und Video vorhanden, Video gemäß Event-Einstellung abspielen.
```

## Schritt 6 – EVENTSYS-27G danach

```text
Chat-Ausgaben über helper_texts/helper_messages.
```

Textkeys vorbereiten:

```text
stream_events.sound.event.started
stream_events.sound.event.finished
stream_events.sound.round.started
stream_events.sound.round.solved
stream_events.sound.round.timeout
stream_events.sound.round.unresolved
stream_events.sound.round.video
stream_events.sound.event.no_more_snippets
```

Stil:

```text
CGN / Heimleitung / Rentner / Altersheim
kurz
chatgeeignet
mehrere Varianten
Platzhalterfähig
```

## Schritt 7 – EVENTSYS-27H danach

```text
Statistik-Ausbau.
```

Erfassen/anzeigen:

```text
- gespielt
- erkannt
- nicht erkannt
- schnellste Antwort
- Top-Spieler
- Lösungsquote
- Punkte
- pro Event und optional global
```

## Nicht tun

```text
Keine produktive SQLite ersetzen.
Keine neue Config-Parallelstruktur bauen.
Keine Twitch-Chat-Ausgaben direkt hart im Code senden.
Kein Sound-/Media-System parallel bauen.
Keine Automatik aktivieren, bevor manuelle Steuerung/Statusfenster testbar sind.
Keine alten Loyalty/Raffle-Next-Steps als aktuellen Eventsystem-Startpunkt verwenden.
Keine technischen API-Details in die normale Streamer-/Mod-UI kippen.
```

# CURRENT CHAT HANDOFF – EVS-5b Text Game Rule Rebalance

Stand: EVS-5b / Text Game Rule Rebalance  
Datum: 2026-06-13  
Projekt: ForrestCGN / stream-control-center

## Ausgangslage

EVS-5 hatte den Text-Spiel-Bereich optisch in mehrere Karten aufgeteilt. Der sichtbare Test zeigte, dass der Bereich dadurch kastenlastig und enger wirkt. Außerdem wurde fachlich geklärt, dass V1 keine mehreren Löser und kein Zeitfenster für weitere Löser benötigt.

## Nutzerentscheidung

Text-Spiel V1 soll so funktionieren:

```text
- Ein Satz ist aktiv.
- Der erste User, der den kompletten Satz oder eine erlaubte Variante richtig schreibt, bekommt Punkte.
- Danach ist dieser Satz im aktuellen Event erledigt und wird aus der Rotation entfernt.
- Es gibt keine weiteren Löser in V1.
- Teiltreffer-Hinweise sind erwünscht.
- Teiltreffer werden aus den Wörtern des Geheimsatzes berechnet.
- Pro Satz/Wort/User wird nur einmal gemeldet/gezählt.
- Diese Regel soll später konfigurierbar bleiben.
```

## EVS-5b Änderung

Geändert:

```text
htdocs/dashboard/modules/stream_events.js
htdocs/dashboard/modules/stream_events.css
```

Doku aktualisiert:

```text
docs/modules/stream_events.md
docs/current/CURRENT_CHAT_HANDOFF_EVS_5B_TEXT_GAME_RULE_REBALANCE.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
```

## UI-Anpassung

Der Text-Spiel-Bereich wurde wieder ruhiger/kompakter:

```text
Geheimsatz / Lösungssatz – Pflicht
Erlaubte Antworten / Varianten – Optional
Punkte für den ersten richtigen Löser
Teiltreffer-Hinweise – Optional
```

Entfernt aus der UI:

```text
Hinweiswörter / Suchwörter
Zeitfenster für weitere Löser
```

Neu vorbereitet:

```text
Teiltreffer im Chat melden
Hinweis-Regel:
- Neue Wörter pro User nur einmal melden
- Nur melden, wenn sich die Trefferzahl verbessert
Zusätzlicher Cooldown in Sekunden
```

## Wichtig

EVS-5b baut noch keine Chat-Auswertung. Es wird nur die Konfiguration und UI sauber festgelegt.

## Nicht geändert

```text
Backend
Datenbank
Media-System
Sound-System
Twitch-/Chat-Module
Overlay
Playback
```

## Testreihenfolge

Nach Entpacken nach `D:\Git\stream-control-center`:

```powershell
node -c .\htdocs\dashboard\modules\stream_events.js
.\stepdone.cmd "EVS-5b Stream Events Text Game Rule Rebalance"
```

Erst danach Dashboard/Live-System testen.

## Nächste sinnvolle Schritte

Nächster Schritt sollte nicht die komplette Chat-Auswertung sein, sondern zuerst die Datenpflege:

```text
EVS-6 – Multi Item Config Foundation
- mehrere Sound-Schnipsel pro Event
- mehrere Text-/Geheimsätze pro Event
- Hinzufügen/Bearbeiten/Entfernen
- Validierung je Eintrag
```

Danach:

```text
EVS-7 Sound-Rundensteuerung
EVS-8 Text-/Chat-Auswertung über twitch.chat.message
EVS-9 Overlay/Playback-Anbindung
```

# CURRENT CHAT HANDOFF – Event-System EVS43

Stand: 2026-06-17
Projekt: `stream-control-center`
Bereich: Stream Events / EventSound Runtime / Winner Finale

## Aktueller technischer Stand

### Bestätigt

- EVS36: Wartezeit überspringen funktioniert über normalen Event-/Sound-System-Flow.
- EVS36.1: Vorbereitete Runde kann korrekt gestartet werden.
- EVS36.2: Antwortzeit kommt immer aus den Event-Einstellungen, nicht pro Schnipsel.
- EVS37: Node-/Rechner-Neustart-Recovery funktioniert. Laufende/unterbrochene Runde wird `interrupted_requeued` und nicht gewertet.
- EVS38: Stream-Offline-Pause funktioniert im Grundfall. Event pausiert, manuelles Fortsetzen plant normale Wartezeit neu.
- EVS39: Dashboard zeigt „Nächster Schnipsel“ inklusive geplanter Zeit.
- EVS39.1: Dashboard-Countdown/Auto-Reload für nächsten Schnipsel läuft.
- EVS41: Manuelles `finished`, Finale-Freigabe und Gewinner-/Ranking-Grundlage sind vorbereitet.
- EVS42: Winner-Finale-Overlay existiert mit Demo-Modus.
- EVS42.1: Extended Winner Show mit längerer Top10→Top3→Gewinner-Show ist vorbereitet.
- EVS43: RuntimeGate nutzt jetzt den zentralen `twitch_events` Stream-State inkl. Manual Override.

## EVS43 Fehlerursache und Fix

Problem:

- Dashboard zeigte `ONLINE (Override)` über den zentralen Stream-State.
- `stream_events` wertete trotzdem `stream_offline`, weil das RuntimeGate noch rohe Twitch-/stream_status-Daten nutzte.
- Dadurch war `chatEvaluationActive=false`.
- Chatantworten kamen grundsätzlich an, wurden aber für EventSound nicht verarbeitet.

Nach EVS43:

- `stream_events` nutzt `twitch_events.getStreamState()` bzw. die zentrale Stream-State-Wahrheit.
- Manual Override Online zählt korrekt als online.
- `runtimeGate.active=true`.
- `chatEvaluationActive=true`.
- Antwort wurde erfolgreich erkannt und gespeichert.

Bestätigter Test nach EVS43:

```text
solved            : 1
soundScoreEntries : 1
userDisplayName   : ForrestCGN
sourceType        : sound_solved
reason            : sound_snippet_solved
points            : 10
status/result     : solved
answer            : Full House
```

## Wichtige Projektregeln

- Keine Funktionalität entfernen ohne Freigabe.
- Produktive DB niemals ersetzen/löschen/neu bauen.
- DB nur sanft erweitern.
- Eventpunkte bleiben eventgebunden und werden nicht automatisch ins Loyalty-System gebucht.
- Sound- und Textpunkte zählen gemeinsam zur Eventwertung.
- Finale/Auslosung darf nur starten, wenn Event `finished` ist.
- Test-/Manual-Override nach Tests wieder löschen oder TTL auslaufen lassen.

## Aktuell laufendes Testevent

```text
eventUid: evs_event_mqi781rt_f19c50c6c409
Name: 1.Kopie von Kopie von 1 Jahr Twitch
Status: active
Sound: aktiv
Text: nicht aktiv
```

Hinweis: Event weiterlaufen lassen, nicht manuell auf `finished` setzen, solange noch Live-/Runtime-Tests laufen sollen.

## Nächste sinnvolle Schritte

1. Freitag Live-Test fortführen:
   - Schnipsel-Autoablauf
   - Chatantwort-Erkennung
   - Punkte/Rangliste
   - Reveal nach Lösung
   - Timeout/Unresolved
   - Recovery bei Node-Neustart
   - Stream-Offline-Pause während aktiver Runde

2. Danach Winner-Finale weiter ausbauen/testen:
   - Event mit Punkten auf `finished` setzen
   - Finale-Preview prüfen
   - Winner-Overlay mit echten Daten testen
   - Top10/Top3/Show-Timing anpassen

3. Dashboard/Command später:
   - `!event` Befehle sauber ans bestehende Command-/ChatOutput-System anbinden
   - `!event fertig`, `!event auslosung`, `!event top`, `!event punkte`
   - Dashboard-Buttons für Pause/Fortsetzen/Recovery später nachziehen

## Bekannte offene Punkte

- Dashboard-Buttons für Stream-Offline-Pause/Fortsetzen sind noch nicht kritisch und bleiben TODO.
- Winner-Overlay ist aktuell Demo-/Show-fähig; echte Finale-Auslösung mit Overlay muss noch final getestet werden.
- Command-Grundlage ist vorbereitet, aber Chat-UX/ChatOutput-Anbindung muss später sauber umgesetzt werden.
- Finale sollte manuell per Dashboard oder `!event auslosung` gestartet werden, nur bei `finished`.

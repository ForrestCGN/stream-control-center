# Neuer Chat Prompt – Event-System nach EVS43

Wir arbeiten am Projekt `stream-control-center` von ForrestCGN.

Aktueller Bereich: Event-System / EventSound Runtime / Winner Finale.

Wichtigste Regeln:

- Immer echte Dateien prüfen, bevor Code geändert wird.
- Keine Apply-/Patch-Scripte, keine losen Teil-Dateien.
- ZIPs mit echten Repo-Pfaden ab Root liefern.
- Keine Funktionalität entfernen ohne Freigabe.
- Produktive SQLite-DB niemals ersetzen/löschen/neu bauen.
- Eventpunkte bleiben eventgebunden, Loyalty bleibt getrennt.
- Sound- und Textpunkte zählen gemeinsam zur Eventwertung.
- StepDone erst nach Einspielen/Deploy, danach testen.

Aktueller bestätigter Stand:

- EVS36: Wartezeit überspringen funktioniert.
- EVS36.1: Vorbereitete Runde kann gestartet werden.
- EVS36.2: Antwortzeit kommt immer aus Event-Einstellungen.
- EVS37: Recovery nach Node-/Rechner-Neustart funktioniert; aktive Runde wird `interrupted_requeued`.
- EVS38: Stream-Offline-Pause funktioniert im Grundfall; Fortsetzen manuell.
- EVS39/39.1: Dashboard zeigt nächsten Schnipsel inklusive Auto-Countdown/Reload.
- EVS41: `finished`/Finale-Grundlage und Gewinnerdaten vorbereitet.
- EVS42/42.1: Winner-Finale-Overlay mit Demo/Extended Show vorbereitet.
- EVS43: RuntimeGate nutzt jetzt zentralen `twitch_events` Stream-State inkl. Manual Override; Chatantworten werden wieder erkannt.

Wichtiger EVS43-Fix:

Vorher dachte `stream_events` trotz Dashboard-Override `stream_offline`, weil es rohe Twitch-API/stream_status-Daten nutzte. Dadurch war `chatEvaluationActive=false` und Antworten wurden ignoriert. Nach EVS43 ist `chatEvaluationActive=true`, wenn der zentrale Stream-State/Manual Override online ist. Ein Sound wurde erfolgreich gelöst und 10 Punkte gespeichert.

Aktuelles Testevent:

```text
eventUid: evs_event_mqi781rt_f19c50c6c409
Name: 1.Kopie von Kopie von 1 Jahr Twitch
Status: active
```

Nächster Fokus:

Erst den vermuteten Fehler bzw. laufende Tests analysieren, keine neuen Features blind bauen. Falls Runtime stabil bleibt, danach Winner-Finale mit echten Daten testen oder `!event` Commands sauber anbinden.

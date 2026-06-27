# Neuer Chat Prompt – Event-System EVS42.1

Wir arbeiten weiter am Projekt `stream-control-center` von ForrestCGN, Bereich Event-System / EventSound / Gewinner-Finale.

Bitte auf Deutsch, direkt und strikt schrittweise arbeiten.

Wichtig:
- Erst echte Dateien/aktuellen Stand prüfen.
- Ziel / Dateien / Änderung / Nicht geändert / Tests nennen.
- Auf ausdrückliches `go` warten.
- Keine Funktionalität entfernen.
- Keine DB löschen/ersetzen/neu bauen.
- Produktive DB: `D:\Streaming\stramAssets\data\sqlite\app.sqlite`.
- Sound-System bleibt Playback-Owner.
- Runtime-Overlay startet kein Audio.
- ZIPs nur mit echten Repo-Pfaden ab Root.
- StepDone erst nach Entpacken/Deploy, danach testen.

Aktueller Stand:
- EVS36: Wartezeit überspringen funktioniert.
- EVS36.2: Antwortzeit kommt immer aus Event-Einstellungen.
- EVS37: Node-/Rechner-Neustart Recovery requeued laufende Runden als `interrupted_requeued`.
- EVS38: Stream-Offline-Pause + manuelles Resume im waiting-Fall funktioniert.
- EVS39.1: Nächster Schnipsel wird im Dashboard mit Auto-Reload/Countdown angezeigt.
- EVS41: Finale-/Winner-Grundlage. Finale nur bei `status=finished` erlaubt.
- EVS42.1: Winner-Finale-Overlay Extended Show mit Demo-Modus vorhanden.

Wichtig: Forrest hat gerade gesagt, er glaubt, dass noch ein Fehler im System ist. Deshalb als erstes diesen Fehler konkret analysieren, bevor neue Features gebaut werden.

Bitte zuerst lesen/berücksichtigen:
- `docs/current/CURRENT_CHAT_HANDOFF_EVENT_SYSTEM_EVS42_1_DOCUMENTED.md`
- `docs/modules/stream_events_CURRENT_EVS42_1.md`
- `project-state/CURRENT_STATUS_EVENT_SYSTEM_EVS42_1.md`
- `project-state/TODO_EVENT_SYSTEM_EVS42_1.md`
- `project-state/NEXT_STEPS_EVENT_SYSTEM_EVS42_1.md`
- `project-state/CHANGELOG_EVENT_SYSTEM_EVS42_1.md`
- `project-state/FILES_EVENT_SYSTEM_EVS42_1.md`

Nächster Start:
1. Forrest nach dem konkreten Fehler/Log/Screenshot fragen oder vorhandene Meldung prüfen.
2. Modulstatus prüfen.
3. Nur den Fehler fixen, keine Zusatzfeatures.

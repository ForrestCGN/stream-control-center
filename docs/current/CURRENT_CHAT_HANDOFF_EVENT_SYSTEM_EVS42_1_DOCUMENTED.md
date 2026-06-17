# CURRENT_CHAT_HANDOFF_EVENT_SYSTEM_EVS42_1_DOCUMENTED

Stand: 2026-06-17 16:55

## Kontext

Projekt: `stream-control-center` von ForrestCGN.

Aktueller Block: Event-System / EventSound Runtime / Recovery / Gewinner-Finale.

Dieser Stand dokumentiert die heute umgesetzten und getesteten Schritte EVS34 bis EVS42.1. Der Fokus lag auf eventgebundenen Punkten, Sound-Runtime-Sicherheit, Recovery, Stream-Offline-Pause, Dashboard-Status und Gewinner-Finale-Overlay.

## Harte Regeln weiterhin gültig

```text
- Keine Funktionalität entfernen.
- Keine DB löschen, ersetzen oder neu bauen.
- Produktive SQLite bleibt: D:\Streaming\stramAssets\data\sqlite\app.sqlite
- Schemaänderungen nur sanft.
- Sound-System bleibt Playback-Owner.
- Runtime-Overlay startet kein Audio direkt.
- Event-System nutzt vorhandene Systeme: Sound-System, Media-System, Communication/EventBus, Dashboard-Struktur.
- Datei-/ZIP-Steps immer mit echten Repo-Pfaden ab Root.
- StepDone erst nach Entpacken/Deploy, danach testen.
```

## Aktuell bestätigter Funktionsstand

### Event-Punkte

```text
- Punkte sind eventgebunden.
- Sound-Schnipsel-Punkte und Satz-/Text-Punkte zählen gemeinsam für dasselbe Event.
- Loyalty-Punkte bleiben getrennt.
- Event-Ranking basiert auf stream_events_score_entries pro event_uid.
```

### Dashboard: Aktuelles Event / Punkte

```text
- Dashboard zeigt aktuelles Event mit Rangliste.
- Sound-/Text-/Gesamtpunkte sind getrennt sichtbar.
- Ranking wird eventbezogen angezeigt, nicht global.
```

### Sound-Runtime

```text
- Sound-Schnipsel laufen über das Sound-System.
- Antwortfenster startet nach Sound-Ende.
- Antwortzeit kommt immer aus den Event-Einstellungen, nicht pro Schnipsel.
- Counter läuft nach Event-Einstellung, z. B. 60 Sekunden.
- Wartezeit zwischen Schnipseln kann übersprungen werden.
- Prepared-Runden können korrekt über normalen Flow gestartet werden.
```

### Recovery / Absturzsicherheit

```text
- Aktive Events bleiben nach Node-/Rechner-Neustart erhalten.
- Punkte bleiben erhalten.
- Gelöste Schnipsel bleiben gelöst.
- Aktive/laufende Sound- oder Antwort-Runden werden bei Recovery nicht gewertet.
- Unterbrochene Runden werden als interrupted / interrupted_requeued markiert.
- Der betroffene Schnipsel wird wieder in die Rotation gelegt.
- Event geht danach in sicheren Wartezustand.
```

Bestätigter Testfall:

```text
status: interrupted
result: interrupted_requeued
resultData.interrupted: true
resultData.requeuedAfterRecovery: true
resultData.recoveryReason: node_start
resultData.answerWindowCloseReason: recovery_requeued
```

### Stream-Offline-Pause

```text
- Stream-Offline-Pause funktioniert im Grundfall.
- Aktives Event wird auf runtimeStatus=paused gesetzt.
- runtimePhase=stream_offline_paused.
- Manuelles Fortsetzen setzt runtimeStatus wieder active und plant normale Wartezeit neu.
- Automatisches Fortsetzen nach Stream-Online ist bewusst nicht aktiv.
```

Noch offener Test:

```text
Stream-Offline-Pause während laufendem Sound/Antwortfenster am Freitag testen.
Erwartung: activeRound wird interrupted_requeued, Event pausiert, Punkte bleiben.
```

### Dashboard: Nächster Schnipsel

```text
- Sound-Steuerung zeigt "Nächster Schnipsel".
- Geplante Startzeit und Countdown werden angezeigt.
- Countdown läuft lokal jede Sekunde.
- Backend-Status wird alle 10 Sekunden automatisch nachgeladen.
- interrupted wird nicht mehr missverständlich als aktive Runde angezeigt.
```

### Winner / Finale-Grundlage

```text
- Event kann manuell auf status=finished gesetzt werden.
- Finished bedeutet: Event fachlich beendet, Auslosung/FInale freigegeben.
- Finale darf nur starten, wenn Event status=finished ist.
- Finale blockt korrekt bei status=active mit blockedReason=event_not_finished.
- Gewinnerdaten/Top3/Gleichstand-Auslosung sind backendseitig vorbereitet.
- Wenn keine Punkte vorhanden sind, gibt es keinen Gewinner.
```

### Gewinner-Finale-Overlay

```text
Datei:
htdocs/overlays/stream_events/event_winner_overlay.html

EVS42:
- Demo-Modus single/tie.
- CGN-Neon-/Altersheim-/Rentner-Style.
- Top3/Gewinnerkarte/Gleichstands-Auslosung.

EVS42.1:
- Extended Show.
- Top10 bis Top4 werden nach und nach angezeigt.
- Top3 bekommen schönere Einblendungen.
- Gewinner-Finale mit Konfetti/Glow.
- Speed-Modus: fast / normal / slow.
```

Demo-URLs:

```text
http://127.0.0.1:8080/overlays/stream_events/event_winner_overlay.html?demo=single&speed=fast
http://127.0.0.1:8080/overlays/stream_events/event_winner_overlay.html?demo=single&speed=normal
http://127.0.0.1:8080/overlays/stream_events/event_winner_overlay.html?demo=single&speed=slow
http://127.0.0.1:8080/overlays/stream_events/event_winner_overlay.html?demo=tie&speed=slow
```

## Aktuelle Step-Kette

```text
EVS34   Aktuelles Event Info Dashboard
EVS35   Event Config Startprüfung UX
EVS36   Sound Wartezeit überspringen
EVS36.1 Prepared Round Fix
EVS36.2 Sound Antwortzeit aus Event-Einstellungen
EVS37   Runtime Recovery Requeue
EVS37.1 Runtime Recovery Load Fix
EVS38   Stream Offline Pause
EVS39   Nächster Schnipsel Status
EVS39.1 Nächster Schnipsel Auto-Reload
EVS41   Winner Finale Foundation
EVS41 Testfix nur Testscript
EVS42   Winner Finale Overlay
EVS42.1 Winner Overlay Extended Show
```

## Zuletzt erwähnter möglicher Fehler

Forrest sagte, dass vermutlich noch ein Fehler im System existiert und wir nochmal am System arbeiten müssen. Der konkrete Fehler wurde noch nicht analysiert.

Wichtig beim nächsten Chat:

```text
1. Nicht raten.
2. Erst Logs/Status/konkrete Fehlersituation abfragen.
3. Kein weiterer Umbau, bevor der Fehler eingegrenzt ist.
4. Laufendes Event möglichst nicht unnötig auf finished setzen.
```

## Wichtige Testbefehle

Modulstatus:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status" |
  Select-Object ok,module,moduleVersion,moduleBuild,lastError
```

Recovery:

```powershell
powershell -ExecutionPolicy Bypass -File ".\tools\test_stream_events_recovery.ps1"
powershell -ExecutionPolicy Bypass -File ".\tools\test_stream_events_recovery.ps1" -Execute
```

Stream-Offline-Pause:

```powershell
powershell -ExecutionPolicy Bypass -File ".\tools\test_stream_events_stream_offline_pause.ps1"
powershell -ExecutionPolicy Bypass -File ".\tools\test_stream_events_stream_offline_pause.ps1" -Pause
powershell -ExecutionPolicy Bypass -File ".\tools\test_stream_events_stream_offline_pause.ps1" -Resume
```

Nächster Schnipsel Status:

```powershell
powershell -ExecutionPolicy Bypass -File ".\tools\test_stream_events_next_snippet_status.ps1"
```

Winner/Finale:

```powershell
powershell -ExecutionPolicy Bypass -File ".\tools\test_stream_events_winner_finale.ps1"
powershell -ExecutionPolicy Bypass -File ".\tools\test_stream_events_winner_finale.ps1" -EventUid "DEINE_EVENT_UID" -Finish
powershell -ExecutionPolicy Bypass -File ".\tools\test_stream_events_winner_finale.ps1" -EventUid "DEINE_EVENT_UID" -Finale
powershell -ExecutionPolicy Bypass -File ".\tools\test_stream_events_winner_finale.ps1" -CommandAuslosung
```

Winner-Overlay:

```powershell
powershell -ExecutionPolicy Bypass -File ".\tools\test_stream_events_winner_overlay.ps1"
powershell -ExecutionPolicy Bypass -File ".\tools\test_stream_events_winner_overlay_extended.ps1"
```

## Nächste sinnvolle Arbeitsschritte

### Sofort / Fehleranalyse

```text
- Forrests vermuteten Fehler konkret prüfen.
- Benötigt werden: Screenshot/Log/Statusausgabe und Zeitpunkt.
- Erst Fehler beheben, dann weiter Features.
```

### Freitag Live-Test

```text
- Sound-Auto-Ablauf testen.
- Wartezeit/Auto-Reload testen.
- Antwortfenster 60 Sekunden testen.
- Richtige Antwort + Punkte testen.
- Timeout + requeue_later testen.
- Recovery bei Node-Neustart testen.
- Stream-Offline-Pause während laufender Runde testen.
```

### Später / TODO

```text
- Dashboard-Buttons für Pause/Fortsetzen/Recovery-Hinweis ergänzen.
- !event Befehle final über vorhandenes Command-/ChatOutput-System anbinden.
- Winner-Finale Overlay live an echte Finale-Route/Bus-Event testen.
- Event-Ende/Completed-Flow finalisieren.
- Text-/Satz-Teil analog Sound-Runtime prüfen.
```

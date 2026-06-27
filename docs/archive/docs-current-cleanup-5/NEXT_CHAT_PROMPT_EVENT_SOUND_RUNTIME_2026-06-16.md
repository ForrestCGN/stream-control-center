# Prompt für neuen Chat – EventSound Runtime / Sound-System

Wir arbeiten im Projekt `stream-control-center` an Eventsystem + Sound-System + Runtime-Overlay.

Wichtige Regeln:

- Erst echte Dateien prüfen, nicht raten.
- ZIPs immer mit echten Zielpfaden ab Repo-Root liefern.
- Keine vorhandene Funktionalität entfernen.
- Sound-System bleibt Playback-/Queue-Owner.
- Eventsystem/Runtime-Overlay darf Sound nicht direkt starten und nicht am Sound-System vorbei arbeiten.
- Alles möglichst streamer-/modfreundlich und später dashboardfähig planen.

Aktueller bestätigter Stand:

- `stream_events.js`: `0.5.36 / STEP_EVENT_SOUND_5B_OUTPUT_TARGET_CONFIG`
- `sound_system.js`: `0.1.28 / STEP_SOUND_LOG_1_RECENT_PLAYBACK_LOG`
- `event_runtime_overlay.html`: `0.2.6`

Was funktioniert:

- EventSound nutzt echte Media-Snippets.
- Sound ist hörbar.
- Countdown-/Runtime-Overlay ist sichtbar.
- EventSound setzt nicht mehr hart `outputTarget=overlay`, sondern nutzt Sound-System-Default.
- Nach Sound-Ende gibt es global 2 Sekunden Pause.
- Queue startet erst nach dieser Pause weiter.
- EventSound-Overlay bleibt während der Pause sichtbar.
- Recent Playback Log ist vorbereitet:
  - `GET /api/sound/recent-playback?limit=20`

Wichtige TODOs:

- Pause zwischen Sounds muss ins Dashboard.
- Sound-System Verlauf/Zuletzt gespielt muss ins Dashboard.
- EventSound-Konfiguration muss ins Dashboard: Snippets, Countdown, Antwortzeit, Verhalten nach richtiger/falscher Antwort.
- Reveal-Video nach erkanntem Sound später über Media-System planen.

Nächster sinnvoller Test:

1. Normale Sounds testen.
2. Zwei Sounds direkt hintereinander testen.
3. Zwei Alerts testen.
4. EventSound erneut testen.
5. Verlauf prüfen:

```powershell
$log = Invoke-RestMethod "http://127.0.0.1:8080/api/sound/recent-playback?limit=20"
$log.items | Format-Table startedAt,finishedAt,status,soundId,label,source,category,playbackMs,gapMs -AutoSize
```

Nächster sinnvoller Entwicklungsstep:

`SOUND-DASH-1`: Dashboard-Bereich für Sound-System mit Pause zwischen Sounds und Recent Playback Log.

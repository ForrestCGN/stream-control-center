# Prompt für neuen Chat – EventSound Runtime / Sound-System

Wir arbeiten am Projekt `stream-control-center` von ForrestCGN.

Sprache: Deutsch. Kurz, direkt, pragmatisch. Keine wilden Annahmen. Vor Datei-/Codearbeiten echte Dateien prüfen. ZIPs mit echten Zielpfaden ab Repo-Root liefern. Nach ZIP-Einspielen: erst deployen, dann `.\stepdone.cmd "..."`, dann testen.

Aktueller Stand EventSound / Runtime / Sound-System vom 2026-06-17:

- `stream_events` Version `0.5.36`, Build `STEP_EVENT_SOUND_5B_OUTPUT_TARGET_CONFIG`
- `sound_system` Version `0.1.30`, Build `STEP_SOUND_GAP_2_PLAYBACK_LOG_AUDIO_END_AND_GAP_END`
- `event_runtime_overlay.html` Version `0.2.6`
- Sound-Dashboard Stand `SOUND-DASH-2B_RECENT_PLAYBACK_BADGE_UX`

Bestätigt:

- echtes Media-Snippet wird verwendet, nicht mehr nur generated beep
- Beispiel: `Alf 5 sek`
- Datei/URL:
  - `media/stream_events/1-jahres-event/Alf_5_sek.mp3`
  - `/assets/media/stream_events/1-jahres-event/Alf_5_sek.mp3`
- Sound ist hörbar
- Runtime-/Countdown-Overlay ist sichtbar
- Sound-System bleibt Playback-/Queue-Owner
- globale 2s Pause nach jedem Sound funktioniert
- Queue startet nach `gapEndedAt`
- Dashboard zeigt `Globale Sound-Pause` und `Zuletzt gespielt` unter `System -> Sound-System`

Fertige Steps:

- `EVENT-SOUND-5`
- `EVENT-SOUND-5B`
- `EVENT-SOUND-5C`
- `SOUND-GAP-1`
- `SOUND-LOG-1`
- `SOUND-DASH-1`
- `SOUND-DASH-1B`
- `SOUND-GAP-2`
- `SOUND-DASH-2`
- `SOUND-DASH-2B`

Wichtige Routen:

- `GET /api/sound/recent-playback`
- `GET /api/sound/event-preroll/status`
- `GET /api/sound/status`
- `GET /api/stream-events/status`
- `GET /api/stream-events/runtime-overlay/state`
- `POST /api/stream-events/sound-runtime/reset-test-state?confirm=1`
- `POST /api/stream-events/sound-runtime/create-test-event?confirm=1&useRealMedia=1`
- `POST /api/stream-events/sound-runtime/next-round?play=1&confirm=1`

Wichtige Tests:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status"
$s | Select-Object ok,module,moduleVersion,moduleBuild
$s.postPlaybackGap
$s.playbackLog

$log = Invoke-RestMethod "http://127.0.0.1:8080/api/sound/recent-playback?limit=20"
$log.items | Select-Object startedAt,audioEndedAt,gapStartedAt,gapEndedAt,finishedAt,status,soundId,label,source,category,playbackMs,gapMs | Format-Table -AutoSize
```

TODOs:

- EventSound-Konfiguration dashboardfähig machen
- Sound-Snippet-Auswahl über vorhandenes Media-System
- Countdown/Antwortzeit/Rotation/Ergebnisverhalten dashboardfähig machen
- Runtime-Overlay Ergebnis-/Auswertungsphase weiter ausbauen
- später Reveal-Video nach erkanntem Sound über vorhandenes Media-System ermöglichen
- Recent Playback um Filter/Detailansicht erweitern
- Pause zwischen Sounds später editierbar machen

Grundregel:

- Eventsystem/Runtime-Overlay darf Sound nicht direkt starten
- Sound-System bleibt Owner für Playback, Queue, Gating, Pause und Ausgabe
- Runtime-Overlay zeigt nur Status/Countdown/Guessing/Result an
- Ausgabeziel wird über Sound-System-Config entschieden, nicht hart im Eventsystem

# Changelog – EventSound Runtime / Sound-System

Stand: 2026-06-17

## 2026-06-17

### SOUND-DASH-1

- Sound-Dashboard unter `System -> Sound-System` erweitert.
- Neue sichtbare Bereiche: Globale Sound-Pause und Zuletzt gespielt / Recent Playback.
- Recent Playback liest `GET /api/sound/recent-playback?limit=20`.
- Globale Sound-Pause liest aus `GET /api/sound/status`.

### SOUND-DASH-1B

- `sound_system.js` auf `0.1.29` gesetzt.
- Build: `STEP_SOUND_DASH_1_BACKEND_STATUS_CLEANUP`.
- `dashboardTodo` aus öffentlichem Status entfernt.
- Keine Queue-/Playback-Logik geändert.

### SOUND-GAP-2

- `sound_system.js` auf `0.1.30` gesetzt.
- Build: `STEP_SOUND_GAP_2_PLAYBACK_LOG_AUDIO_END_AND_GAP_END`.
- Recent Playback trennt jetzt `startedAt`, `audioEndedAt`, `gapStartedAt`, `gapEndedAt`, `finishedAt`, `playbackMs`, `gapMs`.
- Bestätigt: Queue-Gate war funktional korrekt; die alte Anzeige war nur missverständlich.

### SOUND-DASH-2

- Dashboard-Tabelle `Zuletzt gespielt` an neue Felder angepasst.
- Globale Sound-Pause zeigt zusätzlich Audio-Ende und Gap-Ende.

### SOUND-DASH-2B

- UX-Badge im Recent Playback von `Aktiv` auf `Verlauf aktiv` geändert.
- Keine Backend-Änderung.

### Bestätigter Mischtest

Gemischter Test mit Alerts, Channelpoints/UserSounds und EventSound bestätigt:

```text
GifSub 1-4      Audio 19,3 s   Gap 2 s
100-249 Bits    Audio 15,4 s   Gap 2 s
Mädchen         Audio 9,4 s    Gap 2 s
Husten          Audio 2,4 s    Gap 2 s
```

Die Starts der Folgesounds lagen jeweils direkt nach `gapEndedAt`, nicht nach `audioEndedAt`. Damit ist die 2s Pause funktional bestätigt.

## 2026-06-16

- EventSound mit echten Media-Snippets vorbereitet.
- EventSound-Ausgabeziel an Sound-System-Config gekoppelt.
- Runtime-Overlay PreRoll-Fallback ergänzt.
- Globale 2 Sekunden Pause zwischen Sounds ergänzt.
- Recent Playback Log im Sound-System ergänzt.

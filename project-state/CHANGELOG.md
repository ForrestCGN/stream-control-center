# CHANGELOG – stream-control-center

## 2026-06-17 – EventSound Runtime Overlay / Counter / Result Cards

### Added

- Antwortzeit-Counter für EventSound-Antwortfenster.
- Counter oben rechts, deckender Hintergrund, nur während `answerWindow.active`.
- Keine-Lösung-Kachel nach Timeout.
- Long-Winner-Demo-URL:
  - `/overlays/stream_events/event_runtime_overlay.html?demo=result-long&v=test`
- Testscript für Timeout/Keine-Lösung:
  - `tools/test_event_runtime_unresolved_card.ps1`

### Changed

- Runtime-Overlay bis zuletzt auf Overlay-Stand `0.3.7` erweitert.
- Gewinner-Card robuster gemacht:
  - Username eigene Zeile.
  - Punkte/Erkennung eigene Zeile.
  - Schnipsel-Titel eigene zweizeilige Box.
  - lange Titel werden per Layout begrenzt statt hart auf 36 Zeichen gekürzt.
- Keine-Lösung-Kachel optisch/inhaltlich angepasst:

```text
KEINE LÖSUNG
Die Heimleitung hat im Chat
keine richtige Antwort erkannt.
Der Schnipsel bleibt im Archiv.
```

- Reveal-Video-Playback läuft weiter über Sound-System, aber ohne Runtime-PreRoll-Kreis.
- `JETZT RATEN` während Soundlauf entfernt, da Antworten erst nach Sound-Ende gültig sind.
- Auto-Schedule korrigiert: `intervalMinutes ± intervalJitterMinutes`, `roundDelaySeconds` nur Floor.

### Fixed

- Falscher Overlay-ZIP-Pfad aus früherem Step als bekannter Fehler festgehalten. Korrekt:

```text
htdocs/overlays/stream_events/event_runtime_overlay.html
```

- `AUFLOESUNG / AUFLOESUNG LAEUFT` beim Reveal entfernt.
- `LOS / JETZT RATEN` beim Reveal entfernt.
- Counter-Position von links nach rechts verschoben.
- Counter-Hintergrund ohne Transparenz gesetzt.

### Confirmed

- 30s-Test mit Lösung: Counter läuft, Antwort wird nach Delay gesendet, Result wird erkannt.
- Normale Gewinner-Card sieht brauchbar aus.
- Keine-Lösung-Kachel ist gewünscht und bleibt.
- Long-Winner-Layout wird künftig bevorzugt über Demo-URL geprüft, nicht über unzuverlässige Custom-Testevent-Route.

### Known Issues / Follow-up

- Reveal-Video-Sichtbarkeit hängt an `sound_system_overlay.html`/OBS-Quelle, nicht am Runtime-Overlay.
- Overlay-Texte sind teilweise noch hart gesetzt und sollen später in DB/Textvarianten.
- Auto-Rotation nach Reveal/Timeout über mehrere echte Runden prüfen.

---

# Ältere Einträge

Die vorherigen Einträge bleiben in älteren Archiv-/Step-Dateien erhalten. Dieser Stand konsolidiert den aktuellen EventSound-Runtime-Block.

## 2026-06-19 – STEP_HT1_HYPETRAIN_RECORD_SOUND_DASHBOARD

### Added

- Hype-Train EventSub-Weiterleitung von `twitch.js` nach `twitch_events` für:
  - `channel.hype_train.begin`
  - `channel.hype_train.progress`
  - `channel.hype_train.end`
- Interne Rekord-Erkennung in `twitch_events`:
  - `twitch.hypetrain.record_broken`
  - Gesamt-Rekord über `all_time_high_total`
  - Level-Rekord über `all_time_high_level`
  - nur ein Rekord-Sound pro Hype-Train.
- Hype-Train-Konfiguration:
  - `config/twitch_events.json`
  - Sound über `mediaId`
  - Priorität standardmäßig `1000`
  - Queue statt Interrupt als Standard.
- Dashboard-Erweiterung im Modul `Twitch Events`:
  - Tab `Hype-Train Rekord`
  - Media-Picker/Upload für Rekord-Sound
  - Runtime-Status
  - synthetischer Hype-Train-Test.
- Media-System-Kategorie:
  - `twitch_events / hypetrain-record`
- Tagebuch-Eintrag bei Hype-Train-Ende über bestehende `/api/tagebuch/entry` Route.

### Changed

- `twitch_events` Build auf `STEP_HT1_HYPETRAIN_RECORD_SOUND_DASHBOARD` erhöht.
- `twitch` Build auf `STEP_HT1_HYPETRAIN_FORWARD_TO_TWITCH_EVENTS` erhöht.
- Dashboard-Titel von `Twitch Event Simulator` auf `Twitch Events` geändert.

### Not changed

- Keine DB ersetzt.
- Kein Streamer.bot eingebunden.
- Kein Sound-System umgebaut.
- Keine bestehende Hype-Train-Cooldown-Cache-Logik entfernt.
- Keine Alert-Bridge verändert.

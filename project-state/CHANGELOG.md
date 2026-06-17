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

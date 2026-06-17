# Modul-Doku: stream_events – Stand EVS42.1

Stand: 2026-06-17

## Modul

```text
Backend:   backend/modules/stream_events.js
Dashboard: htdocs/dashboard/modules/stream_events.js
CSS:       htdocs/dashboard/modules/stream_events.css
Overlay:   htdocs/overlays/stream_events/event_runtime_overlay.html
Winner:    htdocs/overlays/stream_events/event_winner_overlay.html
```

Aktueller bekannter Backend-Stand nach EVS41:

```text
stream_events v0.5.59
Build: STEP_EVENT_WINNER_FINALE_FOUNDATION_1
```

Aktueller bekannter Dashboard-Stand nach EVS41/EVS39.1:

```text
stream_events Dashboard v0.5.41 bzw. Overlay unabhängig EVS42.1
```

Hinweis: EVS42/EVS42.1 waren Overlay-only und erhöhen die Backend-Version nicht.

## Kernregeln

```text
- Eventpunkte sind eventgebunden.
- Sound- und Textpunkte zählen gemeinsam für dasselbe Event.
- Loyalty bleibt getrennt.
- Sound-System ist Playback-Owner.
- Runtime-Overlay startet kein Audio.
- Unterbrochene laufende Runden werden nicht gewertet und requeued.
- Antwortzeit kommt immer aus Event-Einstellungen, nicht pro Schnipsel.
```

## Wichtige Tabellen / Daten

Bekannte/benutzte Tabellen:

```text
stream_events
stream_events_rounds
stream_events_score_entries
stream_events_text_phrase_solves
stream_events_text_word_hits
stream_events_runtime_state
```

`stream_events_runtime_state` wurde mit EVS37 eingeführt und speichert persistenten Runtime-State pro Event.

Wichtige Runtime-State-Felder:

```text
event_uid
runtime_status
phase
active_round_uid
phase_started_at
phase_ends_at
last_heartbeat_at
recovery_required
recovery_reason
recovery_note
updated_at
metadata_json
```

## Sound-Runtime

### Normaler Ablauf

```text
Wartezeit
→ optional Wartezeit überspringen
→ PreRoll/Countdown
→ Sound-System spielt Schnipsel
→ Sound-Ende
→ Antwortfenster nach Event-Einstellung
→ richtige Antwort oder Timeout
→ Ergebnis / Punkte / Requeue-Regel
→ nächste Wartezeit
```

### Antwortzeit

Verbindliche Regel:

```text
answerWindowSeconds = Event-Einstellung runtimeConfig.answerSeconds
Nicht pro Schnipsel.
```

### Wartezeit überspringen

Funktion:

```text
Wartezeit überspringen beendet aktuelle Pause und startet den nächsten Schnipsel über normalen Runtime-/Sound-System-Flow.
```

Nicht:

```text
Dashboard spielt Audio direkt.
Overlay spielt Audio direkt.
```

## Recovery-Regel Variante B

Wenn Node/Rechner/Stream während laufender Sound- oder Antwort-Runde unterbricht:

```text
- keine Punkte vergeben
- Runde nicht als gelöst zählen
- Runde als interrupted / interrupted_requeued markieren
- Schnipsel wieder in Rotation legen
- Event aktiv lassen oder pausieren, je nach Grund
- neue Wartezeit planen oder manuell fortsetzen
```

Bestätigter Zustand nach Recovery:

```text
status: interrupted
result: interrupted_requeued
resultData.interrupted: true
resultData.requeuedAfterRecovery: true
resultData.answerWindowCloseReason: recovery_requeued
```

## Stream-Offline-Pause

Grundfall bestätigt:

```text
runtimeStatus: active, runtimePhase: waiting
→ Pause
runtimeStatus: paused, runtimePhase: stream_offline_paused
→ Resume
runtimeStatus: active, runtimePhase: waiting
```

Manuelles Fortsetzen plant wieder normale Wartezeit.

## Dashboard Sound-Steuerung

Aktuell enthalten:

```text
- Aktuelle Runde
- Letzte Runde / Recovery-Hinweis
- Nächster Schnipsel
- Countdown bis nächster Schnipsel
- Auto-Reload alle 10 Sekunden
- lokaler Countdown jede Sekunde
- Wartezeit überspringen
```

Noch offen:

```text
- Button „Event fortsetzen“ bei paused
- deutlicher Recovery-Hinweis
- Stream-Offline-Pause im Dashboard bedienbar machen
```

## Finale / Winner Foundation

### Statuslogik

```text
active     = Event läuft
paused     = Event pausiert
finished   = fachlich beendet, Finale/Auslosung erlaubt
finalizing = Finale läuft gerade
completed  = Finale abgeschlossen
cancelled  = abgebrochen
```

Wichtig:

```text
Finale darf nur bei status=finished starten.
```

### Finale-Preview

Bei active:

```text
allowed: false
blockedReason: event_not_finished
canStartFinale: false
```

### Manuelles Finished

Geplant / vorbereitet:

```text
!event fertig
Dashboard: Auf Finished setzen
```

Regel:

```text
Offene Schnipsel/Sätze werden nicht weitergespielt.
Punkte bleiben erhalten.
Gewinner-Finale wird freigegeben.
```

## Winner Overlay

Datei:

```text
htdocs/overlays/stream_events/event_winner_overlay.html
```

Funktionen EVS42/EVS42.1:

```text
- Demo-Modus single/tie
- Speed-Modus fast/normal/slow
- Top10 bis Top4 nacheinander
- Top3 mit großen Einblendungen
- Gewinnerkarte
- Konfetti/Glow
- CGN-Neon-/Altersheim-/Rentner-Style
```

Demo:

```text
/overlays/stream_events/event_winner_overlay.html?demo=single&speed=fast
/overlays/stream_events/event_winner_overlay.html?demo=single&speed=normal
/overlays/stream_events/event_winner_overlay.html?demo=single&speed=slow
/overlays/stream_events/event_winner_overlay.html?demo=tie&speed=slow
```

## Geplante !event Befehle

Zuschauer/Mod-freundlich:

```text
!event
!event top
!event punkte
!event status
!event skip
!event pause
!event weiter
!event fertig
!event auslosung
!event finale
!event gewinner
```

Sicherheitsregeln:

```text
!event auslosung nur bei status=finished
!event fertig nur Mod/Owner
!event skip/pause/weiter nur Mod/Owner
!event top/punkte mit Cooldown für Zuschauer
```

## Offene technische Punkte

```text
- Konkreten von Forrest vermuteten Fehler analysieren.
- Text-/Satz-Teil vollständig gegen gleiche Runtime-Regeln prüfen.
- Dashboard-Buttons für paused/recovery nachziehen.
- Finale-Overlay live mit echtem Finale-Bus-Event testen.
- !event Commands final ins vorhandene Commands-/ChatOutput-System einhängen.
- Event Completed-Flow nach Finale definieren.
```

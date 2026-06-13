# CURRENT_CHAT_HANDOFF_EVS_19E_COMPLETION_DOCUMENTATION

Stand: 2026-06-13

## Projekt / Modul

`stream-control-center` / `stream_events`

## Aktueller bestätigter Code-Stand

```text
MODULE_VERSION = 0.5.11
MODULE_BUILD   = STEP_EVS_19E_TEXT_OPTIONS_REGRESSION_FIX
```

## Was wurde in EVS-19e bestätigt?

EVS-19e bestätigt die Sound/Text-Parallel-UND-Regel:

```text
Eine Chatnachricht wird an Sound UND Text gegeben.
Sound blockiert Text nicht.
Text blockiert Sound nicht.
Beide Runtimes buchen getrennt Punkte und bereiten getrennt ChatOutputs vor.
```

Finaler Test:

```text
Event: evs_event_mqcbpyjc_bf53fece7d25
Soundrunde: evs19_sound_schluessel
Nachricht: die heimleitung sucht den schluessel
soundSolved: true
textSolved: true
handledBy: sound, text
Soundpunkte: 30
Textpunkte: 40
chatOutputCount: 2
directSend: false
directPlayback: false
soundSystemQueueTouched: false
```

## Sicherheitsstatus

Weiterhin nicht produktiv aktiv:

```text
Keine direkte Twitch-Ausgabe.
Kein direktes Sound-Playback.
Keine Sound-System-Queue-Berührung.
Kein Overlay-Livebetrieb.
```

## Wichtig gelernte Punkte aus EVS-19

- Fix-ZIPs müssen künftig vor Übergabe gezielt gegen die betroffene Funktion geprüft werden.
- Besonders bei `options` vs. `context` in Runtime-Handlern muss die echte Funktionssignatur geprüft werden.
- Nach jedem Fix immer erst `node -c` und anschließend `moduleVersion/moduleBuild` prüfen.
- PowerShell zeigt nach fehlgeschlagenem Invoke-RestMethod weiterhin den alten Variablenwert; daher Fehlerausgabe nicht mit altem `$t` verwechseln.

## Dokumentationsstand

Mit diesem Step aktualisiert:

```text
docs/modules/stream_events.md
project-state/CURRENT_STATUS.md
project-state/TODO.md
project-state/NEXT_STEPS.md
project-state/CHANGELOG.md
project-state/FILES.md
docs/current/CURRENT_CHAT_HANDOFF_EVS_19E_COMPLETION_DOCUMENTATION.md
```

## Nächster sinnvoller Schritt

EVS-20 – ChatOutput Dispatcher Prep / Live-Schalter-Konzept

Vor Umsetzung klären/planen:

```text
- vorhandenes Chat-/Bot-Ausgabesystem nutzen
- keine zweite Ausgabestruktur bauen
- directSend=false bleibt Default
- Config-/Dashboard-Schalter vorbereiten
- Rate-Limit/Spam-Schutz
- Sound+Text-Kombi-ChatOutputs bündeln oder getrennt senden?
- deutlicher Dashboard-Warnstatus bei Live-Ausgabe
```

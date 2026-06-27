# TODO_RESCUE_2_ARCHIVE_SOURCE_DEEP_SCAN

Stand: 2026-06-27  
Step: `RDAP_TODO_RESCUE_2_ARCHIVE_SOURCE_DEEP_SCAN`

## Zweck

Rescue 2 wertet die in `project-state/PARKED_TODOS.md` aus Rescue 1 markierten Archivquellen gezielt nach. Ziel ist, belegte echte Langzeit-/Parkpunkte zu retten, ohne alte Step-Installationsreste oder erledigte CAN-Zwischenstaende wieder als offene Arbeit einzutragen.

## Gelesene Quellen

```text
docs/archive/docs-current-cleanup-7/CAN-43.7_todo_diagnostics_review.md
docs/archive/docs-current-cleanup-7/TODO_INTEGRATION_MAPPING_CAN42_4D.md
docs/archive/docs-current-cleanup-7/TODO_DETAIL_VALUES_MAPPING_CAN42_5B.md
docs/archive/docs-current-cleanup-7/TODO_INTEGRATION_RAW_COUNTS_CAN42_5C.md
docs/archive/docs-current-cleanup-7/TODO_DIAGNOSTICS_TAB_DISABLED_CAN42_5.md
docs/archive/docs-current-cleanup-7/TODO_DIAGNOSTICS_CENTRALIZATION_CAN42_4.md
docs/archive/docs-current-cleanup-7/TODO_STATUS_DIAGNOSTICS_STANDARD_CAN42_6.md
docs/archive/docs-current-cleanup-7/ADMIN_DIAGNOSTICS_TODO_STANDARD_BLOCK_CAN42_7.md
docs/archive/docs-current-cleanup-7/DIAGNOSTICS_STANDARD_ALL_MODULES_TODO_CAN42_6B.md
docs/archive/docs-current-cleanup-7/TODO_SOUND_DASHBOARD_RECENT_PLAYBACK.md
docs/archive/docs-current-cleanup-7/CURRENT_CHAT_HANDOFF_EVS_5C_TEXT_GAME_BACKEND_TODO_DOCS.md
docs/archive/docs-current-cleanup-7/CURRENT_CHAT_HANDOFF_EVS_8B_EVENTBUS_HEARTBEAT_TODO_DOCS.md
project-state/archive/step261-project-state-cleanup/old-step-docs/STEP177_TAGEBUCH_TODO_DB_ADMIN_BACKEND_2026-05-05.md
project-state/archive/step261-project-state-cleanup/old-step-docs/STEP201_3C_TODO_ROUTES_INTEGRATION_CHECK_2026-05-08.md
```

## Uebernommen / nachgetragen

- Diagnose-Standardisierung: zentrale Admin-Diagnose bleibt Wahrheit; alte Modul-Diagnosekarten/-Extensions erst nach positiver zentraler Abbildung und Sichttest deaktivieren.
- Weitere Module sollen nach Todo-Referenz an den Diagnostics-Standard angeglichen werden.
- Kandidaten fuer Diagnostics-Standardisierung: `tagebuch`, `commands`, `hug`, `message_rotator`, `overlay_monitor`, `bus_diagnostics`, `vip`, `alerts`, `sound_system`, `media`.
- Sound-Verlauf / Recent Playback: streamer-/modfreundliche Dashboard-Ansicht mit Filtern, Fehlern, gestoppten/uebersprungenen Sounds, Dauer und Gap.
- EVS Textspiel V1: erster kompletter Loeser, Satz danach erledigt/aus Rotation, keine weiteren Loeser/Zeitfenster, Teiltreffer ohne Punkte.
- EVS Textspiel Backend/DB: Satzstatus, geloester User/Zeitpunkt, Teiltreffer pro Event/Satz/User/Wort, Unique-Regel, Punktebuchung ins bestehende Ledger.
- EVS Chat-/Bus-Regel: Chat-Auswertung ueber vorhandenes `twitch.chat.message` / Twitch Events / Communication Bus, keine parallele Chatquelle.
- `stream_events` soll spaeter am vorhandenen Communication Bus teilnehmen, Heartbeats senden und Runtime-/Fehlerstatus publizieren.
- Tagebuch/Todo: Settings/Texte via Admin-Routen/Backend-APIs weiter pflegen/modernisieren; JSON bleibt Seed/Fallback, bestehende Chat-/Discord-/Stats-/Reload-Routen bleiben erhalten.

## Bewusst nicht wiederbelebt

- Alte lokalen Install-/Deploy-/Test-Kommandos aus einzelnen STEP-/CAN-Dokus.
- Bereits bestaetigte Todo-Diagnose-Zwischenziele aus CAN-42/CAN-43, wenn sie nur den damaligen Abschluss dokumentieren.
- Reine Statusnotizen ohne neuen offenen Produkt-/Architekturpunkt.

## Grenzen

- Keine Codeaenderung.
- Keine DB-Aenderung.
- Keine Remote-Modboard-Writes.
- Kein Webserver-Deploy.
- Keine harten Deletes.

## Ergebnis

`project-state/PARKED_TODOS.md` ist nach Rescue 2 deutlich vollstaendiger. Weitere Nachsuche ist nur noch themenspezifisch noetig, wenn ein konkreter Feature-Fokus geplant wird oder Forrest sich an weitere alte Planungen erinnert.

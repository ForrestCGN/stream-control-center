# CHANGELOG

## 2026-05-11 - STEP262 DeathCounter Overlay Alert-Frame Design + Slide-In/Out

- DeathCounter-Overlay optisch an den Alert-Aussenrahmen angepasst.
- Bar nutzt nun CGN-Gradient-Rahmen mit Cyan/Lila und dunklem Glass-Hintergrund.
- Haupt-Bar hat keinen zusaetzlichen Innenrahmen.
- Einblendung wurde auf Slide-In von oben umgestellt.
- Ausblendung wurde auf Slide-Out nach oben umgestellt.
- JavaScript-/Datenlogik des Overlays blieb unveraendert.
- Keine Backend-, DB-, Streamer.bot- oder API-Aenderung.

## 2026-05-11 - STEP261 project-state Cleanup / Archivierung

- Aufraeum-Script fuer `project-state` ergaenzt: `tools/step261_project_state_cleanup.js`.
- Einmaliger Windows-Apply-Befehl ergaenzt: `STEP261_APPLY_PROJECT_STATE_CLEANUP.cmd`.
- Alte project-state-Fragmente werden archiviert statt geloescht.
- Archivziel: `project-state/archive/step261-project-state-cleanup/`.
- Aktive Root-Dateien bleiben erhalten: `CURRENT_STATUS.md`, `CHANGELOG.md`, `FILES.md`, `NEXT_STEPS.md`.
- Aktuelle STEP-Historie ab STEP229 bleibt im Root sichtbar.
- Keine Code-, DB-, Runtime-, Overlay- oder Streamer.bot-Aenderung.

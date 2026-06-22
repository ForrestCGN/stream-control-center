# HT3.6 – HypeTrain Dashboard Diagnose/Wording Cleanup

Ziel: Das HypeTrain-Dashboard bleibt streamerfreundlich. Test-/Diagnosefunktionen werden nicht in die normale Event-Actions-Konfiguration gemischt.

## Änderungen

- `htdocs/dashboard/modules/hypetrain.js`
  - Event-Actions-Tab bleibt Konfiguration ohne Test-/Dry-Run-Buttons.
  - Tests-Tab heißt und wirkt stärker als Prüfungs-/Diagnosebereich.
  - Sichtbare Dry-Run-Begriffe wurden aus dem Dashboard-Wording entfernt oder entschärft.
  - End-Actions werden als Prüfung/Diagnose angezeigt, nicht als normaler Bedienbestandteil.
- `htdocs/dashboard/modules/hypetrain.css`
  - HT3.6-Kommentar ergänzt.
- `docs/modules/hypetrain.md` und `project-state/*` aktualisiert.

## Nicht geändert

- Kein Backend-Umbau.
- Keine Datenbankänderung.
- Kein neues Dashboard-Modul.
- Keine separaten `hypetrain_event_actions.*` Dateien.
- Keine produktiven Sounds aktiviert.

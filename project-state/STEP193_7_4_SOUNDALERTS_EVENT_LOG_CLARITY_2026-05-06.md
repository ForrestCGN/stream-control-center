# STEP193.7.4 - SoundAlerts Event-Log Klartext

Stand: 2026-05-06

## Ziel

Events im SoundAlerts-Dashboard klarer darstellen, wenn sie nur noch historische Log-Eintraege sind und kein aktueller Eintrag mehr existiert.

## Geaendert

- Events mit Status `unmatched`/`no_mapping` oder ohne aktuellen Eintrag werden im Events-Tab als `Kein aktueller Eintrag` angezeigt.
- Parse-Fehler werden als `Parse-Fehler` angezeigt.
- Historische Events bekommen eine erklaerende Detailzeile: passender Eintrag existiert aktuell nicht oder wurde geloescht.
- `Eintrag erstellen` wird nicht mehr bei unbrauchbaren Roh-/Parse-Events angeboten.
- `file_matched` wird im Dashboard als `Auto-zugeordnet` bezeichnet.

## Nicht geaendert

- Keine Backend-Aenderung.
- Keine API-Aenderung.
- Keine DB-Aenderung.
- Events bleiben als Historie erhalten.
- Replay bleibt nur fuer Events mit vorhandener Datei sichtbar.

## Betroffene Dateien

- `htdocs/dashboard/modules/soundalerts.js`
- `htdocs/dashboard/modules/soundalerts.css`
- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`

## Test

```powershell
node --check htdocs/dashboard/modules/soundalerts.js
```

Danach im Dashboard pruefen:

- SoundAlerts > Events
- alte geloeschte/unbekannte Events zeigen `Kein aktueller Eintrag`
- Parse-Fehler zeigen `Parse-Fehler`
- kein irrefuehrendes `Nicht eingerichtet` fuer geloeschte Alt-Events
- `Eintrag erstellen` erscheint nur bei sinnvoll erstellbaren Events

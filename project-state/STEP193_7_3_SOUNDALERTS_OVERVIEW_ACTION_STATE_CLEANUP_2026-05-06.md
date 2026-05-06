# STEP193.7.3 - SoundAlerts Overview Action-State Cleanup

Stand: 2026-05-06

## Ziel

Die SoundAlerts-Uebersicht soll nur dann "Handlung noetig" anzeigen, wenn wirklich ein aktiver Einrichtungsbedarf besteht. Historische oder unbekannte Events im Log duerfen nicht allein eine Handlung-noetig-Meldung ausloesen.

## Geaendert

- "Handlung noetig" erscheint nur noch, wenn mindestens ein Eintrag wirklich Einrichtung braucht.
- Unbekannte Events aus der Event-Historie loesen auf der Uebersicht keine Handlung-noetig-Box mehr aus.
- KPI "Auto-zugeordnet" wurde aus der Uebersicht entfernt.
- Die letzten 5 Events auf der Uebersicht zeigen nur noch abgespielte Events mit Datei.
- Diese Liste ist bewusst als schneller Replay-Bereich gedacht und zeigt deshalb nur noch "Neu starten".
- Replay nutzt weiterhin den echten Event-Index aus der Eventliste.

## Nicht geaendert

- Keine Backend-Aenderung.
- Keine API-Aenderung.
- Keine DB-Aenderung.
- Tabs Events, Eintraege, Statistik bleiben erhalten.

## Test

```text
node --check htdocs/dashboard/modules/soundalerts.js
```

## Betroffene Dateien

- `htdocs/dashboard/modules/soundalerts.js`
- `htdocs/dashboard/modules/soundalerts.css`
- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`

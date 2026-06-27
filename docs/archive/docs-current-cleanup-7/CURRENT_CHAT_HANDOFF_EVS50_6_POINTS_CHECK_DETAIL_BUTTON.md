# CURRENT CHAT HANDOFF – EVS50.6 Punktecheck-Detailbutton

Stand: 2026-06-18

## Ziel

Der Punktecheck im Dashboard-Test-Tab soll nach erfolgreichem Test direkt die User-Punkte-Historie für genau diesen Testlauf öffnen können. Das war nötig, weil der Tab **Aktuelles Event** korrekt das echte produktive Event anzeigt und nicht durch ein Dashboard-Testevent verdrängt werden darf.

## Umsetzung

Geändert:

- `htdocs/dashboard/modules/stream_events.js`
- `htdocs/dashboard/modules/stream_events.css`
- `docs/modules/stream_events.md`
- `project-state/TODO.md`
- `project-state/NEXT_STEPS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`

Dashboard-Version:

- `0.5.48`
- `STEP_EVS50_6_POINTS_CHECK_DETAIL_BUTTON`

## Verhalten

Nach `Event-System → Test → Punkte-Check Sound + Satz` erscheint in der Punkte-Prüfung ein Button:

- `Punkte-Historie dieses Tests öffnen`

Dieser Button ruft das bestehende User-Statistik-Popup mit `eventUid` des Testlaufs auf. Dadurch wird nicht mehr fälschlich das echte aktive Event geöffnet.

## Nicht geändert

- Backend-Punktelogik
- Produktive Event-Auswahl
- Aktuelles-Event-Tab
- DB-Schema
- Sound-/Satzwertung

## Test

```powershell
node -c .\htdocs\dashboard\modules\stream_events.js
node -c .\backend\modules\stream_events.js
```

Dashboard:

1. Event-System → Test
2. Punkte-Check Sound + Satz
3. Button `Punkte-Historie dieses Tests öffnen` klicken
4. Erwartung: Popup zeigt 50 Punkte / Sound 20 / Satz-Text 30 für den Punktecheck-Testlauf.

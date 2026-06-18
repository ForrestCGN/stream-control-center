# FILES – EVS52.16b relevante Dateien

Stand: 2026-06-18

## Geaenderte Dateien in diesem Step

```text
backend/modules/stream_events.js
htdocs/dashboard/modules/stream_events.js
docs/modules/stream_events.md
docs/current/CURRENT_CHAT_HANDOFF_EVS52_16_DASHBOARD_FINALE_BUTTON.md
project-state/CHANGELOG.md
project-state/TODO.md
project-state/NEXT_STEPS.md
project-state/FILES.md
```

## Relevante Routen

```text
GET  /api/stream-events/status
GET  /api/stream-events/events/:eventUid/finale
POST /api/stream-events/events/:eventUid/finale/start?confirm=1
GET  /api/stream-events/events/:eventUid/ranking
```

## Dashboard-Bereich

```text
Eventsystem -> Event verwalten
Button: Auswertung starten
```

Button-Regel EVS52.16:

```text
sichtbar nur wenn:
- Event status=finished
- Ranking hat mindestens einen Eintrag
- Winner-Finale wurde noch nicht gestartet
```

Nicht geaendert:

```text
Chatquelle
Soundlogik
Satzlogik
Punktevergabe
Bot-/Self-Filter
Datenbankstruktur
```


## EVS52.16b Zusatz

```text
htdocs/dashboard/modules/stream_events.js
htdocs/dashboard/modules/stream_events.css
```

Button sichtbar im Event-Verwalten-Buttonblock, wenn `finaleEligibility.canStart=true`.

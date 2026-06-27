# CURRENT CHAT HANDOFF – EVS-21 Event Archive/Delete Lifecycle Prep

Stand: 2026-06-13

## Ergebnis

EVS-21 ergänzt geschützte Lifecycle-Aktionen für alte Stream-Events.

```text
MODULE_VERSION = 0.5.13
MODULE_BUILD   = STEP_EVS_21_EVENT_ARCHIVE_DELETE_PREP
```

## Neue Routen

```text
POST /api/stream-events/events/:eventUid/archive
POST /api/stream-events/events/:eventUid/delete
```

## Fachregeln

- Archivieren ist nur für vollständig beendete Events erlaubt (`status=finished`).
- Draft/Ready/Active/Cancelled Events werden nicht archiviert.
- Archivieren löscht keine Werte; Statistik und Ranking bleiben eventUid-gebunden erhalten.
- Löschen ist statusunabhängig möglich, aber nur mit expliziter Bestätigung `confirm=DELETE`.
- Löschen entfernt:
  - `stream_events_events`
  - `stream_events_score_entries`
  - `stream_events_rounds`
  - `stream_events_text_word_hits`
  - `stream_events_text_phrase_solves`

## Sicherheitsstatus

Unverändert:

```text
directSend=false
directPlay=false
soundSystemTouched=false
queueTouched=false
```

## Testbefehle

Syntax:

```powershell
node -c .\backend\modules\stream_events.js
```

Archiv-Regel prüfen – aktives Event darf nicht archiviert werden:

```powershell
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/stream-events/events/<eventUid>/archive" -Body (@{} | ConvertTo-Json) -ContentType "application/json"
```

Erwartung bei active/ready/draft/cancelled:

```text
ok=false
error=event_not_finished
rule=archive_allowed_only_for_finished_events
```

Löschen ohne Confirm muss blockieren:

```powershell
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/stream-events/events/<eventUid>/delete" -Body (@{} | ConvertTo-Json) -ContentType "application/json"
```

Erwartung:

```text
ok=false
error=delete_confirmation_required
requiredConfirm=DELETE
```

Hard-Delete nur bewusst testen:

```powershell
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/stream-events/events/<eventUid>/delete" -Body (@{ confirm = "DELETE" } | ConvertTo-Json) -ContentType "application/json"
```

## Nächster Schritt

EVS-22 – Dashboard Safety View für ChatOutput + Event-Lifecycle.

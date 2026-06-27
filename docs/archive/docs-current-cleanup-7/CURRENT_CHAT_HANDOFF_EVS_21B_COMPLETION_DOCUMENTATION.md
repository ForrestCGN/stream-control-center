# CURRENT CHAT HANDOFF – EVS-21b Event Archive/Delete Completion Documentation

Stand: 2026-06-13

## Modulstand

```text
MODULE_VERSION = 0.5.13
MODULE_BUILD   = STEP_EVS_21_EVENT_ARCHIVE_DELETE_PREP
```

EVS-21b ist ein reiner Dokumentations-/Abschlussstep. Es wurden keine Runtime- oder Dashboard-Dateien geändert.

## Bestätigte Tests

### Version

```text
GET /api/stream-events/status
ok=true
moduleVersion=0.5.13
moduleBuild=STEP_EVS_21_EVENT_ARCHIVE_DELETE_PREP
lastError leer
```

### Archive-Sicherheit

Aktives Event:

```text
POST /api/stream-events/events/<activeEventUid>/archive
ok=false
error=event_not_finished
rule=archive_allowed_only_for_finished_events
```

Finished Event:

```text
POST /api/stream-events/events/evs_event_mqc98amt_044361564e8e/archive
ok=true
status=archived
metadata.archivedAt gesetzt
metadata.previousStatusBeforeArchive=finished
```

Archivieren löscht keine Werte. Beim Test blieben die zugehörigen Zähler erhalten:

```text
scoreEntries=5
rounds=5
textWordHits=0
textPhraseSolves=0
```

### Delete-Sicherheit

Ohne Confirm:

```text
POST /api/stream-events/events/<eventUid>/delete
ok=false
error=delete_confirmation_required
requiredConfirm=DELETE
```

Mit Confirm im JSON-Body:

```powershell
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/stream-events/events/$deleteUid/delete" -Body (@{
  confirm = "DELETE"
} | ConvertTo-Json) -ContentType "application/json"
```

Ergebnis:

```text
ok=true
deletedEvent.status=ready
countsDeleted.scoreEntries=0
countsDeleted.rounds=0
countsDeleted.textWordHits=0
countsDeleted.textPhraseSolves=0
```

Nachprüfung über Eventliste zeigte keine Ausgabe mehr für die gelöschte eventUid.

## Wichtige API-Details

```text
GET /api/stream-events/events liefert rows, nicht events.
Delete-Confirm wird per JSON-Body confirm="DELETE" erwartet.
Query-Confirm ?confirm=DELETE ist nicht ausreichend.
```

## Fachregel bestätigt

```text
Archivieren:
- nur bei status=finished
- behält Werte für Statistik/Historie

Löschen:
- für jeden Status möglich
- nur mit explizitem JSON-Body confirm="DELETE"
- entfernt Event plus eventUid-gebundene Daten
```

## Nächster sinnvoller Schritt

EVS-22 – Dashboard Safety View für ChatOutput + Event-Lifecycle:

```text
- ChatOutput-Status sichtbar machen
- TESTMODUS / LIVE AKTIV sichtbar machen
- Blocker anzeigen
- Eventliste rows korrekt nutzen
- Archivieren/Löschen streamerfreundlich absichern
- Archive nur bei finished sichtbar/aktiv
- Delete mit klarer Warnung und Bestätigung
- weiterhin keine direkte Twitch-Ausgabe
- weiterhin kein Sound-Playback
```

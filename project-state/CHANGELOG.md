# CHANGELOG

## 2026-06-26 - RDAP62_ADMIN_NOTE_UPDATE_STATUS_SEMANTICS_CLEANUP

RDAP62 bereinigt die Status-Semantik nach RDAP61/RDAP61B.

Ergebnis:

```text
/api/remote/status sagt nicht mehr pauschal, Update sei deaktiviert.
Create-Backend und Create-UI werden getrennt angezeigt.
Update-Backend wird als aktiv angezeigt.
Update-UI bleibt als nicht gebaut angezeigt.
Deactivate/Delete bleiben deaktiviert/verboten.
Community-Read bleibt verboten.
```

Geaendert:

```text
remote-modboard/backend/src/routes/status.routes.js
docs/current/RDAP62_ADMIN_NOTE_UPDATE_STATUS_SEMANTICS_CLEANUP.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP62.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

Nicht geaendert:

```text
Keine Update-UI.
Kein Deactivate.
Kein Delete.
Keine DB-Migration.
Keine neue Permission.
Keine Rollen-/Gruppen-/Permission-Writes.
Keine Community-Read-Freigabe.
Keine Agent-/OBS-/Sound-/Overlay-/Command-Steuerung.
```

Naechster empfohlener Step:

```text
RDAP62B_ADMIN_NOTE_UPDATE_STATUS_SEMANTICS_LIVE_CONFIRMED_DOCS
```

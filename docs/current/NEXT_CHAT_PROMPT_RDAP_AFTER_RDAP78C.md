# NEXT CHAT PROMPT - RDAP after RDAP78C

Du bist im Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

WICHTIG:
Halte dich strikt an die Arbeitsweise. Nicht raten, nicht blind bauen, keine parallelen Strukturen erfinden.

## Startdateien wirklich lesen

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/PROJECT_OVERVIEW_REMOTE_MODBOARD_CURRENT.md
docs/current/REMOTE_MODBOARD_UI_DESIGN_AND_STRUCTURE.md
docs/current/REMOTE_MODBOARD_ROADMAP_CURRENT.md
docs/current/RDAP76D_ADMIN_MODULE_REGISTRY_TARGET_PLAN.md
docs/current/ADMIN_MODULE_REGISTRY_DESIGN_CONTRACT.md
docs/current/RDAP78C_ADMIN_NOTES_NOTICE_HUMANIZER_STALE_COUNT_FIX.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP78C.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Aktueller Stand

```text
RDAP77B: Module Registry / Admin-Panels sichtbar exklusiv getestet.
RDAP78/RDAP78B/RDAP78C: Admin-Notes Zieluser-/Count-Kontext korrigiert.
RDAP78C korrigiert den stale Count aus simplifyAdminNotesNotice in remote-modboard.js.
```

## Wichtiger Befund

```text
Die Backend-Read-Route liest targetUserUid aus der Query und nutzt diesen fuer Summary/Notes.
Der zuletzt sichtbare falsche Count kam aus altem Frontend-Humanizer-State in remote-modboard.js.
```

## Naechster empfohlener Step

```text
RDAP79_ADMIN_NOTES_CONTEXT_FINAL_BROWSER_VERIFICATION_AND_DOCS
```

Ziel:

```text
- Browser-Verhalten final dokumentieren.
- ForrestCGN/EngelCGN Wechsel pruefen.
- Count, Notice, Liste, Titel abgleichen.
- Danach naechsten fachlichen Step festlegen.
```

## Weiterhin verboten

```text
Kein Delete/Deactivate.
Keine DB-Migration ohne expliziten Plan.
Keine neue Permission.
Keine Rollen-/Gruppen-/Permission-Writes.
Keine Agent-/OBS-/Sound-/Overlay-/Command-Steuerung.
Keine freie Shell-/Datei-/Prozess-/URL-Ausfuehrung.
```

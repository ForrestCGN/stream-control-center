# NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP115

Du arbeitest im Projekt `stream-control-center` / Remote-Modboard / RDAP.

## Start

Lies zuerst diese Dateien aus GitHub/dev:

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/RDAP_WORKFLOW_DEPLOY_STANDARD_UPDATE_2026-06-25.md
docs/current/CURRENT_REMOTE_MODBOARD_STATE.md
docs/current/REMOTE_MODBOARD_ROADMAP_CURRENT.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Aktueller Stand

```text
RDAP114: Admin-Navigation ist bereinigt.
RDAP115: Rollen & Rechte ist als eigenes Admin-Frontend-Modul strukturiert.
Benutzerverwaltung bleibt unter Admin.
User-Detail ist kein normaler Menuepunkt.
Details/System-Routen sind nicht in der normalen Navigation sichtbar.
```

## UI-Regel

```text
Admin-Funktionen gehoeren in Admin.
Der eigene User-Account gehoert oben rechts ins Profilmenue.
Unterseiten wie User-Detail sind keine normalen Navigationspunkte.
Keine Projekt-Erklaerungen.
Keine technische Dauerwand.
```

## Naechster sinnvoller Schritt

```text
RDAP116_ADMIN_NOTES_MODULE_SPLIT
```

Ziel:
```text
Admin-Notizen als eigenes Admin-Frontend-Modul strukturieren.
Weiterhin unter Admin.
Bestehende Dateien/Module bevorzugen.
Keine neuen Writes ohne separaten Scope.
Keine DB-Migration.
```

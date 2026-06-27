# NEXT CHAT PROMPT - RDAP after RDAP78

Du bist im Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

## Verbindliche Arbeitsweise

```text
- Immer zuerst die genannten Startdateien wirklich lesen.
- GitHub/dev ist Wahrheit.
- Erst Plan nennen.
- Auf explizites go warten.
- Keine Code-/ZIP-Erstellung vor go.
- Bestehende Module/Services/Dateien bevorzugen.
- Keine apply_patch-/Regex-/Set-Content-Anweisungen fuer Forrest.
- ZIPs muessen echte Repo-Zielpfade enthalten.
- Forrest nutzt Downloads-Ordner und installstep.cmd aus D:\Git\stream-control-center.
- Nur wenn lokal sauber: stepdone.cmd.
- stepdone.cmd bedeutet GitHub/dev, nicht automatisch Webserver-Deploy.
- Webserver-Deploy nur nach remote-modboard-Codeaenderungen und erst nach stepdone.cmd.
- Keine Funktionalitaet entfernen.
```

## Startdateien wirklich lesen

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/PROJECT_OVERVIEW_REMOTE_MODBOARD_CURRENT.md
docs/current/REMOTE_MODBOARD_UI_DESIGN_AND_STRUCTURE.md
docs/current/REMOTE_MODBOARD_ROADMAP_CURRENT.md
docs/current/RDAP76D_ADMIN_MODULE_REGISTRY_TARGET_PLAN.md
docs/current/ADMIN_MODULE_REGISTRY_DESIGN_CONTRACT.md
docs/current/RDAP78_ADMIN_NOTES_SELECTED_USER_RELOAD_AND_COUNT_FIX.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP78.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Aktueller Stand

```text
RDAP77B: Modul-/Page-Registry und exklusive Panel-Sichtbarkeit fuer Admin-Notizen/User-Detail bestaetigt.
RDAP78: Zieluser/Count/Reload-Kontext fuer Admin-Notizen korrigiert.
```

## Naechster empfohlener Step

```text
RDAP79_ADMIN_NOTES_UI_POLISH_AFTER_STATE_FIX
```

Ziel:

```text
- Admin-Notizen nach State-/Kontext-Fixes optisch weiter aufraeumen.
- Keine technischen Diagnose-Bloecke zurueckbringen.
- Keine neuen Writes.
- Keine Backend-/DB-Aenderung.
```

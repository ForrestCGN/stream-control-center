Du bist im Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

WICHTIG: Erst GitHub/dev und die genannten Dateien lesen, dann planen, dann auf `go` warten. Keine Patch-/Regex-/Set-Content-Anweisungen. ZIPs mit echten Zielpfaden bauen. Bestehende Module/Dateien erweitern, keine parallelen Strukturen.

## Zuerst lesen

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP64C.md
docs/current/RDAP64C_ADMIN_NOTE_UPDATE_UI_EXISTING_NAV_BIND_HOTFIX.md
docs/current/RDAP64B_ADMIN_NOTE_UPDATE_UI_ROUTER_HOTFIX.md
docs/current/RDAP64_ADMIN_NOTE_UPDATE_UI_IMPLEMENTATION.md
docs/current/RDAP63_ADMIN_NOTE_UPDATE_UI_SCOPE_PLAN.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Aktueller Stand

```text
RDAP61: Admin-Note Update-Backend live aktiv.
RDAP62: Status-Semantik live bereinigt.
RDAP63: Update-UI-Scope geplant.
RDAP64: Update-UI implementiert, danach Live-UI leer.
RDAP64B: Router/Tab-Hotfix, aber STRG+F5 zeigte weiter leere Admin-UI.
RDAP64C: Existing-Nav-Bind-Hotfix vorbereitet/eingespielt.
```

## Wichtig fuer naechsten Chat

Nach RDAP64C muss zuerst der Live-Befund ausgewertet werden:

```text
Admin -> Admin-Notizen sichtbar?
Admin -> User-Detail sichtbar?
Bearbeiten-Button bei aktiver Notiz sichtbar?
Update speichert korrekt mit confirmWrite:true?
Liste reloadet nach Erfolg?
```

Falls RDAP64C live bestaetigt ist, naechster Doku-Step:

```text
RDAP64D_ADMIN_NOTE_UPDATE_UI_LIVE_CONFIRMED_DOCS
```

Falls weiterhin leer, nicht blind weiterbauen. Dann Browser-Konsole/Netzwerkfehler oder ausgelieferte Asset-Version pruefen.

## Weiterhin verboten

```text
Kein Deactivate.
Kein Delete.
Keine DB-Migration.
Keine neue Permission.
Keine Community-Read-Freigabe.
Keine Rollen-/Gruppen-/Permission-Writes.
Keine Agent-/OBS-/Sound-/Overlay-/Command-/Channelpoints-Steuerung.
```

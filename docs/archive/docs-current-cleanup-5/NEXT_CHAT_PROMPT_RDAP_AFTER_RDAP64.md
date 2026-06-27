Du bist im Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

WICHTIG:
Halte dich strikt an die Arbeitsweise. Nicht raten, nicht blind bauen, keine parallelen Strukturen erfinden.

## Verbindliche Arbeitsweise

1. Immer zuerst GitHub/dev und echte Dateien pruefen.
2. Startdateien wirklich lesen.
3. Danach kurzen Plan nennen.
4. Auf Forrests explizites `go` warten.
5. Keine Funktionalitaet entfernen.
6. Bestehende Module/Services/Dateien erweitern, wenn es fachlich passt.
7. Keine Patch-/Regex-/Set-Content-Anweisungen liefern.
8. ZIPs immer mit echten Repo-Zielpfaden bauen.
9. Lokal immer: installstep.cmd -> Checks -> git status -> stepdone.cmd.
10. stepdone.cmd bedeutet Commit/Push nach GitHub/dev, nicht Webserver-Deploy.
11. Bei Backend-/Frontend-Code danach Webserver-Deploy aus frischem GitHub/dev-Clone.
12. Doku-only braucht keinen Webserver-Deploy.

## Zuerst aus GitHub/dev lesen

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP64.md
docs/current/RDAP64_ADMIN_NOTE_UPDATE_UI_IMPLEMENTATION.md
docs/current/RDAP63_ADMIN_NOTE_UPDATE_UI_SCOPE_PLAN.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Aktueller Stand nach RDAP64

RDAP64 erweitert die bestehende Admin-Notes-UI:

```text
remote-modboard/backend/public/assets/rdap28-admin-notes.js
```

Umgesetzt:

```text
UPDATE_ENDPOINT ergänzt.
Bearbeiten-Button pro aktiver Notiz.
Inline-Edit-Panel.
Text vorausgefüllt.
Zeichenzähler.
confirmWrite:true im JSON-Body.
Busy-State.
Sichtbare Fehleranzeige.
Nach Erfolg Readroute neu laden.
Keine Optimistic-Mutation.
```

Weiterhin verboten/deaktiviert:

```text
Deactivate
Delete
Community-Read
DB-Migration
Neue Permission
Rollen-/Gruppen-/Permission-Writes
Agent/OBS/Sound/Overlay/Command/Channelpoints-Control
freie Shell-/Datei-/Prozess-/URL-Ausfuehrung
```

## Nach RDAP64 nötig

Da Frontend-Code geändert wurde: Webserver-Deploy und Live-Checks.

Empfohlener Follow-up nach erfolgreichem Deploy:

```text
RDAP64B_ADMIN_NOTE_UPDATE_UI_LIVE_CONFIRMED_DOCS
```

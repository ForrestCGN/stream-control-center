# NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP117C

Du bist im Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

## Verbindliche Arbeitsweise

- Immer zuerst die genannten Startdateien wirklich aus GitHub/dev lesen.
- GitHub/dev ist Wahrheit.
- Nicht blind aus Erinnerung arbeiten.
- Erst Plan nennen.
- Auf explizites `go` warten.
- Keine Code-/ZIP-Erstellung vor `go`.
- Bestehende Module/Services/Dateien bevorzugen.
- Keine parallelen Strukturen erfinden.
- Neue Dateien nur, wenn fachlich wirklich getrennt.
- Keine `apply_patch`-/Regex-/`Set-Content`-Anweisungen fuer Forrest.
- ZIPs muessen echte Repo-Zielpfade enthalten.
- Forrest legt ZIPs in den Downloads-Ordner.
- Lokal: `installstep.cmd` aus `D:\Git\stream-control-center`.
- Danach lokale Checks und `git status`.
- Nur wenn sauber: `stepdone.cmd`.
- `stepdone.cmd` bedeutet Commit/Push nach GitHub/dev, nicht Webserver-Deploy.
- Webserver-Deploy nur nach Codeaenderungen in `remote-modboard/` und erst nach `stepdone`.

## Startdateien lesen

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
RDAP117C: Admin-Modul-/Navigation-Vertrag korrigiert.
Admin-Fachmodule registrieren ihre Page und bauen/polieren ihren Inhalt.
Admin-Fachmodule erzeugen keine eigenen Admin-Navi-Buttons mehr.
Admin-Navigation wird zentral in users.js sortiert/dedupliziert.
```

## Wichtige Regel ab RDAP117C

```text
Admin-Fachmodule duerfen NICHT ensureXInAdminMenu() bauen.
Jedes Fachmodul:
- registerPage(...)
- create/polish eigene Page
- ggf. eigene Daten laden

Navigation:
- ein zentraler Admin-Nav-Owner sortiert/dedupliziert.
```

## Naechster sinnvoller Schritt

```text
RDAP118_ADMIN_NAV_POLISH_AND_VISIBLE_REVIEW
```

Ziel:
```text
Ein kurzer visueller Admin-/System-Navi-Review.
Nur letzte Dopplungen/falsche Labels aufraeumen.
Danach wieder funktionaler Fortschritt.
Keine Backend-Aenderung.
Keine DB-Migration.
Keine Agent-Actions.
```

# NEXT CHAT PROMPT - RDAP after RDAP74

Du bist im Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

## Verbindliche Arbeitsweise

```text
- Immer zuerst die genannten Startdateien wirklich lesen.
- GitHub/dev ist Wahrheit.
- Nicht blind aus Erinnerung arbeiten.
- Erst Plan nennen.
- Auf explizites go warten.
- Keine Code-/ZIP-Erstellung vor go.
- Bestehende Module/Services/Dateien bevorzugen.
- Keine neuen parallelen Strukturen, wenn Erweiterung bestehender Dateien passt.
- Keine apply_patch-/Regex-/Set-Content-Anweisungen fuer Forrest.
- ZIPs muessen echte Repo-Zielpfade enthalten.
- Forrest legt ZIP in Downloads ab.
- Lokal: installstep.cmd aus D:\Git\stream-control-center.
- Danach lokale Checks und git status.
- Nur wenn sauber: stepdone.cmd.
- stepdone.cmd bedeutet Commit/Push nach GitHub/dev, nicht Webserver-Deploy.
- Webserver-Deploy nur nach Codeaenderungen in remote-modboard/ und erst nach stepdone.cmd.
- Doku-only braucht keinen Webserver-Deploy.
```

## Startdateien lesen

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/RDAP73_ADMIN_NOTES_HUMAN_READABLE_LIST.md
docs/current/RDAP74_ADMIN_NOTES_HEADER_ACTIONS_DEDUP.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Aktueller Stand

```text
RDAP73 hat die Admin-Notes-Liste menschlicher lesbar gemacht.
RDAP74 hat den Header/Toolbar-Doppelstand bereinigt:
- Buttons "Notizen neu laden" und "Neue Notiz" wandern in den oberen Admin-Notizen-Header.
- Die separate Toolbar mit erneutem "Admin-Notizen" wird ausgeblendet.
- Liste bleibt als fachlicher Bereich erhalten.
```

## Naechster Step

```text
RDAP75_ADMIN_NOTES_HEADER_ACTIONS_LIVE_VERIFICATION_DOC
```

## Ziel RDAP75

```text
RDAP74 nach Webserver-Deploy fachlich im Browser bestaetigen und dokumentieren.
```

## Zu pruefen

```text
- Admin -> Admin-Notizen sichtbar.
- Navigation stabil.
- Oben nur ein zentraler Titel "Admin-Notizen".
- Buttons stehen im oberen Header rechts.
- Separate Toolbar "Admin-Notizen" nicht mehr sichtbar.
- Liste "Admin-Notizen fuer ForrestCGN" bleibt sichtbar.
- Hinweistext bleibt kurz.
- Neue Notiz funktioniert.
- Bearbeiten/Speichern funktioniert.
- Delete/Deactivate nicht sichtbar.
```

## Weiterhin verboten

```text
Kein Admin-Note Deactivate.
Kein physisches Delete.
Keine Community-Read-Freigabe.
Keine DB-Migration.
Keine neue Permission.
Keine Rollen-/Gruppen-/Permission-Writes.
Keine Session-Revocation UI.
Keine Agent-/OBS-/Sound-/Overlay-/Command-/Channelpoints-Steuerung.
Keine freie Shell-/Datei-/Prozess-/URL-Ausfuehrung.
Keine parallele Zweitnavigation.
```

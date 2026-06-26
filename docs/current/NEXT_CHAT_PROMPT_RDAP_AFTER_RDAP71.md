# NEXT CHAT PROMPT - RDAP after RDAP71

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
docs/current/RDAP70_ADMIN_NOTES_COMPACT_LAYOUT_LIVE_VERIFICATION_DOC.md
docs/current/RDAP71_ADMIN_NOTES_CLEAN_LAYOUT.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Aktueller Stand

```text
RDAP69 ist live deployed und technisch ok.
RDAP70 hat dokumentiert: Layout weiterhin zu debug-lastig.
RDAP71 hat Frontend-only Clean-Layout vorbereitet.
```

## RDAP71 technische Aenderung

```text
Geaendert:
remote-modboard/backend/public/assets/remote-modboard.js

Art:
- idempotente Style-Injection rdap71AdminNotesCleanLayoutStyle
- alte RDAP69/RDAP67 Admin-Notes Style-Injections werden entfernt, falls vorhanden
- kein Backend
- keine DB-Migration
- keine neue Permission
- kein Delete/Deactivate
```

## Nach RDAP71 pruefen

```text
- RDAP71 lokal installieren.
- node --check fuer remote-modboard.js und rdap28-admin-notes.js ausfuehren.
- stepdone.cmd nur wenn sauber.
- Danach Webserver-Deploy, weil Frontend-Code unter remote-modboard/ geaendert wurde.
- Browser pruefen:
  - Admin-Notizen sichtbar.
  - Ansicht weniger debug-lastig.
  - Toolbar mit Neu laden / Neue Notiz sichtbar.
  - Create-Bereich nicht dauerhaft als grosser rechter Kasten sichtbar.
  - Neue Notiz oeffnet weiterhin das Formular.
  - Create funktioniert weiterhin.
  - Update-Speichern funktioniert weiterhin.
  - Erfolg/Fehler sichtbar.
  - Navigation stabil.
  - Delete/Deactivate nicht sichtbar.
```

## Moeglicher naechster Step

```text
RDAP72_ADMIN_NOTES_CLEAN_LAYOUT_LIVE_VERIFICATION_DOC
```

Ziel:

```text
RDAP71 nach Webserver-Deploy fachlich im Browser bestaetigen und dokumentieren.
Nur wenn Clean-Layout fachlich ok ist, danach naechsten sicheren Scope planen.
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

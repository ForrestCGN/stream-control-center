# NEXT CHAT PROMPT - RDAP after RDAP70

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
docs/current/RDAP69_ADMIN_NOTES_COMPACT_LAYOUT.md
docs/current/RDAP70_ADMIN_NOTES_COMPACT_LAYOUT_LIVE_VERIFICATION_DOC.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Aktueller Stand

```text
RDAP69 ist live deployed.
Serverchecks sind ok.
Admin-Notes sind sichtbar.
Navigation ist stabil.
Delete/Deactivate sind nicht sichtbar.
```

## Layout-Befund nach RDAP69/RDAP70

```text
RDAP69 Compact-Layout ist technisch ok, aber noch nicht die Zielansicht.
Die Ansicht wirkt weiterhin zu technisch/debug-lastig.
"Neue Notiz" erscheint oben als Button und rechts als Create-Bereich.
Der Create-Bereich nimmt weiterhin zu viel Platz ein.
Technische Karten wie Aktion/Grenzen/Read/Write sind zu dominant fuer den Normalbetrieb.
Die Notizen-Liste sollte zentraler und frueher sichtbar sein.
```

## Naechster Step

```text
RDAP71_ADMIN_NOTES_CLEAN_LAYOUT
```

## Ziel RDAP71

```text
Frontend-only Clean-Layout fuer Admin-Notes.

Zielbild:
- Schmale Toolbar oben:
  Admin-Notizen fuer ForrestCGN | 4 geladen | Neu laden | Neue Notiz
- Technische Diagnose-/Safety-Informationen nicht mehr dominant.
- Create nur bei Bedarf anzeigen, nicht dauerhaft als grosser rechter Kasten.
- Liste direkt unter Toolbar prominent anzeigen.
- Notizkarten weiterhin lesbar und kompakt.
```

## Erlaubter Scope

```text
remote-modboard/backend/public/assets/remote-modboard.js
optional remote-modboard/backend/public/assets/rdap28-admin-notes.js nur wenn zwingend fuer Markup/Struktur noetig
optional docs/current/* und project-state/*
```

## Leitplanken RDAP71

```text
- Bestehende Create-/Update-Funktion erhalten.
- confirmWrite:true unveraendert lassen.
- Bearbeiten nur fuer aktive Notizen mit Write-Recht sichtbar lassen.
- Erfolg/Fehler sichtbar lassen.
- Kein Optimistic-Update einfuehren.
- Keine neuen Schreibbuttons.
- Deactivate/Delete nicht einfuehren.
- Kein Backend.
- Keine DB-Migration.
- Keine neue Permission.
- Keine Community-Read-Freigabe.
- Kein Haupt-Router-Umbau ohne zwingenden Befund.
- Keine parallele Zweitnavigation.
```

## Erwartete erste Antwort im neuen Chat

```text
Ich lese zuerst die Startdateien aus GitHub/dev und nenne danach nur den Plan fuer RDAP71. Kein Code/ZIP vor deinem go.
```

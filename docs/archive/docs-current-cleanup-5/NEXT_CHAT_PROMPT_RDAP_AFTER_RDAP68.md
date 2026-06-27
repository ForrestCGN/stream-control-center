# NEXT CHAT PROMPT - RDAP after RDAP68

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
docs/current/RDAP67_ADMIN_NOTES_UI_POLISH.md
docs/current/RDAP68_ADMIN_NOTES_UI_POLISH_LIVE_VERIFICATION_DOC.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Aktueller Stand

```text
RDAP67 ist live deployed.
Serverchecks sind ok.
Browserpruefung ist fachlich erfolgreich.
Admin-Notes sichtbar.
Navigation stabil.
Bearbeiten und Speichern funktionieren.
Delete/Deactivate sind nicht sichtbar.
```

## Layout-Befund nach RDAP67

```text
RDAP67 hat die UI besser getrennt, aber noch nicht optimal uebersichtlich.
Obere Statuskarten nehmen viel Platz ein.
Create-Karte ist zu gross.
Liste startet zu weit unten.
Notizkarten koennen kompakter und klarer werden.
```

## Naechster Step

```text
RDAP69_ADMIN_NOTES_COMPACT_LAYOUT
```

## Ziel RDAP69

```text
Frontend-only Compact-Layout fuer Admin-Notes.
Keine Backend-Funktion.
Keine neue Permission.
Keine neuen Schreibrechte.
```

## Erlaubter Scope

```text
remote-modboard/backend/public/assets/remote-modboard.js
optional remote-modboard/backend/public/assets/rdap28-admin-notes.js nur wenn zwingend fuer Markup/Struktur noetig
optional docs/current/* und project-state/*
```

## Leitplanken RDAP69

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
- Kein Haupt-Router-Umbau ohne zwingenden Befund.
```

## Erwartete erste Antwort im neuen Chat

```text
Ich lese zuerst die Startdateien aus GitHub/dev und nenne danach nur den Plan fuer RDAP69. Kein Code/ZIP vor deinem go.
```

# NEXT CHAT PROMPT - RDAP after RDAP65A

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
docs/current/RDAP64D_ADMIN_NOTE_UPDATE_UI_MAIN_ROUTER_INTEGRATION_LIVE_CONFIRMED.md
docs/current/RDAP64E_DOKU_STATUS_AFTER_ROUTER_FIX.md
docs/current/RDAP65A_ADMIN_NOTES_BROWSER_VERIFICATION_DOC.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Aktueller Stand

```text
RDAP64D ist live deployed.
Server-Checks sind ok.
Browser-Konsole ist sauber.
RDAP64D war Frontend-/Router-Step.
Backend wurde nicht geaendert.
RDAP64E hat Doku/project-state aktualisiert.
RDAP65A dokumentiert den bestaetigten Live-Stand und die noch offenen fachlichen Browser-Pruefpunkte.
```

## Wichtige technische Erkenntnis

```text
remote-modboard.js ist der Haupt-Router.
rdap28-admin-notes.js wird live durch app.js injiziert.
Die Ursache vor RDAP64D war Router-/Sichtbarkeitskollision, nicht nur fehlende Script-Ladung.
RDAP64D korrigierte die Haupt-Router-Integration in remote-modboard.js.
```

## Naechster Step

```text
RDAP65B_ADMIN_NOTES_FULL_BROWSER_VERIFICATION_OR_NEXT_SCOPE_DECISION
```

## Ziel RDAP65B

```text
Die noch offenen fachlichen Browser-Pruefpunkte einzeln bestaetigen oder bei Auffaelligkeit nur den Befund dokumentieren.
Danach erst den naechsten kleinen Scope planen.
```

## Vor weiterem Code pruefen

```text
- Admin -> Admin-Notizen zeigt Inhalt.
- Admin -> User-Detail zeigt Inhalt.
- Wechsel zu Benutzerverwaltung/Rollen/Sicherheit/Overview funktioniert weiter.
- Update-UI erscheint nur fuer aktive Notizen mit Write-Recht.
- Speichern nutzt confirmWrite:true.
- Erfolg laedt Notizen neu.
- Fehler werden sichtbar angezeigt.
- Deactivate/Delete erscheinen nicht.
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

## Erwartete erste Antwort im neuen Chat

```text
Ich lese zuerst die Startdateien aus GitHub/dev und nenne danach nur den Plan fuer RDAP65B. Kein Code/ZIP vor deinem go.
```

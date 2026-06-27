# NEXT CHAT PROMPT - RDAP after RDAP65B

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
docs/current/RDAP65B_ADMIN_NOTES_FULL_BROWSER_VERIFICATION_OR_NEXT_SCOPE_DECISION.md
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
RDAP65A dokumentierte offene fachliche Browser-Pruefpunkte.
RDAP65B dokumentiert die erfolgreiche fachliche Browser-Verifikation.
```

## Bestaetigter Fachbefund RDAP65B

```text
Admin -> Admin-Notizen zeigt Inhalt.
Liste laedt 4 Admin-Notiz(en).
Create funktioniert sichtbar.
Create erzeugte Notiz admin_note_20260626095139_76c977525140.
Liste wird nach Create aktualisiert.
Bearbeiten-Button ist sichtbar.
Update-Speichern funktioniert.
Text wurde auf tedt1 aktualisiert.
Erfolgsmeldung ist sichtbar: Notiz gespeichert. Liste wird aktualisiert ...
Admin -> User-Detail zeigt Inhalt.
Sicherheit/Diagnose zeigt HTTP-200-Karten.
Navigation bleibt stabil.
Deactivate/Delete sind nicht sichtbar.
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
RDAP66_ADMIN_NOTES_NEXT_SCOPE_PLAN
```

## Ziel RDAP66

```text
Auf Basis der bestaetigten Admin-Notes-Erfolgswege den naechsten kleinen, sicheren Scope planen.
Kein Code ohne vorherigen Scope-Plan.
```

## Moegliche Scope-Kandidaten

```text
- Admin-Notes UI-Polish fuer bessere Lesbarkeit/Bedienung.
- Status-Semantik angleichen, damit moduleBuild/statusApiVersion weniger verwirren.
- Admin-Notes Zieluser-Auswahl verbessern, ohne neue Schreibrechte.
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
Ich lese zuerst die Startdateien aus GitHub/dev und nenne danach nur den Plan fuer RDAP66. Kein Code/ZIP vor deinem go.
```

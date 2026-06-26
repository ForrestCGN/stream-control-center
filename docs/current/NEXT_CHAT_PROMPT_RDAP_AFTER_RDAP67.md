# NEXT CHAT PROMPT - RDAP after RDAP67

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
docs/current/RDAP65B_ADMIN_NOTES_FULL_BROWSER_VERIFICATION_OR_NEXT_SCOPE_DECISION.md
docs/current/RDAP66_ADMIN_NOTES_NEXT_SCOPE_PLAN.md
docs/current/RDAP67_ADMIN_NOTES_UI_POLISH.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Aktueller Stand

```text
RDAP65B hat Admin-Notes fachlich im Browser bestaetigt:
- Inhalt sichtbar.
- Create funktioniert.
- Update-Speichern funktioniert.
- User-Detail funktioniert.
- Navigation stabil.
- Delete/Deactivate nicht sichtbar.

RDAP66 war Plan-only und hat RDAP67 Admin-Notes UI-Polish als naechsten Code-Scope gewaehlt.
RDAP67 hat Frontend-only UI-Polish fuer Admin-Notes vorbereitet.
```

## RDAP67 technische Aenderung

```text
Geaendert:
remote-modboard/backend/public/assets/remote-modboard.js

Art:
- idempotente Style-Injection rdap67AdminNotesPolishStyle
- keine Backend-/DB-/Permission-Aenderung
- keine neue Navigation
- keine neue Schreibfunktion
```

## Nach RDAP67 pruefen

```text
- Admin -> Admin-Notizen weiterhin sichtbar.
- Notizkarten sind lesbarer.
- Create funktioniert weiterhin.
- Update-Speichern funktioniert weiterhin.
- Erfolg/Fehler sichtbar.
- User-Detail weiterhin sichtbar.
- Navigation stabil.
- Delete/Deactivate nicht sichtbar.
```

## Moeglicher naechster Step

```text
RDAP68_ADMIN_NOTES_UI_POLISH_LIVE_VERIFICATION_DOC
```

Ziel:

```text
RDAP67 Live-Browser-Befund dokumentieren.
Nur wenn UI-Polish fachlich ok ist, danach naechsten Mini-Scope planen.
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

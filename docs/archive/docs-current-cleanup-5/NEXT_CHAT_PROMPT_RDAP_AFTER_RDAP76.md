# NEXT CHAT PROMPT - RDAP after RDAP76

Du bist im Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

WICHTIG:
Halte dich strikt an die Arbeitsweise. Nicht raten, nicht blind bauen, keine parallelen Strukturen erfinden.

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
- Forrest legt ZIPs in den Downloads-Ordner.
- Lokal: installstep.cmd aus D:\Git\stream-control-center.
- Danach lokale Checks und git status.
- Nur wenn sauber: stepdone.cmd.
- stepdone.cmd bedeutet Commit/Push nach GitHub/dev, nicht Webserver-Deploy.
- Webserver-Deploy nur nach Codeaenderungen in remote-modboard/ und erst nach stepdone.cmd.
- Doku-only braucht keinen Webserver-Deploy.
- Keine Funktionalitaet entfernen.
- Bestehende Module/Services/Dateien erweitern, wenn es fachlich passt.
- Neue Module nur, wenn bestehende Struktur wirklich nicht passt.
```

## Startdateien wirklich lesen

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/PROJECT_OVERVIEW_REMOTE_MODBOARD_CURRENT.md
docs/current/REMOTE_MODBOARD_UI_DESIGN_AND_STRUCTURE.md
docs/current/REMOTE_MODBOARD_ROADMAP_CURRENT.md
docs/current/RDAP76_ADMIN_NOTES_ROUTER_HEADER_STATE_FIX.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP76.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Aktueller Stand

```text
RDAP76B: Doku-Konsolidierung abgeschlossen.
RDAP76: Admin-Notes Router-/Header-State-Fix vorbereitet/abgeschlossen.

Admin-Notes sichtbar:
- Create funktioniert.
- Update/Speichern funktioniert.
- Delete/Deactivate bleiben aus.
- Technische Statusbloecke sind nicht in der Normalansicht.
- Header-Aktionen stehen oben im Admin-Notes-Header.
```

## RDAP76 Ergebnis

```text
`rdap28-admin-notes.js` nutzt fuer Admin-Notizen/User-Detail bevorzugt den bestehenden Haupt-Router `window.RdapMainRouter.setPage`.

Dadurch muessen sichtbares Panel, Haupt-Header und aktive Navigation zusammenpassen:
- Admin-Notizen sichtbar -> Header Admin-Notizen.
- User-Detail sichtbar -> Header User-Detail.
```

## Naechster Code-Step

```text
RDAP77_ADMIN_NOTES_SELECTED_USER_RELOAD_AND_COUNT_FIX
```

Ziel:

```text
- Zieluser-Wechsel laedt/zeigt eindeutig Notizen fuer diesen User.
- Count/Hinweis bezieht sich eindeutig auf den ausgewaehlten User.
- Keine alten User-Daten in Titel, Count oder Liste stehen lassen.
```

Erlaubter Scope:

```text
remote-modboard/backend/public/assets/rdap28-admin-notes.js
optional remote-modboard/backend/public/assets/remote-modboard.js nur wenn zwingend fuer Page-State noetig
optional docs/current/* und project-state/*
```

Strikt verboten:

```text
Keine Backend-Route, solange vorhandene Readroute reicht.
Keine DB-Migration.
Keine neue Permission.
Kein Deactivate.
Kein Delete.
Keine Community-Read-Freigabe.
Keine Rollen-/Gruppen-/Permission-Writes.
Keine Agent-/OBS-/Sound-/Overlay-/Command-Steuerung.
Keine freie Shell-/Datei-/Prozess-/URL-Ausfuehrung.
Keine parallele Zweitnavigation.
Keine neuen Schreibbuttons.
Keine Write-Freigabe nebenbei.
```

## Erwartete erste Antwort im neuen Chat

```text
Ich lese zuerst die Startdateien aus GitHub/dev und nenne danach nur den Plan fuer RDAP77. Kein Code/ZIP vor deinem go.
```

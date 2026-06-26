# NEXT CHAT PROMPT - RDAP after RDAP69

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
docs/current/RDAP68_ADMIN_NOTES_UI_POLISH_LIVE_VERIFICATION_DOC.md
docs/current/RDAP69_ADMIN_NOTES_COMPACT_LAYOUT.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Aktueller Stand

```text
RDAP67 ist live deployed und fachlich bestaetigt.
RDAP68 dokumentierte den Live-Befund.
RDAP69 hat ein Frontend-only Compact-Layout fuer Admin-Notes vorbereitet.
```

## RDAP69 technische Aenderung

```text
Geaendert:
remote-modboard/backend/public/assets/remote-modboard.js

Art:
- idempotente Style-Injection rdap69AdminNotesCompactLayoutStyle
- RDAP67-Style wird beim Laden entfernt, falls vorhanden
- keine Backend-/DB-/Permission-Aenderung
- keine neue Navigation
- keine neue Schreibfunktion
```

## Nach RDAP69 pruefen

```text
- Admin -> Admin-Notizen weiterhin sichtbar.
- obere Statuskarten sind kompakter.
- Create-Bereich ist weniger dominant.
- Liste startet hoeher.
- Notizkarten sind kompakter und weiterhin lesbar.
- Create funktioniert weiterhin.
- Update-Speichern funktioniert weiterhin.
- Erfolg/Fehler sichtbar.
- User-Detail funktioniert weiterhin.
- Navigation bleibt stabil.
- Delete/Deactivate sind nicht sichtbar.
```

## Moeglicher naechster Step

```text
RDAP70_ADMIN_NOTES_COMPACT_LAYOUT_LIVE_VERIFICATION_DOC
```

Ziel:

```text
RDAP69 Live-Browser-Befund dokumentieren.
Nur wenn Compact-Layout fachlich ok ist, danach naechsten Mini-Scope planen.
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

# NEXT CHAT PROMPT - RDAP after RDAP72

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
docs/current/RDAP71_ADMIN_NOTES_CLEAN_LAYOUT.md
docs/current/RDAP72_ADMIN_NOTES_HIDE_TECHNICAL_STATUS.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Aktueller Stand

```text
RDAP71 ist live deployed.
Admin-Notes sind sichtbar.
Navigation ist stabil.
Die Ansicht war weiterhin zu technisch.
```

## RDAP72

```text
RDAP72 blendet technische Read/Write/Grenzen-Bloecke in der normalen Admin-Notes-Arbeitsansicht aus.
Die Sicherheits-/Diagnoseinformationen bleiben im Code/DOM erhalten, sind aber nicht mehr dominant sichtbar.
Frontend-only.
Keine Backend-/DB-/Permission-Aenderung.
Kein Delete/Deactivate.
```

## Naechster Step

```text
RDAP73_ADMIN_NOTES_HIDE_TECHNICAL_STATUS_LIVE_VERIFICATION_DOC
```

## Ziel RDAP73

```text
RDAP72 nach Webserver-Deploy live fachlich pruefen und dokumentieren.
```

## Pruefpunkte

```text
- Admin-Notizen sichtbar.
- Navigation stabil.
- Technische Read/Write/Grenzen-Bloecke nicht mehr prominent.
- Neu laden sichtbar.
- Neue Notiz sichtbar.
- Create-Formular nur bei Bedarf.
- Liste prominent.
- Bearbeiten/Speichern funktionieren.
- Delete/Deactivate nicht sichtbar.
```

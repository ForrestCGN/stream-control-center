# NEXT CHAT PROMPT - RDAP after docs consolidation

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
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_DOCS_CONSOLIDATION.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Aktueller Stand

```text
RDAP76B ist ein Doku-only-Konsolidierungsstep.
Er fasst den aktuellen Remote-Modboard-/RDAP-Stand zentral zusammen.
Kein Code.
Kein Backend.
Keine DB-Migration.
Keine neue Route.
Keine neue Permission.
Kein Delete/Deactivate.
Kein Webserver-Deploy noetig.
```

## Aktuelle zentrale Dokus

```text
docs/current/PROJECT_OVERVIEW_REMOTE_MODBOARD_CURRENT.md
- zentrale Projektuebersicht, Architektur, Stand, Grenzen, naechste Steps

docs/current/REMOTE_MODBOARD_UI_DESIGN_AND_STRUCTURE.md
- UI-Aufbau, Designvertrag, Admin-Notes/User-Detail-Struktur, Router-Regeln

docs/current/REMOTE_MODBOARD_ROADMAP_CURRENT.md
- erledigte Phasen, naechste Steps, mittelfristige Planung, harte Grenzen
```

## Aktueller technischer Fokus

```text
Admin-Notes sind sichtbar.
Create funktioniert.
Update/Speichern funktioniert.
Delete/Deactivate bleiben aus.
Technische Statusbloecke wurden aus der Normalansicht entfernt.
Header-Aktionen stehen oben im Admin-Notes-Header.
```

## Aktuelle Browser-Befunde

```text
1. User-Detail/Header-State falsch:
   In der Kopfzeile kann noch User-Detail stehen, obwohl Admin-Notizen sichtbar sind.
   Das ist ein Router-/Header-State-Befund und muss sauber geloest werden.

2. Zieluser-/Notizen-Kontext pruefen:
   Die Notizen-Anzahl muss sich eindeutig auf den aktuell ausgewaehlten User beziehen.
   Wenn EngelCGN ausgewaehlt ist, darf nicht unklar oder falsch Forrests Count/Liste stehen bleiben.

3. Design-Kontrakt:
   Nicht weiter wilde CSS-Patches.
   Erst State/Router sauber, dann User-Kontext/Count sauber, danach UI weiter polieren.
```

## Naechster Code-Step

```text
RDAP76_ADMIN_NOTES_ROUTER_HEADER_STATE_FIX
```

Ziel:

```text
- Wenn Admin-Notizen sichtbar sind, muss der Haupt-Header Admin-Notizen zeigen.
- User-Detail darf nicht aktiv wirken, wenn Admin-Notizen sichtbar sind.
- Navigation/Router-State sauber synchronisieren.
- Keine CSS-Tarnung als Ersatz fuer falschen State.
- Bestehenden Haupt-Router bevorzugen, keinen parallelen Router bauen.
```

Erlaubter Scope:

```text
remote-modboard/backend/public/assets/remote-modboard.js
optional remote-modboard/backend/public/assets/rdap28-admin-notes.js nur wenn zwingend fuer Page-State/Events noetig
optional docs/current/* und project-state/*
```

Strikt verboten:

```text
Keine Backend-Route.
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

## Danach geplant

```text
RDAP77_ADMIN_NOTES_SELECTED_USER_RELOAD_AND_COUNT_FIX
```

Ziel:

```text
- Zieluser-Wechsel laedt/zeigt eindeutig Notizen fuer diesen User.
- Count/Hinweis bezieht sich eindeutig auf den ausgewaehlten User.
- Keine alten User-Daten in Titel, Count oder Liste stehen lassen.
```

## Erwartete erste Antwort im neuen Chat

```text
Ich lese zuerst die Startdateien aus GitHub/dev und nenne danach nur den Plan fuer RDAP76. Kein Code/ZIP vor deinem go.
```

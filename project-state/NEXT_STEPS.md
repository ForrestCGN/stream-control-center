# NEXT STEPS

Stand: DASHUI3.DOC1 / Parallelbetrieb und Modul-Migrationsplan dokumentiert  
Datum: 2026-06-23

## Nächster sinnvoller Schritt

```text
DASHUI4 / Minimaler React-Vite-Prototyp
```

Ziel:

- `frontend/dashboard-v2/` als neue Frontend-Quellcode-Basis anlegen
- React + Vite Grundgerüst erstellen
- AppShell mit Sidebar/Topbar/PageHeader/ModuleTabs bauen
- CGN-Dark-/Neon-/Galaxy-Basisdesign anlegen
- zentrale Theme-/Token-Dateien anlegen
- Modul-/Navigation-Registry vorbereiten
- Beispielseite `Übersicht` bauen
- Beispielseite `Remote Agent` bauen
- keine produktive Modulmigration
- keine Schreibfunktionen
- kein Login-Zwang
- kein altes Dashboard ändern
- kein Backend ändern
- kein Agent-Code

Wichtig:

- DASHUI4 ist der erste Code-Step für Dashboard-v2.
- Umsetzung nur nach explizitem `go`.
- ZIP muss echte Zielpfade ab Repo-Root enthalten.
- Node-/Backend-Neustart ist nur nötig, wenn Backend-Dateien geändert werden. Für reinen Frontend-Quellcode noch nicht.
- Bestehendes Dashboard unter `htdocs/dashboard/` bleibt unangetastet.

## Danach sinnvoll

```text
DASHUI5 / Build- und Deploy-Weg für dashboard-v2 planen oder bauen
```

Mögliche Ziele:

- Build-Output nach `htdocs/dashboard-v2/`
- lokaler Aufruf unter `http://127.0.0.1:8080/dashboard-v2`
- keine produktiven Aktionen
- kein Remote-Webserver-Deploy ohne separaten Step

## Danach sinnvoll

```text
DASHUI6 / erste read-only Statusseite
```

Mögliche Kandidaten:

- Remote Agent Status
- Systemstatus
- Twitch-Events Status
- Sound-System Status

Regel:

- zuerst read-only
- keine Speichern-/Start-/Stop-/Löschen-Aktion
- keine produktive Modulmigration

## Modulmigration später

Module werden einzeln migriert.

Empfohlene Reihenfolge:

1. System / Diagnose
2. Remote Agent / Agent Status
3. Twitch-Events Status
4. Sound-System Status
5. Shot-Alarm
6. HypeTrain / Twitch-Events Zusatzseiten
7. Event-System
8. Loyalty Core
9. Loyalty Giveaways / Glücksrad
10. Media
11. Overlays
12. OBS
13. Commands / Kanalpunkte
14. Admin / Benutzer / Rollen / Permissions / Audit

## Nicht als nächstes nebenbei machen

- kein produktives altes Dashboard ersetzen
- keine Big-Bang-Migration
- keine Schreibfunktionen ohne Permission/Lock/Audit
- kein Login-System improvisieren
- kein Remote-Modboard-Deploy ohne Webserver-/Auth-Step
- keine OBS-/Sound-/Media-/Command-Aktionen im ersten Prototyp
- keine produktive DB-Migration
- keine Creative-Tim-/Vision-UI-Codebasis übernehmen

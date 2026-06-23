# NEXT STEPS

Stand: DASHUI4 / Minimaler React-Vite-Prototyp gebaut  
Datum: 2026-06-23

## Nächster sinnvoller Schritt

```text
DASHUI5 / Build- und lokaler Auslieferungsweg prüfen
```

Ziel:

- `frontend/dashboard-v2/` installieren
- `npm install` ausführen
- `npm run build` ausführen
- prüfen, ob `htdocs/dashboard-v2/` korrekt entsteht
- prüfen, ob der lokale Server die Seite später unter `/dashboard-v2/` ausliefern kann
- keine produktiven Aktionen
- kein altes Dashboard ändern
- kein Backend ändern

## Danach sinnvoll

```text
DASHUI6 / erste read-only Statusseite mit echter API-Anbindung
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

## Danach sinnvoll

```text
DASHUI7 / Auth-/Permission-Platzhalter sauber an Webserver-Plan angleichen
```

Nicht zu früh:

- kein hartes Login im lokalen Prototyp, bevor Webserver-Auth geplant ist
- keine echten Sicherheitsentscheidungen im Frontend
- keine Secrets ins Frontend

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

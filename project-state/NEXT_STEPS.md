# NEXT_STEPS

Stand: RDAP46_ADMIN_NOTE_NEXT_SMALL_STEP_PLAN  
Datum: 2026-06-26

## Naechster empfohlener Step

```text
RDAP47_ADMIN_NOTE_TARGET_USER_SEARCH_COMFORT_PREPARED
```

## Ziel RDAP47

```text
Admin-Notizen-Zieluser-Auswahl komfortabler machen.
```

Konkreter kleiner Scope:

```text
Frontend-only in remote-modboard/backend/public/assets/rdap28-admin-notes.js.
Such-/Filterfeld fuer Zieluser-Auswahl.
Filter nach displayName/loginName/userUid.
Default ForrestCGN / tw:127709954 bleibt immer verfuegbar.
Ausgewaehlter User bleibt eindeutig sichtbar.
Read/Create nutzen weiterhin selectedTargetUser.userUid.
```

## Warum dieser Step

```text
Sichtbarer Nutzen.
Geringes Risiko.
Keine neue Backend-Route.
Keine DB-Migration.
Keine neuen Writes.
Bestehende RDAP44-Struktur wird erweitert statt parallel neu gebaut.
```

## Vor RDAP47 zuerst echte Dateien pruefen

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/RDAP46_ADMIN_NOTE_NEXT_SMALL_STEP_PLAN.md
remote-modboard/backend/public/assets/rdap28-admin-notes.js
remote-modboard/backend/public/assets/remote-modboard.js
remote-modboard/backend/public/index.html
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Nicht in RDAP47 aendern

```text
Keine Admin-Note Update-Funktion.
Keine Admin-Note Deactivate-Funktion.
Kein physisches Delete.
Keine Permission-Verwaltung.
Keine Community-Read-Anbindung fuer Admin-Notizen.
Keine Agent-/OBS-/Sound-/Overlay-/Command-Steuerung.
Keine freien Shell-/Datei-/Prozess-/URL-Ausfuehrungen.
Keine DB-Migration.
```

## Test-Erwartung fuer RDAP47

```text
node --check remote-modboard/backend/public/assets/rdap28-admin-notes.js
Admin -> Admin-Notizen oeffnen.
Zieluser-Suche sichtbar.
Suche filtert nach Name/Login/UID.
ForrestCGN / tw:127709954 bleibt Default und verfuegbar.
Auswahl laedt Notizen fuer Zieluser.
Create-Form zeigt gewaehlten Zieluser.
Login bleibt ok.
twitch/start HTTP 302 bei aktivem Login bleibt korrekt.
twitch/callback HTTP 403 ohne State bleibt korrekt.
```

## Danach moegliche groessere Steps

```text
Admin-User-Detailseite planen.
Admin-Note Update separat planen.
Admin-Note Deactivate separat planen.
Permission-Verwaltung separat planen.
```

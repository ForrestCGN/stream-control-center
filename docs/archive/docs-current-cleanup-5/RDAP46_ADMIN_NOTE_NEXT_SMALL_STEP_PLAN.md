# RDAP46_ADMIN_NOTE_NEXT_SMALL_STEP_PLAN

Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Typ: Doku-only / Plan

## Zweck

RDAP46 plant bewusst den naechsten kleinen Admin-Notizen-/Admin-User-Schritt nach RDAP44/RDAP45C.

Aktueller bestaetigter Stand:

```text
RDAP44: Admin-Notizen haben eine Zieluser-Auswahl.
RDAP45B/RDAP45C: Login/Deploy-Safety ist wieder konsistent.
Twitch-Login ist aktiv/freigegeben.
twitch/start HTTP 302 ist korrekt.
twitch/callback HTTP 403 ohne gueltigen OAuth-State bleibt Pflicht.
```

## Gepruefte Ausgangslage

```text
Admin -> Admin-Notizen zeigt Zieluser-Auswahl/Dropdown.
Default ist ForrestCGN / tw:127709954.
Read/Create nutzen den ausgewaehlten targetUserUid.
Create ist fuer berechtigte Admins sichtbar.
Update/Deactivate/Delete sind weiterhin deaktiviert.
Permission-Verwaltung ist weiterhin nicht Teil der Admin-Notizen-UI.
```

Relevante bestehende Struktur:

```text
remote-modboard/backend/public/assets/rdap28-admin-notes.js
- laedt Zieluser aus /api/remote/auth/model
- haelt selectedTargetUser im Frontend-State
- nutzt selectedTargetUser fuer Read/Create
- exponiert window.RdapAdminNotes.selectTargetUser(...)
- reagiert auf rdap44:select-admin-note-target
```

## Bewertete naechste Richtungen

### 1. Zieluser-Auswahl komfortabler machen

Vorteile:

```text
Sichtbarer Nutzen ohne neue Backend-Route.
Kein neuer Write-Scope.
Kein DB-Schema.
Vorhandene RDAP44-Struktur wird erweitert.
Geringes Risiko nach dem Login-Zwischenfall.
```

Moegliche Umsetzung:

```text
- Suchfeld oberhalb/innerhalb der Zieluser-Auswahl.
- Filter nach Name/Login/UID.
- kleine Treffer-/Statusanzeige.
- ausgewaehlter User bleibt eindeutig sichtbar.
- Auswahl steuert weiter Read/Create ueber targetUserUid.
```

### 2. Echte Admin-User-Detailseite planen

Vorteile:

```text
Langfristig sauber.
Kann spaeter Notizen, Rollen, Locks, Audit, Sessions und Status zusammenfuehren.
```

Nachteil:

```text
Groesserer Scope.
Braucht mehr UI-Struktur und ggf. neue read-only Datenbloecke.
Nicht als naechster Mini-Step empfohlen.
```

### 3. Admin-Note Update vorbereiten

Vorteile:

```text
Fachlich sinnvoll.
```

Nachteil:

```text
Write-Scope.
Muss Audit, Lock, Confirm, Backup/Rollback und Readback sauber bekommen.
Nach RDAP45C nicht als naechster Mini-Step empfohlen.
```

### 4. Admin-Note Deactivate vorbereiten

Vorteile:

```text
Sicherer als physisches Delete.
```

Nachteil:

```text
Trotzdem Write-Scope.
Muss separat geplant werden.
Nicht mit Komfort-UI vermischen.
```

### 5. Permission-Verwaltung

Bewertung:

```text
Wichtig, aber eigener grosser Bereich.
Nicht mit Admin-Notizen-UI vermischen.
Nicht als naechster RDAP47-Mini-Step.
```

## Empfehlung fuer RDAP47

```text
RDAP47_ADMIN_NOTE_TARGET_USER_SEARCH_COMFORT_PREPARED
```

Ziel:

```text
Admin-Notizen-Zieluser-Auswahl komfortabler machen, ohne Backend-/DB-/Permission-Aenderung.
```

Kleiner Scope:

```text
- Frontend-only in rdap28-admin-notes.js.
- Such-/Filterfeld fuer Zieluser-Auswahl.
- Filter nach displayName/loginName/userUid.
- Default ForrestCGN bleibt immer verfuegbar.
- Auswahl bleibt eindeutig sichtbar.
- Read/Create nutzen weiterhin selectedTargetUser.userUid.
- Keine neue Route.
- Keine DB-Migration.
- Keine neuen Writes.
```

## Nicht in RDAP47

```text
Keine Admin-Note Update-Funktion.
Keine Admin-Note Deactivate-Funktion.
Kein physisches Delete.
Keine Permission-Verwaltung.
Keine Community-Read-Anbindung fuer Admin-Notizen.
Keine Agent-/OBS-/Sound-/Overlay-/Command-/Channelpoints-Steuerung.
Keine freie Shell-/Datei-/Prozess-/URL-Ausfuehrung.
Keine DB-Migration.
```

## Vor RDAP47 echte Dateien pruefen

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/RDAP46_ADMIN_NOTE_NEXT_SMALL_STEP_PLAN.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
remote-modboard/backend/public/assets/rdap28-admin-notes.js
remote-modboard/backend/public/assets/remote-modboard.js
remote-modboard/backend/public/index.html
```

## Test-Erwartung fuer RDAP47

```text
node --check remote-modboard/backend/public/assets/rdap28-admin-notes.js
Browser: Admin -> Admin-Notizen oeffnen.
Zieluser-Suche sichtbar.
ForrestCGN / tw:127709954 bleibt Default.
Suche filtert nach Name/Login/UID.
Auswahl laedt Notizen fuer gewaehlten User.
Create-Form zeigt gewaehlten Zieluser.
Login bleibt funktionsfaehig.
twitch/start HTTP 302 bei aktivem Login bleibt korrekt.
twitch/callback HTTP 403 ohne State bleibt korrekt.
```

## Ergebnis RDAP46

```text
RDAP46 ist Plan-only.
Keine Code-Aenderung.
Keine Backend-Aenderung.
Keine Frontend-Aenderung.
Keine DB-Migration.
Kein Webserver-Deploy noetig.
Empfohlener naechster Step: RDAP47_ADMIN_NOTE_TARGET_USER_SEARCH_COMFORT_PREPARED.
```

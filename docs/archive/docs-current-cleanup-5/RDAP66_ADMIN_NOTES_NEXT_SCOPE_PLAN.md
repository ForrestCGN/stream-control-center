# RDAP66_ADMIN_NOTES_NEXT_SCOPE_PLAN

Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP

## Zweck

RDAP66 ist ein Plan-only-Step nach der fachlich bestaetigten Admin-Notes-UI.

Es wird kein Code geaendert.
Es wird kein Backend geaendert.
Es wird keine DB-Migration vorbereitet.
Es wird keine neue Permission vorbereitet.
Es wird kein Webserver-Deploy benoetigt.

## Ausgangslage

```text
RDAP64D ist live deployed.
RDAP65B bestaetigt fachlich:
- Admin -> Admin-Notizen zeigt Inhalt.
- Liste laedt 4 Admin-Notiz(en).
- Create funktioniert sichtbar.
- Create erzeugte admin_note_20260626095139_76c977525140.
- Liste wird nach Create aktualisiert.
- Bearbeiten-Button ist sichtbar.
- Update-Speichern funktioniert.
- Text wurde auf tedt1 aktualisiert.
- Erfolgsmeldung ist sichtbar: Notiz gespeichert. Liste wird aktualisiert ...
- Admin -> User-Detail zeigt Inhalt.
- Sicherheit/Diagnose zeigt HTTP-200-Karten.
- Navigation bleibt stabil.
- Deactivate/Delete sind nicht sichtbar.
```

## Bewertete Scope-Kandidaten

### Kandidat 1: Admin-Notes UI-Polish

```text
Nutzen:
- Direkt sichtbarer Nutzen fuer Forrest/Mods.
- Erfolgsweg ist bereits bestaetigt.
- Kein Backend erforderlich.
- Keine neue Permission erforderlich.
- Kein Delete/Deactivate.
- Geringes Risiko.

Moeglicher Inhalt:
- Admin-Notes-Karten lesbarer machen.
- Metadaten kompakter darstellen.
- Create-/Update-Erfolgshinweise klarer platzieren.
- Bearbeiten-Zustand kompakter fuehren.
- Safety-Hinweise klarer, aber nicht aufdringlicher anzeigen.
```

### Kandidat 2: Status-Semantik angleichen

```text
Nutzen:
- Diagnose wird weniger verwirrend.
- moduleBuild/statusApiVersion koennen besser erklaert werden.

Risiko:
- Backend-/Status-Routen muessten angefasst werden.
- Kein direkter funktionaler Nutzen fuer Admin-Notes-Bedienung.

Einordnung:
- Sinnvoll, aber nicht als naechster Code-Step priorisieren.
```

### Kandidat 3: Admin-Notes Zieluser-Auswahl verbessern

```text
Nutzen:
- Nutzerfreundlichere Suche/Select-Auswahl.
- Hilft spaeter bei mehreren Admin-Usern.

Risiko:
- Mehr Interaktion mit User-Modell/Auth-Modell.
- Potenziell groesserer UI-Scope als reiner Polish.

Einordnung:
- Sinnvoll, aber besser nach UI-Polish.
```

## Entscheidung

```text
Naechster Code-Step soll RDAP67_ADMIN_NOTES_UI_POLISH sein.
```

## RDAP67 Ziel

```text
Admin-Notes UI-Polish ohne neue Funktionalitaet und ohne Backend-Aenderung.
```

## RDAP67 erlaubter Scope

```text
remote-modboard/backend/public/assets/rdap28-admin-notes.js
optional remote-modboard/backend/public/assets/remote-modboard.css
optional docs/current/* und project-state/*
```

## RDAP67 nicht erlaubt

```text
Keine Backend-Route.
Keine DB-Migration.
Keine neue Permission.
Kein Admin-Note Deactivate.
Kein physisches Delete.
Keine Community-Read-Freigabe.
Keine Rollen-/Gruppen-/Permission-Writes.
Keine Session-Revocation UI.
Keine Agent-/OBS-/Sound-/Overlay-/Command-/Channelpoints-Steuerung.
Keine freie Shell-/Datei-/Prozess-/URL-Ausfuehrung.
Keine parallele Zweitnavigation.
```

## RDAP67 konkrete UI-Leitplanken

```text
- Bestehende Create-/Update-Funktion erhalten.
- confirmWrite:true unveraendert lassen.
- Bearbeiten nur dort zeigen, wo es aktuell erlaubt ist.
- Kein Optimistic-Update einfuehren.
- Erfolg/Fehler weiterhin sichtbar anzeigen.
- Keine neuen Schreibbuttons.
- Deactivate/Delete nicht einfuehren.
- Haupt-Router nicht erneut umbauen.
```

## Empfohlene Checks fuer RDAP67

```powershell
cd D:\Git\stream-control-center

node --check .\remote-modboard\backend\public\assets\rdap28-admin-notes.js
node --check .\remote-modboard\backend\public\assets\remote-modboard.js

git status --short
git diff --stat
```

Nach RDAP67 waere Webserver-Deploy noetig, falls Frontend-Dateien unter `remote-modboard/` geaendert werden.

# RDAP75B - Admin-Notes Docs und Next-Chat-Prompt

Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Art: Doku-only / Uebergabe / kein Code

## Ausgangslage

RDAP75 wurde lokal eingespielt und per `stepdone.cmd` nach GitHub/dev gebracht. GitHub/dev enthaelt damit den getesteten Dokumentations-Stand.

## Aktueller fachlicher Stand Admin-Notes

```text
Bestaetigt:
- Admin-Notes sind im Browser sichtbar.
- Navigation ist grundsaetzlich stabil.
- Create funktioniert.
- Update/Speichern funktioniert.
- Delete/Deactivate sind weiterhin nicht sichtbar.
- Technische Read/Write/Grenzen-Bloecke wurden aus der Normalansicht entfernt.
- Header-Aktionen wurden in den oberen Admin-Notizen-Header verschoben.
- Separate Toolbar-Doppelung wurde reduziert.
- Notiz-Titel wurden menschlicher lesbar gemacht.
```

## Offene Befunde aus Browser-Sichtung

```text
1. User-Detail/Header-State falsch:
   - In der Kopfzeile kann noch "User-Detail" stehen, obwohl Admin-Notizen sichtbar sind.
   - Das ist ein Router-/Header-State-Synchronisationsproblem.
   - Es darf nicht per CSS versteckt werden, sondern muss fachlich sauber korrigiert werden.

2. Zieluser-/Notizen-Kontext pruefen:
   - Die Anzahl der Notizen muss sich eindeutig auf den aktuell ausgewaehlten User beziehen.
   - Beispiel: ForrestCGN · 4 Notizen, EngelCGN · 0 Notizen, falls Engel keine Notizen hat.
   - Wenn beim Userwechsel alte Notizen/Counts stehen bleiben, ist das ein Reload-/State-Befund.

3. Design-Kontrakt festhalten:
   - Nicht weiter in kleinen optischen Einzelpatches treiben.
   - Erst Header-/Router-State fixen.
   - Dann Zieluser-/Count-/Reload-State fixen.
   - Danach erst weiter UI polieren.
```

## Verbindlicher Admin-Notes Seitenaufbau

```text
1. Seitenheader
   Titel: Admin-Notizen
   Rechts: Notizen neu laden | Neue Notiz

2. Zieluser-Auswahl
   Kompakt, sichtbar, setzt den Kontext fuer alle darunterliegenden Inhalte.

3. Notizen-Liste
   Titel: Notizen fuer <DisplayName>
   Unterzeile: <n> Notizen geladen
   Notizkarten mit menschlichem Datum statt technischer noteUid.

4. Create-Formular
   Nur sichtbar nach Klick auf Neue Notiz.

5. Diagnose/Technik
   Nicht in Hauptansicht.
   Spaeter hoechstens einklappbar: Diagnose anzeigen.

6. Router/Header
   Header muss immer zur sichtbaren Seite passen.
   Admin-Notizen darf nicht unter User-Detail laufen.
```

## Naechste Steps

```text
RDAP76_ADMIN_NOTES_ROUTER_HEADER_STATE_FIX
```

Ziel:

```text
- Wenn Admin-Notizen sichtbar sind, muss der Haupt-Header/Admin-Navigation-State Admin-Notizen anzeigen.
- User-Detail darf nicht aktiv wirken, wenn Admin-Notizen sichtbar sind.
- Keine CSS-Tarnung, sondern saubere State-/Router-Synchronisation.
- Kein Backend.
- Keine DB-Migration.
- Keine neue Permission.
- Kein Delete/Deactivate.
```

Danach:

```text
RDAP77_ADMIN_NOTES_SELECTED_USER_RELOAD_AND_COUNT_FIX
```

Ziel:

```text
- Zieluser-Wechsel laedt/zeigt eindeutig Notizen fuer diesen User.
- Count/Hinweis bezieht sich eindeutig auf den aktuell ausgewaehlten User.
- Keine alten User-Daten in Titel, Count oder Liste stehen lassen.
- Kein Backend, solange bestehende Readroute bereits korrekt userUid unterstuetzt.
```

## Keine Aenderungen in RDAP75B

```text
Kein Code.
Kein Backend.
Keine DB-Migration.
Keine neue Route.
Keine neue Permission.
Kein Delete/Deactivate.
Kein Webserver-Deploy noetig.
```

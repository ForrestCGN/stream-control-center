# NEXT_STEPS

Stand: RDAP65B_ADMIN_NOTES_FULL_BROWSER_VERIFICATION_OR_NEXT_SCOPE_DECISION  
Datum: 2026-06-26

## Naechster Step

```text
RDAP66_ADMIN_NOTES_NEXT_SCOPE_PLAN
```

## Ziel

```text
Auf Basis der bestaetigten Admin-Notes-Erfolgswege den naechsten kleinen, sicheren Scope planen.
Kein Code ohne vorherigen Scope-Plan.
```

## Ausgangslage

```text
RDAP64D ist live deployed.
Server-Checks sind ok.
Browser-Konsole ist sauber.
Admin-Notes-Sichtbarkeit wurde ueber Haupt-Router korrigiert.
Backend wurde nicht geaendert.
RDAP65B bestaetigt fachlich:
- Admin-Notizen Inhalt sichtbar.
- Create funktioniert.
- Update-Speichern funktioniert.
- User-Detail funktioniert.
- Navigation bleibt stabil.
- Delete/Deactivate nicht sichtbar.
```

## Moegliche naechste Mini-Scopes

```text
1. Admin-Notes UI-Polish:
   - Lesbarkeit der Karten verbessern.
   - Create-/Update-Hinweise klarer machen.
   - Bearbeiten-Zustand kompakter fuehren.

2. Status-Semantik angleichen:
   - Diagnosewerte wie moduleBuild/statusApiVersion weniger verwirrend darstellen.
   - Nur Status-/Doku-/Semantik, keine neue Produktivfunktion.

3. Admin-Notes Zieluser-Auswahl verbessern:
   - Suche/Select nutzerfreundlicher machen.
   - Keine neuen Schreibrechte.
   - Keine neue Permission.
```

## Nicht aendern

```text
Keine DB-Migration.
Keine neue Permission.
Kein Deactivate.
Kein Delete.
Keine Community-Read-Freigabe.
Keine Rollen-/Gruppen-/Permission-Writes.
Keine Agent-/OBS-/Sound-/Overlay-/Command-Steuerung.
Keine parallele Zweitnavigation.
```

## Empfehlung

```text
RDAP66 sollte Plan-only sein.
Danach erst einen kleinen Code-Step auswaehlen.
```

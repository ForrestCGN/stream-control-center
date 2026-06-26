# NEXT_STEPS

Stand: RDAP64E_DOKU_STATUS_AFTER_ROUTER_FIX  
Datum: 2026-06-26

## Naechster Step

```text
RDAP65_ADMIN_NOTES_UI_VERIFICATION_AND_NEXT_SCOPE_PLAN
```

## Ziel

```text
RDAP64D nicht erneut blind hotfixen, sondern fachlich im Browser verifizieren und den naechsten kleinen Admin-Notes-Scope sauber planen.
```

## Ausgangslage

```text
RDAP64D ist live deployed.
Server-Checks sind ok.
Browser-Konsole ist sauber.
Admin-Notes-Sichtbarkeit wurde ueber Haupt-Router korrigiert.
Backend wurde nicht geaendert.
```

## Pruefung vor neuem Code

```text
- Admin -> Admin-Notizen oeffnet Inhalt.
- Admin -> User-Detail oeffnet Inhalt.
- Wechsel zu Benutzerverwaltung/Rollen/Sicherheit/Overview funktioniert weiter.
- Update-UI erscheint nur fuer aktive Notizen mit Write-Recht.
- Speichern nutzt confirmWrite:true.
- Erfolg laedt die Notizen neu.
- Fehler werden sichtbar angezeigt.
- Deactivate/Delete erscheinen nicht.
```

## Erlaubter naechster Scope

```text
Plan-only oder Doku-only bevorzugt, solange Browser-Fachtest noch nicht voll dokumentiert ist.
Moegliche naechste Mini-Scopes erst nach Befund:
- UI-Polish fuer Admin-Notes, falls sichtbar aber unklar.
- Status-Semantik im Backend dokumentieren/angleichen, falls moduleBuild/statusApiVersion fuer Diagnose verwirrend bleibt.
- Admin-Notes Zieluser-Auswahl verbessern, ohne neue Schreibrechte.
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

## Doku-only Hinweis

```text
RDAP64E ist Doku-only.
Nach installstep/checks/stepdone ist kein Webserver-Deploy notwendig.
```

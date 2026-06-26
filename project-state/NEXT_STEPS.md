# NEXT_STEPS

Stand: RDAP65A_ADMIN_NOTES_BROWSER_VERIFICATION_DOC  
Datum: 2026-06-26

## Naechster Step

```text
RDAP65B_ADMIN_NOTES_FULL_BROWSER_VERIFICATION_OR_NEXT_SCOPE_DECISION
```

## Ziel

```text
Die noch offenen fachlichen Browser-Pruefpunkte nach RDAP64D einzeln bestaetigen oder bei Auffaelligkeit nur den Befund dokumentieren. Erst danach naechsten kleinen Scope planen.
```

## Ausgangslage

```text
RDAP64D ist live deployed.
Server-Checks sind ok.
Browser-Konsole ist sauber.
Admin-Notes-Sichtbarkeit wurde ueber Haupt-Router korrigiert.
Backend wurde nicht geaendert.
RDAP65A dokumentiert, dass der detaillierte Fachtest noch nicht vollstaendig einzeln festgehalten ist.
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
RDAP65A ist Doku-only.
Nach installstep/checks/stepdone ist kein Webserver-Deploy notwendig.
```

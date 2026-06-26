# TODO

Stand: RDAP65A_ADMIN_NOTES_BROWSER_VERIFICATION_DOC  
Datum: 2026-06-26

## Offen / als Naechstes

```text
RDAP65B_ADMIN_NOTES_FULL_BROWSER_VERIFICATION_OR_NEXT_SCOPE_DECISION
```

Aufgaben:

```text
- RDAP64D fachlich im Browser einzeln bestaetigen:
  - Admin-Notizen Inhalt sichtbar.
  - User-Detail Inhalt sichtbar.
  - Navigation bleibt stabil.
  - Update-UI vorhanden.
  - Update mit confirmWrite:true erfolgreich oder Fehler sichtbar.
  - Erfolg laedt Notizen neu.
  - Deactivate/Delete nicht sichtbar.
- Falls fachlich alles sauber ist: naechsten Mini-Scope planen.
- Falls UI noch unklar ist: nur gezielten Befund dokumentieren, keinen Blind-Hotfix.
```

## Erledigt durch RDAP64D/RDAP65A

```text
- Haupt-Router als zentrale Sichtbarkeitsinstanz bestaetigt.
- Admin-Notes-Router-Kollision beseitigt.
- Browser-Konsole nach Live-Deploy sauber.
- Server-Checks ok.
- Offene Fachtestpunkte fuer naechsten Step dokumentiert.
```

## Nicht machen

```text
- Kein weiterer Blind-Hotfix nur in rdap28-admin-notes.js.
- Kein Deactivate.
- Kein Delete.
- Keine DB-Migration.
- Keine neue Permission.
- Keine Community-Read-Freigabe.
- Keine Rollen-/Gruppen-/Permission-Writes.
```

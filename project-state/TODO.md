# TODO

Stand: RDAP64E_DOKU_STATUS_AFTER_ROUTER_FIX  
Datum: 2026-06-26

## Offen / als Naechstes

```text
RDAP65_ADMIN_NOTES_UI_VERIFICATION_AND_NEXT_SCOPE_PLAN
```

Aufgaben:

```text
- RDAP64D fachlich im Browser bestaetigen:
  - Admin-Notizen Inhalt sichtbar.
  - User-Detail Inhalt sichtbar.
  - Navigation bleibt stabil.
  - Update-UI vorhanden.
  - Update mit confirmWrite:true erfolgreich oder Fehler sichtbar.
- Falls fachlich alles sauber ist: naechsten Mini-Scope planen.
- Falls UI noch unklar ist: nur gezielten Befund dokumentieren, keinen Blind-Hotfix.
```

## Erledigt durch RDAP64D

```text
- Haupt-Router als zentrale Sichtbarkeitsinstanz bestaetigt.
- Admin-Notes-Router-Kollision beseitigt.
- Browser-Konsole nach Live-Deploy sauber.
- Server-Checks ok.
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

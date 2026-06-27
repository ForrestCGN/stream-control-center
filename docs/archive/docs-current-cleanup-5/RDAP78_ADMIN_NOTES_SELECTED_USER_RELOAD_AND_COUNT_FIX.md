# RDAP78_ADMIN_NOTES_SELECTED_USER_RELOAD_AND_COUNT_FIX

Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Art: Frontend-only

## Ziel

RDAP78 behebt den fachlichen Zieluser-Kontext der Admin-Notizen.

Wenn im Admin-Notes-Zieluser ein anderer User ausgewählt wird, muessen Liste, Count, Notice und Create/Update-Kontext eindeutig zu diesem User gehoeren.

## Geaendert

```text
remote-modboard/backend/public/assets/rdap28-admin-notes.js
```

## Verhalten nach RDAP78

```text
- Userwechsel setzt alte Liste/Count sofort zurueck.
- Ladehinweis nennt den aktuellen Zieluser.
- Read-Request nutzt exakt selectedTargetUser.userUid.
- Antwort wird nur gerendert, wenn sie noch zum aktuellen Zieluser passt.
- Verspaetete Antworten fuer alte Zieluser werden ignoriert.
- Count/Notice nennen den Zieluser.
- Create/Update pruefen bei Rueckkehr, ob der Zieluser noch derselbe ist.
```

## Nicht geaendert

```text
Kein Backend.
Keine DB-Migration.
Keine neue Permission.
Kein Delete.
Kein Deactivate.
Keine Community-Read-Freigabe.
Keine Rollen-/Gruppen-/Permission-Writes.
Keine Agent-/OBS-/Sound-/Overlay-/Command-Steuerung.
Keine freie Shell-/Datei-/Prozess-/URL-Ausfuehrung.
```

## Browser-Test

```text
1. Admin -> Admin-Notizen oeffnen.
2. ForrestCGN auswaehlen und laden.
3. Count/Liste/Notice muessen ForrestCGN nennen bzw. betreffen.
4. EngelCGN auswaehlen.
5. Alte Forrest-Liste muss sofort verschwinden/laden.
6. Count/Liste/Notice muessen EngelCGN nennen bzw. betreffen.
7. Zurueck auf ForrestCGN.
8. Kein alter Engel-Kontext darf stehen bleiben.
```

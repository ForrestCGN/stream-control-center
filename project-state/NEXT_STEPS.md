# NEXT_STEPS

Stand: RDAP76C_ADMIN_NOTES_INITIAL_RESTORE_STATE_FIX  
Datum: 2026-06-26

## Naechster Test

```text
RDAP76C_ADMIN_NOTES_INITIAL_RESTORE_STATE_FIX bestaetigen
```

## Ziel

```text
Header, aktive Navigation, Haupt-Router und sichtbares Admin-Notes/User-Detail-Panel muessen auch nach Reload/Restore sauber zusammenpassen.
```

## Testfokus

```text
- Seite hart neu laden.
- Admin-Notizen sichtbar => Header Admin-Notizen, Nav Admin-Notizen aktiv.
- User-Detail sichtbar => Header User-Detail, Nav User-Detail aktiv.
- Wechsel Admin-Notizen -> User-Detail -> Admin-Notizen mehrfach testen.
```

## Danach

```text
RDAP77_ADMIN_NOTES_SELECTED_USER_RELOAD_AND_COUNT_FIX
```

Ziel:

```text
- Zieluser-Wechsel laedt/zeigt eindeutig Notizen fuer diesen User.
- Count/Hinweis passt zum ausgewaehlten User.
- Keine alten User-Daten in Titel, Count oder Liste stehen lassen.
```

## Nicht aendern

```text
Keine DB-Migration.
Keine Backend-Route.
Keine neue Permission.
Kein Deactivate.
Kein Delete.
Keine Community-Read-Freigabe.
Keine Rollen-/Gruppen-/Permission-Writes.
Keine Agent-/OBS-/Sound-/Overlay-/Command-Steuerung.
Keine parallele Zweitnavigation.
```

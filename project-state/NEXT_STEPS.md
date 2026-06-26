# NEXT_STEPS

Stand: RDAP74_ADMIN_NOTES_HEADER_ACTIONS_DEDUP  
Datum: 2026-06-26

## Naechster Step

```text
RDAP75_ADMIN_NOTES_HEADER_ACTIONS_LIVE_VERIFICATION_DOC
```

## Ziel

```text
RDAP74 nach Webserver-Deploy fachlich im Browser bestaetigen und dokumentieren.
```

## Zu pruefen

```text
- Admin -> Admin-Notizen weiterhin sichtbar.
- Navigation bleibt stabil.
- Buttons "Notizen neu laden" und "Neue Notiz" stehen im oberen Header rechts.
- Separate Toolbar "Admin-Notizen" ist nicht mehr sichtbar.
- Liste "Admin-Notizen fuer ForrestCGN" bleibt sichtbar.
- Hinweistext bleibt kurz, z. B. "4 Notizen geladen".
- Neue Notiz funktioniert weiterhin.
- Update-Speichern funktioniert weiterhin.
- Erfolg/Fehler sichtbar.
- Delete/Deactivate sind nicht sichtbar.
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

RDAP74 braucht nach `stepdone.cmd` Webserver-Deploy, weil Frontend-Code unter `remote-modboard/` geaendert wurde.

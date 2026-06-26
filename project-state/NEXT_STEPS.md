# NEXT_STEPS

Stand: RDAP72_ADMIN_NOTES_HIDE_TECHNICAL_STATUS  
Datum: 2026-06-26

## Naechster Step

```text
RDAP73_ADMIN_NOTES_HIDE_TECHNICAL_STATUS_LIVE_VERIFICATION_DOC
```

## Ziel

```text
RDAP72 nach Webserver-Deploy fachlich im Browser bestaetigen und dokumentieren.
```

## Zu pruefen

```text
- Admin -> Admin-Notizen weiterhin sichtbar.
- Technische Read/Write/Grenzen-Bloecke sind nicht mehr prominent.
- Neu laden ist sichtbar.
- Neue Notiz ist sichtbar.
- Create-Formular oeffnet weiterhin nur bei Bedarf.
- Liste ist prominent sichtbar.
- Bearbeiten funktioniert weiterhin.
- Update-Speichern funktioniert weiterhin.
- Erfolg/Fehler sichtbar.
- User-Detail funktioniert weiterhin.
- Navigation bleibt stabil.
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

RDAP72 braucht nach `stepdone.cmd` Webserver-Deploy, weil Frontend-Code unter `remote-modboard/` geaendert wurde.

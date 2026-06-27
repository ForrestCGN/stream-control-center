# CURRENT_REMOTE_MODBOARD_STATE

Stand: RDAP118_ADMIN_NAV_POLISH_AND_VISIBLE_REVIEW  
Datum: 2026-06-27

## Navigation

```text
System:
- Übersicht
- Diagnose

Admin:
- Benutzerverwaltung
- Admin-Notizen
- Verbindungen
- Doku / Details
```

## Admin-Modul-Vertrag

```text
Admin-Fachmodule:
- registrieren ihre Page
- bauen/polieren ihren eigenen Inhalt
- laden eigene Daten, falls noetig

Admin-Fachmodule duerfen NICHT:
- eigene Admin-Navi-Buttons erzwingen
- Admin-Reihenfolge selbst steuern
- fremde Admin-Navi-Eintraege entfernen

Admin-Navigation:
- zentrale Sortierung/Deduplizierung in users.js
- RDAP118 normalisiert letzte alte Labels/Alias-Reste
- RDAP118 sorgt zentral dafuer, dass alle vier Admin-Eintraege vorhanden sind
```

## Sicherheit

```text
Keine Backend-Aenderung.
Keine DB-Migration.
Keine Agent-Actions.
Keine neuen Writes.
```

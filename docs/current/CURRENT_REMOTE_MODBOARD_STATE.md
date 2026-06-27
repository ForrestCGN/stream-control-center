# CURRENT_REMOTE_MODBOARD_STATE

Stand: RDAP114_ADMIN_NAV_CLEANUP  
Datum: 2026-06-27

## UI-/Produktregel

```text
Admin-Funktionen bleiben unter Admin.
User-Selbstkonto gehoert oben rechts ins Profilmenue.
Keine technischen Unterseiten als normaler Navigationspunkt.
Keine Projekt-Erklaerungen in normalen Ansichten.
```

## Admin-Navigation

```text
Admin:
- Benutzerverwaltung
- Admin-Notizen
- Rollen & Rechte
- Sicherheit
- Verbindungen

Nicht in linker Navigation:
- User-Detail
- eigenes Benutzer-Hauptmenue
- Details / System-Routen
```

## Sicherheit

```text
Keine Agent-Runtime aktiv.
Keine Agent-Actions aktiv.
Keine Backend-Aenderung in RDAP114.
Keine DB-Migration in RDAP114.
Alle betroffenen Admin-Ansichten bleiben read-only beziehungsweise im bestehenden Sicherheitszustand.
```

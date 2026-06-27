# CURRENT_REMOTE_MODBOARD_STATE

Stand: RDAP115_ACCESS_MODULE_SPLIT  
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

## Strukturstand

```text
remote-modboard/backend/public/assets/modules/admin/users.js
remote-modboard/backend/public/assets/modules/admin/access.js
```

## Sicherheit

```text
Keine Agent-Runtime aktiv.
Keine Agent-Actions aktiv.
Keine Backend-Aenderung in RDAP115.
Keine DB-Migration in RDAP115.
Rollen & Rechte bleibt read-only.
```

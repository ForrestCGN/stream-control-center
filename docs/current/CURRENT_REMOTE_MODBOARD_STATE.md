# CURRENT_REMOTE_MODBOARD_STATE

Stand: RDAP115B_REMOVE_ACCESS_NAV_DOC_ONLY  
Datum: 2026-06-27

## UI-/Produktregel

```text
Admin-Funktionen bleiben unter Admin.
User-Selbstkonto gehoert oben rechts ins Profilmenue.
Keine technischen Unterseiten als normaler Navigationspunkt.
Keine reine Doku-Seite als eigener Admin-Menuepunkt.
```

## Admin-Navigation

```text
Admin:
- Benutzerverwaltung
- Admin-Notizen
- Sicherheit
- Verbindungen

Nicht in linker Navigation:
- User-Detail
- Rollen & Rechte
- eigenes Benutzer-Hauptmenue
- Details / System-Routen
```

## Rollenverwaltung Zielbild spaeter

```text
Benutzerverwaltung
-> User oeffnen
-> User-Detail
-> Rollen verwalten
-> Modal/Fenster:
   - Rollen zuweisen/entziehen
   - Hover/Info pro Rolle
   - Sicherheitswarnung bei kritischen Rollen
   - Speichern erst mit Scope, Permission, Confirm-Write, Audit, Lock, Readback
```

## Sicherheit

```text
Keine Agent-Runtime aktiv.
Keine Agent-Actions aktiv.
Keine Backend-Aenderung in RDAP115B.
Keine DB-Migration in RDAP115B.
Keine neuen Writes.
```

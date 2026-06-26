# NEXT_STEPS

Stand: RDAP49B_ADMIN_USER_DETAIL_READONLY_LIVE_CONFIRMED_DOCS  
Datum: 2026-06-26

## Naechster empfohlener Step

```text
RDAP50_ADMIN_USER_DETAIL_NOTES_BRIDGE_POLISH_PLAN
```

## Ziel

```text
Den Uebergang zwischen Admin -> User-Detail und Admin -> Admin-Notizen sauber pruefen und planen.
```

## Warum

```text
RDAP49 zeigt User-Details read-only.
RDAP47 zeigt Admin-Notizen pro Zieluser.
Die Bruecke "Admin-Notizen oeffnen" ist sichtbar.
Vor weiteren grossen Funktionen sollte die Verbindung sauber dokumentiert/ggf. poliert werden.
```

## Moeglicher Scope RDAP50

```text
Plan-only oder kleiner Frontend-only Step, nach echter Dateipruefung.
Pruefen:
- Button Admin-Notizen oeffnen setzt denselben User.
- Admin-Notizen-Zieluser bleibt korrekt.
- Optional Hinweis/Ruecksprung zwischen Detail und Notizen.
- Keine neue Admin-Notizen-Implementierung.
```

## Nicht in RDAP50 tun

```text
Keine Backend-Aenderung ohne echten Bedarf.
Keine DB-Migration.
Keine Permission-Verwaltung.
Kein Admin-Note Update.
Kein Admin-Note Deactivate.
Kein Delete.
Keine Community-Read-Anbindung.
Keine Agent-/OBS-/Sound-/Overlay-/Command-Steuerung.
Keine Rollen-/Gruppen-Schreibverwaltung.
```

## Danach moeglich

```text
RDAP51_PERMISSION_READ_DETAIL_POLISH_PLAN
```

# RDAP51_ADMIN_USER_DETAIL_NOTES_BRIDGE_POLISH_PREPARED

Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Typ: Frontend-only Code-Step

## Zweck

RDAP51 setzt den in RDAP50 geplanten kleinen UI-Polish um:

```text
Die Bruecke von Admin -> User-Detail zu Admin -> Admin-Notizen wird sichtbarer und eindeutiger.
```

## Umsetzung

Geaendert:

```text
remote-modboard/backend/public/assets/rdap28-admin-notes.js
```

Ergaenzt:

```text
- Beim Oeffnen der Admin-Notizen aus dem User-Detail wird ein Kontext-Hinweis angezeigt.
- Der Hinweis zeigt, welcher Zieluser aus dem User-Detail uebernommen wurde.
- Der Hinweis sagt explizit, dass Read/Create weiterhin exakt diesen Zieluser verwenden.
- Button Zurueck zum User-Detail fuehrt zurueck auf die Detailansicht fuer denselben User.
- Button Hinweis ausblenden blendet nur den Kontext aus.
- `window.RdapAdminNotes.openNotesForUser(user)` als Diagnose-/Komfort-API.
```

## Sicherheitsgrenzen

```text
Keine Backend-Aenderung.
Keine DB-Migration.
Keine neue Route.
Keine Permission-Schreibfunktion.
Keine Rollen-/Gruppen-Schreibverwaltung.
Keine Session-Revocation.
Kein Admin-Note Update.
Kein Admin-Note Deactivate.
Kein Delete.
Keine zweite Admin-Notizen-Implementierung.
```

## Bestehende Logik bleibt

```text
Admin-Notizen Read/Create bleiben in der bestehenden RDAP44/RDAP47/RDAP49-Struktur.
Create sendet weiterhin nur confirmWrite=true, targetUserUid und noteText.
Backend entscheidet weiterhin ueber Session, Permission, Audit, Lock und Readback.
```

## Akzeptanzkriterien

```text
Admin -> User-Detail bleibt sichtbar.
Button Admin-Notizen oeffnen setzt denselben Zieluser.
Admin -> Admin-Notizen zeigt Kontext-Hinweis Aus User-Detail geoeffnet.
Zurueck zum User-Detail fuehrt zur passenden Detailansicht.
Hinweis ausblenden funktioniert.
Admin-Notizen Read/Create bleiben unveraendert.
TARGET_USER_UID bleibt entfernt.
```

# RDAP47_ADMIN_NOTE_TARGET_USER_SEARCH_COMFORT_PREPARED

Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Typ: Frontend-only Komfort-Step

## Zweck

RDAP47 macht die bestehende Admin-Notizen-Zieluser-Auswahl komfortabler.

```text
Admin -> Admin-Notizen bekommt ein Such-/Filterfeld fuer Zieluser.
Gefiltert wird clientseitig nach Name, Login, UID, Status und Rollen.
Default ForrestCGN / tw:127709954 bleibt erhalten.
Read/Create nutzen weiterhin den ausgewaehlten Zieluser.
```

## Hintergrund

RDAP44 hat die Admin-Notizen von einem fest verdrahteten Zieluser geloest und eine Zieluser-Auswahl eingefuehrt. RDAP46 hat geplant, als naechsten kleinen, sichtbaren und risikoarmen Schritt die Auswahl komfortabler zu machen.

RDAP47 setzt genau diesen Schritt um.

## Geaendert

```text
remote-modboard/backend/public/assets/rdap28-admin-notes.js
```

Frontend-Ergaenzungen:

```text
- Suchfeld ueber der Zieluser-Auswahl.
- Button "Suche leeren".
- Trefferanzeige "gefiltert / gesamt".
- Filter nach displayName, loginName, userUid, status, roles.
- Ausgewaehlter Zieluser bleibt in der Auswahl sichtbar, auch wenn der aktuelle Filter ihn nicht treffen wuerde.
- Create-Busy deaktiviert Select, Suche, Suche-leeren und User-neu-laden gemeinsam.
- Kleine API-Erweiterung window.RdapAdminNotes.setTargetSearch(term) fuer Diagnose/Komfort.
```

## Nicht geaendert

```text
Kein Backend-Code.
Keine DB-Migration.
Keine Permission-Verwaltung.
Kein Admin-Note Update.
Kein Admin-Note Deactivate.
Kein physisches Delete.
Keine Community-Read-Anbindung.
Keine Agent-/OBS-/Sound-/Overlay-/Command-/Channelpoints-Steuerung.
Keine freie Shell-/Datei-/Prozess-/URL-Ausfuehrung.
```

## Erwartetes Verhalten

```text
1. Admin -> Admin-Notizen oeffnen.
2. Zieluser-Suche ist sichtbar.
3. Ohne Suchbegriff werden alle geladenen Zieluser angezeigt.
4. Eingabe von Name/Login/UID filtert die Select-Optionen sofort.
5. Default ForrestCGN bleibt vorhanden.
6. Auswahl eines Users laedt dessen Admin-Notizen.
7. Create-Form zeigt weiterhin den ausgewaehlten Zieluser.
```

## Testplan lokal

```powershell
cd D:\Git\stream-control-center
node --check .\remote-modboard\backend\public\assets\rdap28-admin-notes.js
git status --short
git diff --stat
```

## Testplan live nach Deploy

```bash
curl -fsS http://127.0.0.1:3010/assets/rdap28-admin-notes.js | grep -n "adminNotesTargetSearch\|adminNotesTargetClearSearchButton\|TARGET_USER_UID"
```

Erwartung:

```text
adminNotesTargetSearch vorhanden
adminNotesTargetClearSearchButton vorhanden
TARGET_USER_UID nicht vorhanden
```

Browser-Test:

```text
Login funktioniert.
Admin -> Admin-Notizen zeigt Zieluser-Suche.
Suche nach forrestcgn findet ForrestCGN / tw:127709954.
Auswahl laedt Notizen.
Create bleibt nur mit admin.users.note.write sichtbar.
```

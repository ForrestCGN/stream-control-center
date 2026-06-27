# RDAP43_ADMIN_USER_DETAIL_NOTES_TARGET_SELECTION_PLAN

Stand: RDAP43_ADMIN_USER_DETAIL_NOTES_TARGET_SELECTION_PLAN  
Datum: 2026-06-25  
Projekt: `stream-control-center` / Remote-Modboard / RDAP

## Zweck

RDAP43 ist ein Bestandsaufnahme-/Plan-Step fuer den naechsten sichtbaren Dashboard-Ausbau:

```text
Admin-Notizen sollen nicht dauerhaft am fixen Zieluser tw:127709954 haengen.
Der naechste echte UI-Step soll eine saubere Zieluser-Auswahl bzw. Admin-User-Detailseite vorbereiten.
```

Dieser Step ist bewusst **Doku-/Plan-only**.

## Vorher bestaetigter Stand

```text
RDAP39C: Admin-Note Read-Route wiederhergestellt und live bestaetigt.
RDAP40: Admin-Note Create-UI live bestaetigt.
RDAP42: Status-/Routes-Semantik bereinigt und live bestaetigt.
RDAP42B: Live-Bestaetigung dokumentiert und nach GitHub/dev gebracht.
```

## Gepruefte echte Dateien / Ist-Stand

```text
remote-modboard/backend/public/index.html
remote-modboard/backend/public/assets/remote-modboard.js
remote-modboard/backend/public/assets/rdap28-admin-notes.js
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
```

Wichtige Ist-Befunde:

```text
index.html enthaelt bereits Admin -> Benutzerverwaltung.
rdap28-admin-notes.js enthaelt aktuell den festen Zieluser tw:127709954.
rdap28-admin-notes.js enthaelt bereits Read + Create fuer Admin-Notizen.
remote-modboard.js ist die zentrale Dashboard-JS-Datei fuer Navigation/Seitenlogik.
Die Admin-Notizen-UI wird aktuell zusaetzlich per rdap28-admin-notes.js injiziert.
```

## Zielrichtung fuer den naechsten echten Step

Empfohlener Folge-Step:

```text
RDAP44_ADMIN_USER_DETAIL_NOTES_TARGET_SELECTION_PREPARED
```

Ziel von RDAP44:

```text
- vorhandene Admin-Benutzerverwaltung als Einstieg nutzen
- User auswaehlen koennen
- Admin-Notizen fuer genau diesen Zieluser anzeigen
- Create-Notiz fuer genau diesen Zieluser erlauben, aber nur bei admin.users.note.write
- Read nur bei admin.users.note.read
- Zieluser nicht mehr hart in rdap28-admin-notes.js verdrahten
```

## Vorgeschlagene UX

Streamer-/modfreundlich und ohne technische Ueberladung:

```text
Admin -> Benutzerverwaltung
  - Userliste bleibt Einstieg
  - pro User Aktion: Details / Notizen oeffnen
  - Detailbereich zeigt User-Kopf mit Name, Login, UID, Rollen
  - darunter Tab/Karte: Admin-Notizen
  - Notizen lesen bei admin.users.note.read
  - Neue Notiz bei admin.users.note.write
```

Alternativ als kleiner Zwischenstep, falls die komplette Detailseite zu gross wird:

```text
Admin -> Admin-Notizen
  - Dropdown/Zieluser-Auswahl aus vorhandener Benutzerliste
  - Auswahl laedt Notizen fuer Zieluser
  - Create erstellt Notiz fuer ausgewaehlten Zieluser
```

Empfehlung: zuerst die kleinere Zieluser-Auswahl, danach echte Detailseite ausbauen.

## Sicherheits-/Arbeitsregeln

```text
Keine Admin-Note Update-Funktion.
Keine Admin-Note Deactivate-Funktion.
Kein physisches Delete.
Keine Permission-Vergabe in diesem Step.
Keine Community-Seiten-Anbindung an Admin-Notizen.
Keine freien kritischen technischen Eingaben fuer User-/Permission-Aktionen.
Keine DB-Migration ohne separaten Plan.
Keine neue parallele UI-Struktur, wenn vorhandene Admin-/User-Struktur erweitert werden kann.
```

## Technische Leitplanken fuer RDAP44

```text
- Read-Route bleibt: GET /api/remote/admin/users/admin-notes/read?targetUserUid=<uid>
- Create-Route bleibt: POST /api/remote/admin/users/admin-notes/create
- confirmWrite bleibt Body-Pflicht
- Zieluser muss serverseitig wie bisher existieren/geprueft werden
- UI darf Button nur nach serverseitig ermitteltem Write-Recht zeigen
- Nach Create immer Readback/Refresh
- keine Secrets, keine Tokens, keine Raw-Audit-Texte ins Frontend
```

## Wahrscheinlich betroffene Dateien fuer RDAP44

```text
remote-modboard/backend/public/assets/remote-modboard.js
remote-modboard/backend/public/assets/rdap28-admin-notes.js
remote-modboard/backend/public/index.html
```

Moeglicherweise spaeter, falls eine echte Userliste/Details-API fehlt:

```text
remote-modboard/backend/src/routes/admin-users.routes.js
remote-modboard/backend/src/services/*admin-user*.service.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/src/routes/status.routes.js
```

## Offene Pruefpunkte vor RDAP44-Code

```text
1. Gibt es bereits eine Admin-User-Liste/API im Backend, die fuer eine Auswahl genutzt werden kann?
2. Welche User-Felder liefert die bestehende Benutzerverwaltung im Frontend?
3. Kann rdap28-admin-notes.js so erweitert werden, dass targetUserUid dynamisch gesetzt wird?
4. Soll die Zieluser-Auswahl zuerst im Admin-Notizen-Tab passieren oder direkt in der Admin-Benutzerverwaltung?
5. Wie vermeiden wir Doppel-Navigation/Parallelstruktur?
```

## Entscheidung fuer den naechsten Chat/Step

Empfohlene Umsetzung in RDAP44:

```text
Kleiner sichtbarer UI-Step:
Admin-Notizen-Seite bekommt Zieluser-Auswahl aus vorhandener Benutzer-/Dashboard-Datenquelle.
Der fest verdrahtete Zieluser tw:127709954 wird durch ausgewaehlten Zieluser ersetzt.
Read/Create bleiben dieselben Backend-Routen.
```

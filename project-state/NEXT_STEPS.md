# NEXT_STEPS

Stand: RDAP47B_ADMIN_NOTE_TARGET_USER_SEARCH_COMFORT_LIVE_CONFIRMED_DOCS  
Datum: 2026-06-26

## Naechster empfohlener Step

```text
RDAP48_ADMIN_USER_DETAIL_READONLY_PLAN
```

## Ziel RDAP48

```text
Eine echte Admin-User-Detailseite read-only planen.
Admin-Notizen-Zieluser-Auswahl und Suche sind live.
Jetzt soll geklaert werden, wie User-Details sauber und sichtbar angebunden werden.
```

## Warum Plan-only

```text
Eine Admin-User-Detailseite beruehrt spaeter Userdaten, Rollen, Permissions, Audit und Admin-Notizen.
Deshalb zuerst klaeren, welche Daten bereits vorhanden sind und welche Routen/Services bestehend erweitert werden koennen.
```

## Moeglicher Inhalt der spaeteren Detailseite

```text
User-Identitaet:
- userUid
- displayName
- loginName
- Twitch-ID/Provider
- Status

Admin-Kontext:
- Rollen/Gruppen
- Permissions read-only
- Dashboard-Zugriff read-only
- letzter Login/Session-Hinweise, falls vorhanden
- Admin-Notizen fuer diesen User
- Audit-Auszug read-only, falls sinnvoll und bereits sicher verfuegbar
```

## RDAP48 soll klaeren

```text
Welche bestehenden Dateien/Routen liefern Userdaten?
Welche vorhandenen Module/Services werden erweitert statt neue Parallelstruktur zu bauen?
Welche Rechte braucht die Detailseite?
Welche Daten duerfen read-only angezeigt werden?
Wie wird von Admin-Notizen zur Detailseite verlinkt?
Was bleibt bewusst deaktiviert?
```

## Nicht direkt als naechstes tun

```text
Kein Admin-Note Update.
Kein Admin-Note Deactivate.
Kein physisches Delete.
Keine Permission-Verwaltung nebenbei.
Keine DB-Migration ohne separaten Plan.
Keine Community-Read-Anbindung fuer Admin-Notizen.
Keine Agent-/OBS-/Sound-/Overlay-/Command-Steuerung.
Keine freien Shell-/Datei-/Prozess-/URL-Ausfuehrungen.
```

## Danach moeglich

```text
RDAP49_ADMIN_USER_DETAIL_READONLY_PREPARED
```

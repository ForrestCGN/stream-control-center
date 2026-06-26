# RDAP54_PERMISSION_READ_DETAIL_EMPTY_TARGETS_POLISH_PLAN

Datum: 2026-06-26
Projekt: `stream-control-center` / Remote-Modboard / RDAP

## Zweck

RDAP54 plant einen kleinen Folge-Step nach RDAP53/RDAP53B.

RDAP53 ist live sichtbar und zeigt im Admin-User-Detail read-only Permission-Details. Dabei ist die Karte `Modulbezogene Rechte` sichtbar, zeigt aber aktuell `0 Targets`, weil `GET /api/remote/auth/model` im Live-Befund `model.modulePermissions | length = 0` liefert.

RDAP54 ist Plan-only und klaert, ob diese Anzeige im Frontend besser erklaert werden soll.

## Ausgangslage

Bestaetigter Live-Befund aus RDAP53B:

```text
Admin -> User-Detail zeigt RDAP53-Karten.
Karte `Effektive Rollen-Rechte` ist sichtbar.
ForrestCGN / owner zeigt 8 Rechte.
Karte `Modulbezogene Rechte` ist sichtbar.
Anzeige zeigt `0 Targets`.
`0 Targets` ist plausibel, weil `model.modulePermissions` aktuell leer ist.
```

API-Befund:

```text
GET /api/remote/auth/model
ok: true
readOnly: true
writeEnabled: false
rolePermissions: 21
modulePermissions: 0
```

## Problem

Die Anzeige `0 Targets` ist technisch korrekt, kann fuer den Benutzer aber wie ein Fehler wirken.

Tatsaechlich bedeutet sie nur:

```text
Es gibt aktuell keine Eintraege in `model.modulePermissions`.
Die Rollenrechte aus `model.rolePermissions` werden weiterhin korrekt angezeigt.
Es wurden keine modul-/targetbezogenen Rechte konfiguriert oder vom Auth-Modell geliefert.
```

## Ziel fuer einen moeglichen RDAP55-Step

Ein minimaler Frontend-only Polish soll die leere Module-/Target-Karte besser erklaeren.

Sinnvolle UI-Texte:

```text
Keine Modul-/Targetrechte vorhanden.
Das Auth-Modell liefert aktuell 0 modulePermissions.
Rollenrechte werden separat unter `Effektive Rollen-Rechte` angezeigt.
Das ist kein Fehler und keine fehlgeschlagene Berechtigungspruefung.
```

Optional kann eine kleine Diagnose-Zeile angezeigt werden:

```text
rolePermissions: vorhanden
modulePermissions: leer
Quelle: /api/remote/auth/model
```

## Empfohlener technischer Scope fuer RDAP55

```text
Nur `remote-modboard/backend/public/assets/rdap53-permission-read-detail.js` erweitern.
Keine neue Datei, wenn die bestehende RDAP53-Datei fachlich passt.
Keine Aenderung an `app.js`, wenn die bestehende Injection bereits funktioniert.
Keine Aenderung an `index.html`.
Keine Backend-Route.
Keine DB-Migration.
Keine Writes.
```

## Akzeptanzkriterien RDAP55

```text
Admin -> User-Detail bleibt erreichbar.
Effektive Rollen-Rechte bleiben sichtbar.
Modulbezogene Rechte bleiben sichtbar.
Bei 0 modulePermissions wird klar erklaert, warum 0 Targets angezeigt werden.
Keine Permission-/Rollen-/Gruppen-Schreibbuttons sichtbar.
Admin-Notizen-Bridge bleibt unveraendert funktionsfaehig.
```

## Explizit nicht tun

```text
Keine modulePermissions testweise in die DB schreiben.
Keine Fake-Targets im Frontend anzeigen.
Keine neue API-Route bauen.
Keine DB-Migration.
Keine Rollen-/Gruppen-/Permission-Verwaltung.
Keine Session-Revocation.
Kein Admin-Note Update.
Kein Admin-Note Deactivate.
Kein physisches Delete.
Keine Community-Read-Anbindung fuer Admin-Notizen.
Keine Agent-/OBS-/Sound-/Overlay-/Command-/Channelpoints-Steuerung.
```

## Bewertung

RDAP54 sollte Doku-only bleiben. Der eigentliche UI-Text-Polish kann danach als RDAP55 umgesetzt werden, wenn Forrest das will.

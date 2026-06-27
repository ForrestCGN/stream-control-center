# RDAP58_PERMISSION_READ_DETAIL_WRAPUP_OR_NEXT_AREA_PLAN

Datum: 2026-06-26
Projekt: `stream-control-center` / Remote-Modboard / RDAP

## Zweck

RDAP58 bewertet den nach RDAP57B live bestaetigten Permission-Read-Detail-Strang und plant, ob dieser Strang vorerst abgeschlossen wird oder welcher neue RDAP-Bereich als naechstes sauber vorbereitet werden soll.

RDAP58 ist Plan-only/Doku-only. Es wird nichts gebaut.

## Ausgangspunkt

Bestaetigter Stand aus RDAP57B:

```text
Admin -> User-Detail funktioniert weiter.
ForrestCGN @forrestcgn / tw:127709954 ist ausgewaehlt.
Effektive Rollen-Rechte bleiben sichtbar.
8 Rollenrechte werden angezeigt.
Rechte sind gruppiert:
- Admin: 5 Rechte
- Agent / Status: 1 Recht
- Dashboard / Remote: 2 Rechte
Admin-/Write-nahe Rechte sind als Modellanzeige markiert.
Modulbezogene Rechte / 0 Targets bleibt sichtbar und erklaert.
Anzeige / Diagnose bleibt sichtbar.
Keine Schreibbuttons sichtbar.
```

Live-Diagnose:

```text
rolePermissions gesamt: 21
effektive Rollenrechte: 8
modulePermissions gesamt: 0
passende Module-/Targets: 0
Gruppierung: Admin · Agent/Status · Dashboard/Remote
Quelle: /api/remote/auth/model
```

## Bewertung Permission-Read-Detail-Strang

Der Permission-Read-Detail-Strang RDAP52 bis RDAP57B ist fachlich ausreichend rund:

```text
RDAP52: Permission-Read-Detail-Polish geplant.
RDAP53: Permission-Read-Detail read-only UI umgesetzt.
RDAP53B: Live-Bestaetigung dokumentiert.
RDAP54: Empty-Targets-Polish geplant.
RDAP55: 0-Targets-Erklaerung/Diagnose umgesetzt.
RDAP55B: Live-Bestaetigung dokumentiert.
RDAP56: naechster Permission-Detail-Scope geplant.
RDAP57: Rechte-Kategorien/Modellanzeige umgesetzt.
RDAP57B: Live-Bestaetigung dokumentiert.
```

Aktuell ist damit erreicht:

```text
- Admin-User-Detail zeigt Rollen/Gruppen/Sessions weiterhin read-only.
- Effektive Rollenrechte werden verstaendlich angezeigt.
- Rechte sind nach Bereichen gruppiert.
- Write-nahe Modellrechte werden nicht als UI-Freigabe missverstanden.
- Leere modulePermissions werden als 0-Targets-Zustand erklaert.
- Diagnosewerte sind sichtbar.
- Keine Permission-/Rollen-/Gruppen-Schreibverwaltung wurde gebaut.
```

## Entscheidung

Empfehlung:

```text
Permission-Read-Detail-Strang vorerst abschliessen.
```

Begruendung:

```text
Der aktuelle Read-only-Zustand ist live nutzbar.
Weitere Permission-Polishes bringen aktuell weniger Fortschritt als ein neuer klarer Bereich.
Direkte Writes waeren zu frueh und muessen separat mit Audit/Confirm/Lock/Backup geplant werden.
```

## Naechster sinnvoller Bereich

Empfohlen wird als naechstes kein Permission-Write, sondern ein neuer Plan-Step fuer Admin-Notizen-Read-Scope:

```text
RDAP59_ADMIN_NOTES_COMMUNITY_READ_SCOPE_PLAN
```

Zielrichtung:

```text
Planen, ob und wie Admin-Notizen spaeter ausserhalb des Admin-Bereichs read-only sichtbar werden duerfen.
```

Wichtig: RDAP59 waere Plan-only.

## Warum Admin-Notes Community Read als naechster Plan sinnvoll ist

Bisher gilt:

```text
Admin-Notizen sind im Admin-Bereich read/create vorbereitet.
Admin-Note Update/Deactivate/Delete bleiben deaktiviert.
Community-Seiten duerfen Admin-Notizen aktuell nicht lesen.
```

Ein separater Plan ist noetig, bevor Community-Read gebaut wird:

```text
- Welche Notizen duerfen Community-/Nicht-Admin-Bereiche ueberhaupt sehen?
- Welche Notiztypen bleiben admin-only?
- Welche Rollen duerfen lesen?
- Wird nur Zusammenfassung/Flag angezeigt oder kompletter Notiztext?
- Welche Audit-/Privacy-Regeln gelten?
- Welche API darf genutzt werden?
- Darf es eine neue read-only Route geben oder reicht bestehende Admin-Route nicht?
```

## Scope fuer RDAP59, falls Forrest zustimmt

```text
Plan-only.
Keine Code-Aenderung.
Keine neue Route in RDAP59.
Keine DB-Migration.
Keine Writes.
Keine Community-Read-Freigabe in RDAP59.
Nur Entscheidungsvorlage/Architektur fuer spaeteren Read-only Zugriff.
```

## Explizit nicht tun

```text
Keine Permission-Writes.
Keine Rollen-/Gruppen-Schreibverwaltung.
Keine Session-Revocation.
Kein Admin-Note Update.
Kein Admin-Note Deactivate.
Kein physisches Delete.
Keine direkte Community-Read-Implementierung.
Keine neue Backend-Route in RDAP58.
Keine DB-Migration.
Keine Fake-Daten.
Keine Agent-/OBS-/Sound-/Overlay-/Command-/Channelpoints-Steuerung.
Keine freie Shell-/Datei-/Prozess-/URL-Ausfuehrung.
```

## Status nach RDAP58

```text
Permission-Read-Detail-Strang gilt als vorerst abgeschlossen.
Naechster empfohlener Step: RDAP59_ADMIN_NOTES_COMMUNITY_READ_SCOPE_PLAN.
RDAP59 soll nur planen, nicht bauen.
```

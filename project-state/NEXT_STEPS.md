# NEXT_STEPS

Stand: RDAP76_ADMIN_NOTES_ROUTER_HEADER_STATE_FIX  
Datum: 2026-06-26

## Naechster Step

```text
RDAP77_ADMIN_NOTES_SELECTED_USER_RELOAD_AND_COUNT_FIX
```

## Ziel

```text
Zieluser-Wechsel, Listeninhalt und Count eindeutig synchronisieren.
Wenn EngelCGN ausgewaehlt ist, duerfen nicht ForrestCGNs Count oder alte Notizen stehen bleiben.
```

## Ausgangslage

```text
RDAP76 setzt Admin-Notes/User-Detail Page-State ueber den bestehenden Haupt-Router.
Damit sollen Header, aktive Navigation und sichtbares Panel zusammenpassen.

Offen bleibt der zweite Browser-Befund:
- Zieluser-/Notizen-Kontext muss eindeutig sein.
- Count/Hinweis muss zum ausgewaehlten User passen.
```

## RDAP77 Scope

```text
- Bestehende Admin-Notes-Target-Selection pruefen.
- Zieluser-Wechsel muss Liste/Notice/Count sichtbar neu setzen.
- Ladezustand darf keine alten Daten als aktuelle Daten anzeigen.
- Keine neue Route, solange vorhandene Readroute `targetUserUid` korrekt unterstuetzt.
```

## Nicht aendern

```text
Keine DB-Migration.
Keine Backend-Route, solange nicht zwingend belegt.
Keine neue Permission.
Kein Deactivate.
Kein Delete.
Keine Community-Read-Freigabe.
Keine Rollen-/Gruppen-/Permission-Writes.
Keine Agent-/OBS-/Sound-/Overlay-/Command-Steuerung.
Keine parallele Zweitnavigation.
```

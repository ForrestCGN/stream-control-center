# NEXT_STEPS

Stand: RDAP76B_DOCS_PROJECT_CONSOLIDATION_REMOTE_MODBOARD  
Datum: 2026-06-26

## Naechster Code-Step

```text
RDAP76_ADMIN_NOTES_ROUTER_HEADER_STATE_FIX
```

## Ziel

```text
Header, aktive Navigation und sichtbares Admin-Notes-Panel sauber synchronisieren.
Wenn Admin-Notizen sichtbar sind, darf die Haupt-Kopfzeile nicht User-Detail anzeigen.
```

## Ausgangslage

```text
Admin-Notes UI ist sichtbar und funktional.
Design-Kontrakt wurde festgelegt.
Zentrale Projekt-/UI-/Roadmap-Dokumentation wurde in RDAP76B konsolidiert.
Browser-Befund zeigt einen falschen Header-/Router-State: User-Detail kann aktiv/oben stehen, obwohl Admin-Notizen sichtbar sind.
```

## RDAP76 Scope

```text
- Bestehenden Haupt-Router und vorhandene Admin-Notes-Integration pruefen.
- Page-State beim Wechsel Admin-Notizen/User-Detail sauber setzen.
- Keine CSS-Tarnung als Ersatz fuer falschen State.
- Keine parallele Zweitnavigation.
```

## Danach

```text
RDAP77_ADMIN_NOTES_SELECTED_USER_RELOAD_AND_COUNT_FIX
```

Ziel:

```text
- Zieluser-Wechsel laedt/zeigt eindeutig Notizen fuer diesen User.
- Count/Hinweis passt zum ausgewaehlten User.
- Keine alten User-Daten in Titel, Count oder Liste stehen lassen.
```

## Spaeter

```text
- historische RDAP-/Step-/Handoff-Dateien gezielt indexieren oder archivieren
- START_HERE_FOR_NEW_CHAT ggf. auf neue zentrale Doku-Basis aktualisieren
- Agent-/WSS-/OBS-/Sound-/Overlay-Funktionen erst nach sauberem Sicherheitsplan
```

## Nicht aendern

```text
Keine DB-Migration.
Keine Backend-Route.
Keine neue Permission.
Kein Deactivate.
Kein Delete.
Keine Community-Read-Freigabe.
Keine Rollen-/Gruppen-/Permission-Writes.
Keine Agent-/OBS-/Sound-/Overlay-/Command-Steuerung.
Keine parallele Zweitnavigation.
```

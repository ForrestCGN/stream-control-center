# NEXT_STEPS

Stand: RDAP50_ADMIN_USER_DETAIL_NOTES_BRIDGE_POLISH_PLAN  
Datum: 2026-06-26

## Naechster empfohlener Step

```text
RDAP51_ADMIN_USER_DETAIL_NOTES_BRIDGE_POLISH_PREPARED
```

## Ziel

```text
Den Uebergang von Admin -> User-Detail zu Admin -> Admin-Notizen eindeutiger und sichtbarer machen.
```

## Scope

```text
Frontend-only.
Vorhandene RDAP44/RDAP47 Admin-Notizen-Zieluser-Auswahl weiterverwenden.
Vorhandenen RDAP49 User-Detail-Zustand weiterverwenden.
Kontext-Hinweis in Admin-Notizen anzeigen, wenn von User-Detail geoeffnet.
Optional Ruecksprung zu User-Detail anzeigen.
```

## Nicht in diesem Step aendern

```text
Keine Backend-Aenderung.
Keine DB-Migration.
Keine Permission-Verwaltung.
Kein Admin-Note Update.
Kein Admin-Note Deactivate.
Kein Delete.
Keine Community-Read-Anbindung.
Keine Agent-/OBS-/Sound-/Overlay-/Command-Steuerung.
```

## Akzeptanzkriterien

```text
Button Admin-Notizen oeffnen setzt den Zieluser korrekt.
Admin-Notizen zeigen denselben User wie User-Detail.
Ein Kontext-Hinweis macht den Uebergang sichtbar.
Optional Ruecksprung zu User-Detail funktioniert.
Read/Create bleiben unveraendert.
```

## Danach

```text
RDAP51B_ADMIN_USER_DETAIL_NOTES_BRIDGE_POLISH_LIVE_CONFIRMED_DOCS
```

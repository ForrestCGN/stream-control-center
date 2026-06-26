# NEXT_STEPS

Stand: RDAP61B_ADMIN_NOTE_UPDATE_BACKEND_LIVE_CONFIRMED_DOCS  
Datum: 2026-06-26

## Naechster empfohlener Step

```text
RDAP62_ADMIN_NOTE_UPDATE_STATUS_SEMANTICS_CLEANUP
```

## Ziel

```text
Status-/Routen-Semantik nach RDAP61 bereinigen.
```

## Warum

RDAP61 ist live bestaetigt:

```text
Admin-Note Update Backend ist aktiv.
Update-UI ist nicht gebaut.
Deactivate bleibt disabled.
Delete bleibt verboten.
```

Im Live-Status existieren aber noch aeltere RDAP42-Hinweise, die pauschal sagen, Update sei deaktiviert.

## Richtung RDAP62

```text
- /api/remote/status bereinigen.
- /api/remote/routes Semantik falls noetig angleichen.
- Create-UI und Update-Backend getrennt anzeigen.
- Update-Backend als aktiv anzeigen.
- Update-UI weiter als nicht gebaut anzeigen.
- Deactivate/Delete weiter deaktiviert anzeigen.
```

## Nicht direkt aendern

```text
Keine Update-UI.
Kein Deactivate.
Kein Delete.
Keine DB-Migration.
Keine neue Permission.
Keine Community-Read-Freigabe.
Keine Rollen-/Gruppen-/Permission-Writes.
Keine Agent-/OBS-/Sound-/Overlay-/Command-Steuerung.
```

## Danach moeglich

```text
RDAP63_ADMIN_NOTE_UPDATE_UI_SCOPE_PLAN
```

Aber erst nach sauberer Status-Semantik.

# CURRENT_SYSTEM_STATUS – Birthday-System

Stand: `STEP_BIRTHDAY_005`.

Das Birthday-System ist in das Command-/Dashboard-/Sound-System integriert.

## Commands

- `!birthday set TT.MM`
- `!birthday set TT.MM.JJJJ`
- `!birthday show`
- `!birthday delete`
- `!birthday today`
- `!birthday party username`

## Show-Logik

- Intro-Video läuft zuerst über das Sound-System.
- Birthday-Overlay bleibt während des Videos ruhig.
- Nach der Intro-Dauer startet der Song über das Sound-System.
- Erst dann wechselt das Birthday-Overlay in `phase=party`.
- Party bleibt für die erkannte Songdauer sichtbar.

## Party-Presets

Neu ab STEP_BIRTHDAY_005:

- `birthday_parties`
- `birthday_show_profiles.party_key`
- Standard-Party als Fallback
- optionale eigene Party pro User

## Styles

- Classic Party
- CGN Neon Party
- Epic Celebration
- Heimaufsicht Fun
- Cute Soft Party

## Nächste sinnvolle Erweiterung

Party-Bilder pro Party, die während der Songphase eingeblendet/rotiert werden.

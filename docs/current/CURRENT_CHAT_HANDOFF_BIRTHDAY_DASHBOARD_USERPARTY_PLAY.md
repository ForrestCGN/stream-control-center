# Current Chat Handoff - Birthday Dashboard UserParty Play

Stand: 2026-06-07
STEP: `STEP_BIRTHDAY_DASHBOARD_USERPARTY_PLAY`

## Ausgangslage

Live-Status vor dem Step:

- Birthday-Modul aktiv.
- Show-System aktiv.
- Registry-Coverage sauber.
- 6 Party-Presets vorhanden.
- 8 Show-Profile vorhanden.
- Globales Intro-Video vorhanden.
- Standardsong vorhanden.
- Show-State idle.
- Queue leer.

## Ziel dieses Steps

Kurzfristig soll Forrest über das Dashboard eine UserParty anlegen/zuweisen und direkt abspielen können.

## Geänderte Dateien

- `htdocs/dashboard/modules/birthday.js`
- `htdocs/dashboard/modules/birthday.css`

## Umsetzung

Im Birthday-Dashboard Tab `Partys`:

- Neuer Button `Speichern & abspielen` bei der User-Party-Zuweisung.
- Neuer Button `Abspielen` je User in der Tabelle `User-Zuordnungen & Songs`.
- Playback nutzt den bestehenden Backend-Command-Flow:
  - `POST /api/birthday/command`
  - `args: ["party", "@login"]`

## Nicht geändert

- Kein Backend.
- Keine DB.
- Kein Overlay.
- Kein Sound-System.
- Kein Media-System.
- Keine Datenbereinigung.

## Nach dem Entpacken testen

```powershell
node -c htdocs\dashboard\modules\birthday.js
.\stepdone.cmd "STEP_BIRTHDAY_DASHBOARD_USERPARTY_PLAY"
```

Danach im Dashboard:

1. Birthday-System -> `Partys`.
2. Party/Celebration anlegen oder bearbeiten.
3. Song über MediaField auswählen/hochladen.
4. User eintragen.
5. Party zuweisen.
6. `Speichern & abspielen` oder Tabellenbutton `Abspielen` nutzen.

## Nächster sinnvoller Step

`STEP_BIRTHDAY_SHOW_START_ENDPOINT`

Ziel: sauberer Backend-Endpunkt `POST /api/birthday/show/start`, damit Dashboard-Playback nicht dauerhaft über den Chat-Command simuliert werden muss.

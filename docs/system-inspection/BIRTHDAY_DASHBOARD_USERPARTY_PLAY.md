# STEP_BIRTHDAY_DASHBOARD_USERPARTY_PLAY

Stand: 2026-06-07

## Ziel

Im Birthday-Dashboard soll kurzfristig eine UserParty direkt aus dem Tab `Partys` heraus nutzbar sein:

1. Party/Celebration anlegen oder bearbeiten.
2. Song über das vorhandene MediaField auswählen oder hochladen.
3. User auswählen.
4. Party dem User zuweisen.
5. UserParty direkt abspielen.

## Geänderte Dateien

- `htdocs/dashboard/modules/birthday.js`
- `htdocs/dashboard/modules/birthday.css`

## Änderung

### Dashboard

Im Tab `Partys` wurde ergänzt:

- Button `Speichern & abspielen` im Bereich `User einer Party zuordnen`.
- Button `Abspielen` je User in der Tabelle `User-Zuordnungen & Songs`.
- Beim Abspielen wird bewusst der vorhandene Command-Flow genutzt:
  - `POST /api/birthday/command`
  - `args: ["party", "@<login>"]`
  - Dashboard sendet sich dabei als Broadcaster-Kontext, damit die bereits vorhandene Rechteprüfung des Birthday-Moduls greift.
- Vor dem Start wird ein Browser-Confirm angezeigt.
- Nach Start/Queue wird das Dashboard neu geladen, damit Show-State und Queue aktualisiert werden.

### Styling

- Kleine Flex-Button-Gruppe `.birthday-inline-actions` ergänzt.

## Nicht geändert

- Kein Backend-Code.
- Keine Datenbank-Migration.
- Kein Sound-System-Umbau.
- Kein Media-System-Umbau.
- Kein Overlay-Umbau.
- Keine bestehenden Partys/Profile gelöscht.
- Keine Funktionalität entfernt.
- `!birthday show @user` wurde nicht repariert; das Dashboard nutzt weiterhin bewusst `party @user`.

## Tests

Syntax:

```powershell
node -c htdocs\dashboard\modules\birthday.js
```

Dashboard-Test:

1. Dashboard öffnen.
2. Birthday-System öffnen.
3. Tab `Partys` öffnen.
4. Party anlegen oder bearbeiten.
5. Song über `Party-Song auswählen oder hochladen` setzen.
6. User / Mention eintragen.
7. Party auswählen.
8. `Speichern & abspielen` drücken.
9. Confirm bestätigen.
10. Prüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/show/state" | ConvertTo-Json -Depth 8
Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/show/queue" | ConvertTo-Json -Depth 8
```

## Bekannte Einschränkungen

- Der neue Button verwendet den vorhandenen Command-Endpunkt statt eines neuen sauberen `POST /api/birthday/show/start`.
- Das ist absichtlich ein kurzfristiger Minimal-Step, damit UserPartys sofort über das Dashboard abgespielt werden können.
- Der saubere Show-Start-Endpunkt bleibt ein späterer Backend-Step.

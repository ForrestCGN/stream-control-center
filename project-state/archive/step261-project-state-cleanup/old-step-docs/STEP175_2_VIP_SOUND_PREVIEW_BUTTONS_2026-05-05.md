# STEP175.2 VIP-Sound-Vorschau Buttons

Stand: 2026-05-05

## Ziel

Vorhandene VIP-/Mod-Sounds direkt im Dashboard probehören können.

## Geänderte Dateien

- `htdocs/dashboard/modules/vip.js`
- `htdocs/dashboard/modules/vip.css`

## Änderung

- Sound-Vorschau-Buttons auf der Seite `Sounds` ergänzt.
- Sound-Vorschau-Buttons in `VIPs & Mods` ergänzt.
- Buttons erscheinen nur bei vorhandener Sounddatei.
- Fehlende Sounds behalten nur Upload-/Ändern-Aktionen.
- Vorschau nutzt die vorhandene öffentliche Sound-Dateistruktur, z. B. `/assets/sounds/vip/<datei>.mp3`.
- Beim Start einer neuen Vorschau wird eine laufende Vorschau gestoppt.

## Bewusst nicht geändert

- Keine Backend-Routen geändert.
- Keine Datenbank geändert.
- Keine Berechtigungslogik geändert.
- Keine Sound-System-Queue ausgelöst.
- Keine bestehende Upload- oder Sync-Funktion entfernt.

## Tests

```powershell
cd D:\Git\stream-control-center
node -c .\htdocs\dashboard\modules\vip.js
```

Danach im Dashboard prüfen:

- Tab `Sounds`: vorhandene Sounds lassen sich probehören.
- Tab `VIPs & Mods`: vorhandene Sounds lassen sich probehören.
- User ohne Sound zeigen keinen Vorschau-Button.

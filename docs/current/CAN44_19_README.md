# CAN-44.19 README

## Inhalt

Dieser ZIP-Stand ergänzt den gemeinsamen Shoutout-Texte-Tab im Dashboard.

## Einspielen

```powershell
cd D:\Git\stream-control-center
# ZIP nach D:\Git\stream-control-center entpacken
node -c htdocs\dashboard\modules\shoutout_texts.js
.\stepdone.cmd "CAN-44.19 Shoutout Text Dashboard Tab"
```

## Danach testen

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/texts" |
  ConvertTo-Json -Depth 10
```

Browser:

```text
Dashboard öffnen
Shoutout-System öffnen
Tab Texte anklicken
```

## Rollback

- `htdocs/dashboard/index.html` aus Git/Backup wiederherstellen.
- `htdocs/dashboard/modules/shoutout_texts.js` entfernen.
- `htdocs/dashboard/modules/shoutout_texts.css` entfernen.

Es wurden keine Backend- oder DB-Änderungen gemacht.

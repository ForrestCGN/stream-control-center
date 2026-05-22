# NEXT_STEPS – Birthday / Command-System / Medienverwaltung

## Sofort nach STEP_BIRTHDAY_003

1. ZIP entpacken nach:

```text
D:\Git\stream-control-center
```

2. Syntax prüfen:

```powershell
cd D:\Git\stream-control-center
node --check backend\modules\birthday.js
node --check htdocs\dashboard\modules\birthday.js
```

3. Commit/Deploy über Standardbefehl:

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "STEP_BIRTHDAY_003 Birthday Dashboard"
```

4. Backend nach Deploy neu starten, dann prüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/admin/users"
Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/admin/settings"
Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/admin/texts"
```

5. Dashboard prüfen:

```text
http://127.0.0.1:8080/dashboard
Community → Birthday-System
```

## Danach sinnvoll

### STEP_BIRTHDAY_004 – Manuelle Birthday Show
- Command z. B. `!birthday party username`.
- Video zuerst.
- Danach Overlay mit Party-Animation.
- Song abspielen.
- Userbezogener Song, sonst Standardlied.
- Medienauswahl über zentrale Medienverwaltung.
- Keine automatische Show bei normaler Chataktivität.

## Weiterhin offen aus Command/Media

### STEP274B – Media Dashboard testen/anwenden
Falls noch nicht passiert.

### STEP274C – Commands an Medienverwaltung anbinden
- Command Action-Typ `sound_play` bekommt Dropdown aus `/api/media/list?type=audio`.
- Command Action-Typ `video_play` bekommt Dropdown aus `/api/media/list?type=video`.

### STEP275 – Textgruppen/Zufallstexte
- Zentrale Textgruppen für Commands.
- Zufällige Varianten.
- Dashboardfähige Bearbeitung.

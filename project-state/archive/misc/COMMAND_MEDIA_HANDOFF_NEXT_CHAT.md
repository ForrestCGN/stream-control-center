# Übergabe für neuen Chat – Command-System & Medienverwaltung

## Kurzstand

Wir arbeiten am `stream-control-center` für ForrestCGN.

Repo:
- GitHub: `ForrestCGN/stream-control-center`
- Branch: `dev`
- Lokal: `D:\Git\stream-control-center`
- Live: `D:\Streaming\stramAssets`

Arbeitsweise:
- Immer echte Repo-/Live-Dateien als Single Source of Truth nehmen.
- Keine Funktionalität entfernen.
- Zuerst Repo/Live prüfen, dann ändern.
- Nach Steps: Syntaxcheck, `stepdone.cmd`, Deploy, Backend-Neustart, Live-Tests.
- SQLite: `D:\Streaming\stramAssets\data\sqlite\app.sqlite` nur erweitern, nie ersetzen.

## Letzter bestätigter Stand

### Command-System
- Core läuft stabil.
- Twitch-Chat-Hook funktioniert über `twitch_presence.js`.
- `/api/commands/catalog` läuft.
- Dashboard Commands existiert mit Tabs.
- Action-Typen wurden vorbereitet.
- Katalog muss bei neuen Modulen gepflegt werden.

### Medienverwaltung
- Media-Core läuft stabil als `STEP274A1C`.
- `/api/media/status` funktioniert.
- `/api/media/list?type=audio` und `type=video` funktionieren.
- Aktueller Live-Zähler:
  - 217 Audio
  - 10 Video
  - 31 Bilder
  - 0 Animationen
  - 258 gesamt

## Gerade gelieferter, noch zu testender Step

### STEP274B – Media Dashboard
ZIP: `STEP274B_media_dashboard.zip`

Soll einbinden:
- `System → Medien`
- `htdocs/dashboard/modules/media.js`
- `htdocs/dashboard/modules/media.css`
- Hook in `index.html` und `app.js`

Test:
```powershell
cd D:\Git\stream-control-center
node tools\easy\STEP274B_APPLY_MEDIA_DASHBOARD.cjs
node --check htdocs\dashboard\modules\media.js
node --check tools\easy\STEP274B_APPLY_MEDIA_DASHBOARD.cjs
.\stepdone.cmd "STEP274B Media Dashboard"
```

Nach Deploy/Restart:
```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/media/status"
```

Browser:
```text
http://127.0.0.1:8080/dashboard
System → Medien
```

## Danach geplant

### STEP274C – Commands an Medienverwaltung anbinden
- Sound-Command wählt Audio aus `media_assets`.
- Video-Command wählt Video aus `media_assets`.
- Vorschau-Icons im Command-Formular.
- Kein Datei-Upload direkt im Command-Formular; Upload bleibt zentral in Medienverwaltung.

### STEP274D – Medien-Ausführung
- Sound über bestehendes Sound-System.
- Video über Overlay/Player.
- Queue/Priorität/Lautstärke/Target.

### STEP275 – Textgruppen/Zufallstexte
- Zentrale Textgruppen für Commands.
- Variantenfähig.
- Dashboardfähig.

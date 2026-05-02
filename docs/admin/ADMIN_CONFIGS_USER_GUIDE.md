# Admin Configs Benutzeranleitung

Stand: 2026-05-02  
Projekt: `stream-control-center`

## Zweck

Der Bereich `Admin → Configs` ist für technische Konfiguration gedacht.

Hier gehören Einstellungen hin, die normale Stream-Bediener nicht versehentlich ändern sollten.

## Wo finde ich es?

Im Dashboard:

```txt
Admin → Configs
```

## Aktueller Status

Der Adminbereich ist teilweise aktiv.

Aktuell nutzbar:

```txt
Sound-System Experten
```

Weitere Config-Bereiche sind vorbereitet:

```txt
Stream-Desk
Navigation
Audit-Logging
Twitch Login
Backend Allgemein
ENV / Secrets Strategie
```

Viele davon sind aktuell noch nur lesend/vorbereitet.

## Sound-System Experten

Pfad:

```txt
Admin → Configs → Sound-System Experten
```

Dort werden technische Sound-System-Werte gepflegt:

```txt
Overlay URL
Sounds Base Dir
Helper-Pfad
Helper Timeout ms
Playback Mode
Allowed Extensions
Parallel-Kategorien
```

Diese Werte werden über die API gespeichert:

```txt
POST /api/sound/settings
```

Persistenz:

```txt
D:\Streaming\stramAssets\data\sqlitepp.sqlite
Tabelle: sound_settings
```

## Warum nicht auf der normalen Sound-Seite?

Weil diese Werte technische Basiswerte sind.

Falsche Änderungen können Sound-Ausgabe, Helper oder Datei-Erkennung kaputt machen.

Normale Sound-Seite:

```txt
- Bedienung
- Queue
- Ausgabe
- normale Runtime-Regeln
```

Admin Configs:

```txt
- technische Pfade
- Helper
- Dateitypen
- Base-Verzeichnisse
- technische URLs
```

## Aktuell gespeicherte Sound-Expertenwerte

Nach aktuellem Stand werden gespeichert:

```txt
output.targets.overlay.overlayUrl
output.targets.device.helper.path
output.targets.device.helper.timeoutMs
output.targets.device.helper.playbackMode
queue.parallelCategories
soundsBaseDir
allowedExtensions
```

Beispiel:

```txt
overlayUrl = /overlays/sound_system_overlay.html
helper.path = tools/audio-device-helper/dist/AudioDeviceHelper.exe
helper.timeoutMs = 8000
helper.playbackMode = auto
parallelCategories = system, admin, ui, test
soundsBaseDir = htdocs/assets/sounds
allowedExtensions = .mp3, .wav, .ogg, .webm, .m4a
```

## Was darf man hier ändern?

Nur ändern, wenn klar ist, was es bewirkt.

Relativ sicher:

```txt
- Helper Timeout leicht erhöhen
- Parallel-Kategorien gezielt ergänzen
```

Vorsichtig ändern:

```txt
- Helper-Pfad
- Sounds Base Dir
- Playback Mode
- Allowed Extensions
- Overlay URL
```

Nicht ohne Plan ändern:

```txt
- Datenbankpfade
- Secrets/Tokens
- Auth-Konfiguration
- Backend-Grundkonfiguration
```

## Spätere Absicherung

Dieser Bereich soll später geschützt werden durch:

```txt
- Rollen/Rechte
- Admin/Owner-Zugriff
- Audit-Logging
- Bestätigungsdialoge bei kritischen Änderungen
- Secrets nur maskiert anzeigen
```

## Prüfbefehle

Settings prüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/settings" | ConvertTo-Json -Depth 20
```

Nur gespeicherte Werte:

```powershell
(Invoke-RestMethod "http://127.0.0.1:8080/api/sound/settings").settings | ConvertTo-Json -Depth 20
```

Erwartung nach Speichern im Adminbereich:

```txt
settings enthält:
- queue.parallelCategories
- output.targets.overlay.overlayUrl
- output.targets.device.helper
- soundsBaseDir
- allowedExtensions
```

## Fehlersuche

Wenn der Bereich nicht lädt:

```txt
1. Dashboard hart neu laden: Strg + F5
2. Admin → Configs neu öffnen
3. /api/sound/settings prüfen
4. Browser-Konsole prüfen
5. node --check für adminconfigs.js ausführen
```

Prüfen:

```powershell
node --check "D:\Streaming\stramAssets\htdocs\dashboard\modulesdminconfigs.js"
```

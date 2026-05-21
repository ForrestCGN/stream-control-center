# NEXT STEPS - stream-control-center

Stand: 2026-05-21

## Nach STEP270A - Sound Loudness Scanner testen und Dashboard vorbereiten

STEP270A ist ein read-only Backend-Scanner. Nach Deploy zuerst nur testen:

```powershell
cd D:\Git\stream-control-center
node --check backend\modules\sound_loudness_scanner.js
```

Backend neu starten und API pruefen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/loudness/status" | ConvertTo-Json -Depth 60
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/loudness/routes" | ConvertTo-Json -Depth 60
```

Kleinen Testscan ausfuehren:

```powershell
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/sound/loudness/scan" -Body (@{ limit = 20 } | ConvertTo-Json) -ContentType "application/json" | ConvertTo-Json -Depth 80
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/loudness/results?limit=50&order=recommended_gain_db&dir=desc" | ConvertTo-Json -Depth 80
```

Danach moeglicher STEP270B:

```text
Dashboard-Seite fuer Sound-Lautheit bauen:
- Scan starten
- Ergebnisse anzeigen
- nach ok/warning/error filtern
- nach LUFS, True Peak, empfohlener Korrektur und Volume sortieren
- klare Hinweise fuer zu laute/zu leise Dateien anzeigen
```

Noch nicht bauen ohne neue Freigabe:

```text
Automatische Playback-Korrektur
Normalisierte Kopien
Originaldateien ueberschreiben
Sound-System Queue-/Playback-Umbau
```

## Nach STEP269A-C - Sound-/Discord-Integration beobachten und spaeter dashboardfaehig machen

STEP269A bis STEP269C sind funktional bestaetigt:

```text
Sound-System kann Discord als Ausgabeziel nutzen.
Sound-System kann passende Kategorien/Quellen automatisch nach Discord routen.
VIP-/Mod-Sounds laufen nicht mehr hart nur nach stream, sondern koennen ueber soundSystemTarget nach both laufen.
```

Naechste Beobachtung im echten Betrieb:

```text
SoundAlerts/Kanalpunkte kommen im Discord an.
Alert-Hauptsounds kommen im Discord an, falls gewuenscht.
Alert + Alert-TTS bleiben als Bundle sauber zusammen.
Normales Chat-TTS nur nach Discord routen, wenn es wirklich gewuenscht ist.
```

Spaeterer Dashboard-/Control-Center-Punkt:

```text
Sound-/Discord-Routing soll im Dashboard konfigurierbar werden.
```

Dazu gehoeren spaeter:

```text
Discord-Ausgabe global aktiv/deaktivierbar
Auto-Routing aktiv/deaktivierbar
Kategorien/Quellen fuer Discord-Routing bearbeiten
Standard-Ziel pro Bereich: stream, discord, both
VIP-/Mod-/SoundAlert-/Alert-/TTS-Ziele im Dashboard steuerbar
Discord-Voice-Status anzeigen
Testbutton fuer Discord-Soundausgabe
```

Wichtig: Discord bleibt Ausgabeziel des Sound-Systems. Keine zweite fachliche Discord-Queue bauen.

## Nach STEP266B - Alert Bundle/TTS Mischtest beobachten

STEP266B ist funktional getestet und soll jetzt nicht weiter angefasst werden, solange kein neuer Fehler nachweisbar ist.

Naechster Pflichtpunkt ist Beobachtung im echten bzw. realistischen Mehrfach-Alert-Betrieb:

```text
Alert 1 Sound + TTS bleiben zusammen
Alert 2 Sound + TTS bleiben zusammen
Overlay startet erst mit dem richtigen Bundle-Sound
Naechster Alert startet erst nach Ende des vorherigen Bundles inklusive TTS
```

Wenn wieder etwas gemischt wird, zuerst nur Diagnose sammeln:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/events?limit=5" | ConvertTo-Json -Depth 40
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status" | ConvertTo-Json -Depth 40
```

Dabei besonders pruefen:

```text
raw.soundSystem.bundled
raw.soundSystem.bundleId
raw.soundSystem.results
raw.alertTts.playback
raw.bundleFinishState
```

Nicht sofort anfassen:

```text
app.sqlite
config/**
backend/modules/sound_system.js
Sound-System Bundle-Core
Streamer.bot-Flows
Overlay-HTML
```

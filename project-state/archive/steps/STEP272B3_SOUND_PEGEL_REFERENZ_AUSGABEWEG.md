# STEP272B3 - Sound-Pegel Referenz-Ausgabeweg waehlbar

Stand: 2026-05-21

## Ziel

Referenzsound und technischer Test-Ton sollen nicht nur ueber OBS/Overlay laufen, sondern auch ueber das konfigurierte Audiogeraet oder beide Ausgabewege.

## Umsetzung

Geaendert:

```text
htdocs/dashboard/modules/sound_levelscan.js
htdocs/dashboard/modules/sound_levelscan.css
```

Der Referenz-Tab im Sound-Pegel-Dashboard hat jetzt einen Ausgabeweg-Select:

```text
OBS/Overlay
Audiogeraet
OBS + Audiogeraet
```

Der Wert wird fuer beide Aktionen genutzt:

```text
Referenzsound abspielen
Test-Ton abspielen
```

Technisch wird der gewaehlte Wert als `outputTarget` an `/api/sound/play` uebergeben.

## Nicht geaendert

```text
backend/modules/sound_system.js
backend/modules/sound_loudness_scanner.js
app.sqlite
config/**
Sound-Dateien
Sound-Queue
Discord-Routing
Alert-Bundle-Lock
TTS-System
Streamer.bot-Flows
Overlay-HTML
```

## Tests

```powershell
node --check htdocs\dashboard\modules\sound_levelscan.js
```

Dashboard:

```text
System -> Sound-Pegel -> Referenz
Ausgabeweg wechseln
Referenzsound abspielen
Test-Ton abspielen
```

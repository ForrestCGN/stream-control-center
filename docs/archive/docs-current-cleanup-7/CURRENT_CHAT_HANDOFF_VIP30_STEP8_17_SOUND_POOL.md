# CURRENT CHAT HANDOFF – VIP30 STEP8.17 Sound-Pool

Stand: 2026-06-06

## Ergebnis

VIP30 unterstützt jetzt mehrere Alert-Sounds und wählt beim Alert zufällig einen aktiven Sound aus.

## Neuer Dashboard-Aufbau

```txt
Übersicht | Slots | Logs | Config | Sounds | Texte | Aktionen | Diagnose
```

## Geändert

```txt
backend/modules/vip30.js
htdocs/dashboard/modules/vip30.js
htdocs/dashboard/modules/vip30.css
```

## Nicht geändert

```txt
htdocs/overlays/sound_system_overlay.html
backend/modules/sound_system.js
backend/modules/media.js
```

## Backend

Neue Version:

```txt
moduleVersion: 0.8.10
moduleBuild: step8.17-sound-pool
```

Neues Setting:

```txt
alerts.soundPool
```

Format:

```json
[
  {
    "id": "vip30-sound-1",
    "enabled": true,
    "weight": 1,
    "mediaId": 1413,
    "mediaPath": "",
    "label": "VIP30 Sound 1"
  }
]
```

Ablauf:

```txt
VIP30 success
-> zufälliges aktives SoundPool-Element nach weight wählen
-> fallback auf alerts.mediaId / alerts.mediaPath, wenn soundPool leer ist
-> Sound-Bundle mit gewählter mediaId/mediaPath bauen
-> Sound-System spielt wie bisher
```

## Dashboard Tab „Sounds“

Funktionen:

```txt
Sound hinzufügen
Sound duplizieren
Sound entfernen
aktiv/deaktivieren
Gewichtung setzen
Label setzen
Media-System Upload/Auswahl pro Sound
```

## Config-Bereich

Der Sound-Bereich wurde aus Config herausgenommen.

Config enthält keine große Sound-Auswahl mehr, sondern bleibt für technische Settings.

## Auto-Reload

Dirty-/Focus-Schutz gilt jetzt für:

```txt
Config
Sounds
Texte
```

## Test

```powershell
cd /d D:\Git\stream-control-center
node --check backend\modules\vip30.js
node --check htdocs\dashboard\modules\vip30.js
.\stepdone.cmd "VIP30-STEP8.17 Sound Pool"
```

Danach Node neu starten und Dashboard mit Strg+F5 neu laden.

# STEP272G - Sound-Pegel Boost-Kopien Preview und Einzeldatei-Test

## Ziel

Zu leise Sounds sollen nicht per Playback-Volume über 100% gezogen werden. Stattdessen wird zuerst sicher vorbereitet, einzelne verstärkte Kopien zu erzeugen und zu testen.

## Umsetzung

Neue Backend-Routen:

- `GET /api/sound/loudness/boost/preview`
- `POST /api/sound/loudness/boost/create-one`

Dashboard:

- `System -> Sound-Pegel -> Boost-Kopien`
- Boost-Preview für Dateien mit `volume_cap_reached`
- Einzelbutton `Boost-Kopie erzeugen`

## Verhalten

- Originaldateien werden nicht überschrieben.
- Keine automatische Massenaktion.
- Keine automatische Umleitung bestehender Alert-/SoundAlert-/VIP-Regeln.
- Kopien werden unter `htdocs/assets/sounds/normalized/<originalpfad>` erzeugt.
- Dadurch können sie direkt über `/api/sound/play?file=normalized/...` getestet werden.
- TTS-Dateien bleiben ausgeschlossen.
- In STEP272G werden nur Audio-Dateien `.mp3`, `.wav`, `.ogg`, `.m4a` direkt erzeugt. Video-Dateien werden zunächst als nicht direkt unterstützt markiert.

## Beispiel

Für:

```text
alerts/follow.mp3
```

entsteht:

```text
htdocs/assets/sounds/normalized/alerts/follow.mp3
```

Test über Sound-System:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/play?file=normalized/alerts/follow.mp3&outputTarget=overlay&target=stream&volume=80&source=sound_level_boost_test" | ConvertTo-Json -Depth 80
```

## Nicht geändert

- `app.sqlite` wurde nicht ersetzt.
- `config/**` wurde nicht geändert.
- Sound-System Queue/Discord/TTS/Alert-Bundle-Logik bleibt unverändert.
- Bestehende SoundAlert-Volumes auf 100 werden nicht geändert.
- Bestehende Alert-Regeln werden nicht weiter geändert.

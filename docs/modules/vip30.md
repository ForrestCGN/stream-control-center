# VIP30 / 30TageVIP

Stand: 2026-06-06  
Backend-Version: `0.8.13`  
Build: `step8.18.1-auto-sound-duration`

## Status

VIP30 hat SoundPool, OverlaySets und manuellen Alert-Test.

## SoundPool

Setting:

```txt
alerts.soundPool
```

Felder:

```txt
id
enabled
weight
mediaId
mediaPath
durationMs
label
```

## Sounddauer

```txt
durationMs = 0
```

bedeutet:

```txt
automatisch aus Media-System/ffprobe übernehmen
```

```txt
durationMs > 0
```

bedeutet:

```txt
manuelle Dauer in Millisekunden erzwingen
```

## Empfehlung

Für normale hochgeladene Sounds:

```txt
Dauer ms = 0
```

Nur bei falschen Medien-Metadaten manuell setzen.

## Manueller Test

Dashboard:

```txt
Aktionen -> VIP30 Alert testen
```

Der Test nutzt:

```txt
zufälliger Sound aus Sounds
zufälliger Text aus Texte
echtes Sound-Bundle
echtes VIP30 Overlay
kein Twitch/kein Slot/kein VIP Grant
```

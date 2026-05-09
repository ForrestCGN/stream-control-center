# NEXT STEPS – nach STEP207.1

## Nächster Block: Alert-Design / Overlay-Optik

Ziel:

```text
Alert-Overlay optisch verbessern, ohne bestehende Alert-/TTS-/Sound-Funktionalität zu entfernen.
```

Wichtig:

```text
TTS verlängert die Alert-Dauer.
Design darf nicht gegen verlängerte Dauer oder Sound-Sync arbeiten.
Overlay muss bei Sound + TTS sichtbar bleiben.
```

## Danach

### Bits-TTS final konfigurieren

Entscheiden:

```text
TTS ab 100 Bits?
TTS ab 1000 Bits?
TTS für alle Bits-Stufen?
Max. Zeichen je Stufe?
```

### TTS-Testbutton im Dashboard

Später sinnvoll:

```text
Button pro Regel: TTS-Test mit Beispieltext
Button darf keinen echten Alert in die Queue legen.
```

### Channelpoints / weitere Textquellen

Später prüfen:

```text
channel.channel_points_custom_reward_redemption.add → user_input
```

## Tests, die erhalten bleiben sollten

```text
Tipeee Donation mit TTS
Ko-fi Donation mit TTS
Bits 100–249 mit TTS
Bits 1.000–1.999 mit TTS
Resub mit TTS
```

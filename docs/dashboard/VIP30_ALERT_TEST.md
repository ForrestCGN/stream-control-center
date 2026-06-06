# VIP30 Dashboard – Alert-Test

Stand: 2026-06-06

## Ort

```txt
VIP30 Dashboard -> Aktionen
```

## Funktion

```txt
Anzeigename/Login zum Auflösen
VIP30 Alert testen
```

## Ablauf

```txt
Name/Login wird an Backend gesendet
Backend versucht Twitch /helix/users Lookup
Backend ergänzt avatarUrl
Backend wählt zufälligen Sound aus alerts.soundPool
Backend wählt zufälliges Textset aus alerts.overlaySets
Backend sendet /api/sound/bundle
Sound-System-Overlay zeigt VIP30-Card
```

## Sicherheit

```txt
kein VIP Grant
kein Slot Write
kein Redemption Fulfill/Cancel
kein Twitch-Schreibzugriff
```

## Testwerte

```txt
AkiGhosty
ForrestCGN
EngelCGN
```

## Erwartung

```txt
Avatar: geladen
Sound: zufälliger Sound
Textset: zufälliges Textset
Dauer: Media-System Auto
```

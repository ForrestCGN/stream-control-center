# STEP200.6 Status-Notiz – target/outputTarget

Stand: 2026-05-08

## Ergebnis

Die Aufruferprüfung ergab keinen akuten Code-Fix.

Aktuelle Regel bestätigt:

```text
outputTarget = overlay / device / both
target       = stream / discord / both
```

## Bewertung

```text
Sound-System       sauber getrennt
Alert-System       nutzt outputTarget
SoundAlerts        nutzt outputTarget
TTS                nutzt soundSystemOutputTarget
Sound-Dashboard    zeigt outputTarget mit target-Fallback
VIP                beobachten, aber kein Sofort-Fix
```

## Weiter

Nächster sinnvoller Schritt:

```text
STEP200.7 – test_ping / Sound-Preset-Entscheidung
```

# STEP207.1 – Alert TTS Verification / Project State

## Status

Erfolgreich getestet und bestätigt.

## Ergebnis

Der Alert-TTS-Dispatch funktioniert jetzt für Regeln mit `tts_enabled = 1`.

Bestätigt:

```text
Alert-Sound zuerst
TTS danach
Alert bleibt bis TTS-Ende sichtbar
TTS-Ergebnis wird in raw.alertTts gespeichert
```

## Erfolgreich getestete Regeln

```text
ID 8  – Ko-fi Donation Standard
ID 12 – Tipeee Donation Standard
ID 27 – 100- 249 Bits Normal
ID 31 – 1.000 - 1.999 Bits Normal
ID 36 – Re-Sub
```

## Wichtige Testbefunde

```text
/api/tts/say funktioniert mit erlaubter Rolle.
/api/tts/prepare-alert erzeugt korrekte MP3-Datei.
/api/sound/play kann erzeugte TTS-Dateien abspielen.
Alert-System dispatcht TTS nach STEP206 korrekt.
Dashboard speichert TTS-Felder nach STEP207 korrekt.
```

## Aktuelle TTS-Regelfelder

Genutzte Felder:

```text
tts_enabled
tts_timing
tts_mode
tts_template
tts_max_chars
tts_min_amount
```

Keine neue Parallelstruktur in `meta_json`.

## Aktuell offen

```text
Bits-Stufen final festlegen.
Design/Overlay optisch verbessern.
Später TTS-Testbutton im Dashboard prüfen.
```

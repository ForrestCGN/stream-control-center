# STEP207.1 – Alert TTS verifiziert

Stand: 2026-05-09  
Projekt: `stream-control-center`  
Branch: `dev`

## Kurzfassung

Der Alert-TTS-Ablauf wurde erfolgreich getestet und bestätigt.

Funktionierender Ablauf:

1. Alert kommt rein.
2. Passende Alert-Regel wird gefunden.
3. Normaler Alert-Sound wird zuerst abgespielt.
4. Danach wird der übermittelte Text per TTS erzeugt und abgespielt.
5. Der Alert bleibt bis zum Ende der TTS-Ausgabe sichtbar.
6. Das Ergebnis wird im Alert-Event unter `raw.alertTts` protokolliert.

## Geprüfte Bestandteile

### Direkter TTS-Test

Route:

```text
POST /api/tts/say
```

Ergebnis:

```text
OK – TTS wurde hörbar abgespielt.
```

Wichtig: Ohne passende Rolle kam korrekt `role_not_allowed`. Mit `role = moderator` funktionierte die direkte Ausgabe.

### Alert-TTS-Vorbereitung

Route:

```text
POST /api/tts/prepare-alert
```

Ergebnis:

```text
OK – MP3-Datei wurde erzeugt.
OK – soundSystemFile wurde zurückgegeben.
OK – Dauer wurde per ffprobe erkannt.
```

Die Route erzeugt nur die Audiodatei und spielt nicht selbst ab.

### Sound-System-Abspieltest

Route:

```text
POST /api/sound/play
```

mit erzeugter TTS-Datei:

```text
tts/generated/*.mp3
```

Ergebnis:

```text
OK – erzeugte Alert-TTS-Datei wurde hörbar abgespielt.
```

## Bestätigte Provider / Eventtypen

### Tipeee Donation

Regel:

```text
ID 12 – Tipeee Donation Standard
source: tipeee
type_key: donation
tts_enabled: 1
tts_timing: after_alert
tts_mode: audio_only
tts_template: {user} schreibt: {message}
```

Testergebnis:

```text
OK – Alert-Sound zuerst.
OK – danach TTS.
OK – Alert bleibt länger sichtbar.
OK – raw.alertTts.ok = true.
OK – raw.alertTts.playback.ok = true.
```

Beispielwerte aus Test:

```text
alertTts.durationMs: 8568
alertTts.playAfterMs: 12267
alertTts.extendedAlertDurationMs: 21735
```

### Ko-fi Donation

Regel:

```text
ID 8 – Ko-fi Donation Standard
source: kofi
type_key: donation
tts_enabled: 1
tts_timing: after_alert
tts_mode: audio_only
tts_template: {user} schreibt: {message}
```

Testergebnis:

```text
OK – Alert-Sound zuerst.
OK – danach TTS.
OK – Alert bleibt länger sichtbar.
OK – raw.alertTts.ok = true.
OK – raw.alertTts.playback.ok = true.
```

Beispielwerte aus Test:

```text
alertTts.durationMs: 8208
alertTts.playAfterMs: 11155
alertTts.extendedAlertDurationMs: 20263
```

### Twitch Bits 100–249

Regel:

```text
ID 27 – 100- 249 Bits Normal
source: twitch
type_key: bits
tts_enabled: 1
tts_timing: after_alert
tts_mode: audio_only
tts_template: {user} schreibt: {message}
tts_max_chars: 250
```

Testergebnis:

```text
OK – Alert-Sound zuerst.
OK – danach TTS.
OK – raw.alertTts.ok = true.
OK – raw.alertTts.playback.ok = true.
```

Beispielwerte aus Test:

```text
alertTts.durationMs: 7728
alertTts.playAfterMs: 7342
alertTts.extendedAlertDurationMs: 15970
```

### Twitch Resub

Regel:

```text
ID 36 – Re-Sub
source: twitch
type_key: resub
tts_enabled: 1
tts_timing: after_alert
tts_mode: audio_only
tts_template: {user} schreibt: {message}
tts_max_chars: 250
```

Testergebnis:

```text
OK – Alert-Sound zuerst.
OK – danach TTS.
OK – raw.alertTts.ok = true.
OK – raw.alertTts.playback.ok = true.
```

Beispielwerte aus Test:

```text
alertTts.durationMs: 7848
alertTts.playAfterMs: 18358
alertTts.extendedAlertDurationMs: 27106
```

### Twitch Bits 1.000–1.999

Regel:

```text
ID 31 – 1.000 - 1.999 Bits Normal
source: twitch
type_key: bits
tts_enabled: 1
tts_timing: after_alert
tts_mode: audio_only
tts_template: {user} schreibt: {message}
tts_max_chars: 250
tts_min_amount: null
```

Testergebnis:

```text
OK – Dashboard speichert TTS-Felder korrekt.
OK – Regel greift bei 1500 Bits.
OK – Alert wurde im Overlay angezeigt.
OK – TTS wurde hörbar abgespielt.
```

## Aktuell mit TTS aktiv

Nach den Tests sind aktuell bestätigt aktiv:

```text
Ko-fi Donation
Tipeee Donation
Bits 100–249
Bits 1.000–1.999
Resub
```

## Wichtige technische Feststellung

Der Fehler lag nicht an:

```text
TTS-System
Sound-System
Google-TTS
Audioausgabe
```

Der fehlende Baustein war der automatische Dispatch im Alert-System:

```text
Alert-Regel tts_enabled = 1
→ /api/tts/prepare-alert
→ erzeugte Datei über /api/sound/play
→ Alert-Dauer verlängern
→ raw.alertTts protokollieren
```

## Dashboard-UI

Der Regel-Editor wurde in STEP207 für TTS aufgeräumt.

Alter Titel:

```text
TTS vorbereitet
```

Neuer Bereich:

```text
Text-to-Speech
```

Wichtiges UI-Verhalten:

```text
TTS-Ausgabe: Aus / An
Wenn Aus: Detailfelder ausgeblendet
Wenn An: Timing, Modus, Min-Wert, Max Zeichen, Template sichtbar
```

Hinweistext:

```text
Erst läuft der Alert-Sound. Danach wird der Text per TTS abgespielt. Der Alert bleibt bis zum Ende sichtbar.
```

## Offene Entscheidungen

Noch nicht final entschieden:

```text
Welche Bits-Stufen dauerhaft TTS bekommen.
Ob GiftSub/Sub-Bombe TTS bekommen soll.
Ob Channelpoints später TTS bekommen soll.
Ob TTS-Templates pro Eventtyp schöner formuliert werden sollen.
Ob TTS im Dashboard zusätzlich eine Vorschau-/Test-Schaltfläche bekommt.
```

## Nächster sinnvoller Schritt

1. Alert-Design/Overlay-Optik weiter verbessern.
2. Danach entscheiden, welche Bits-Stufen TTS dauerhaft aktiv bekommen.
3. Später TTS-Testbutton pro Regel im Dashboard ergänzen.

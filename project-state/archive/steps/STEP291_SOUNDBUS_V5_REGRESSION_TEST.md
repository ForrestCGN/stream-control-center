# STEP291 – SoundBus V5 Real Queue/Bundle Regression Test

Datum: 2026-05-24T14:10:00Z

## Zweck

Dieser STEP dokumentiert den großen V5-Real-Queue-/Bundle-Regressionstest mit aktivem `soundBus.enabled = true`.

Ziel war zu prüfen, ob der neue additive SoundBus-Event-Ausgang die bestehende Sound-System-Logik beeinflusst.

## Ausgangslage

- `backend/modules/sound_system.js` läuft auf `step = 289`.
- `soundBus.enabled = true`.
- `soundBus.communicationBusAvailable = true`.
- Alert-System bleibt im sicheren Visual-Standard `alertOutput.mode = legacy`.
- Sound-System bleibt Master für Queue, Bundles, Prioritäten, Device-/Discord-Ausgabe und TTS-Reihenfolge.

## Test

Ausgeführt wurde:

```cmd
tools\easy\05_SOUND_QUEUE_FULL_ORDER_TRACE_TEST_V5_REAL_MOD.cmd
```

Zusätzlich wurden Statusausgaben und Trace-Dateien erzeugt:

- `live_sound_trace_20260524_160117.summary.txt`
- `live_sound_trace_20260524_160117.jsonl`
- `sound_queue_full_order_v5_real_mod_20260524_160117.events.json`

## Relevante Testabfolge

Die Trace-Reihenfolge zeigte:

1. Alert 1 Hauptsound.
2. Alert 1 TTS.
3. Alert 2 Hauptsound.
4. Alert 2 TTS.
5. Alert 3 Hauptsound.
6. Alert 3 TTS.
7. Danach SoundAlert 1.
8. Danach SoundAlert 2.
9. Danach Mod-Sound Araglor.
10. Danach Mod-Sound Drudchen_CGN.
11. Danach normale TTS-Queue.

Wichtig: Kein SoundAlert, Mod-Sound oder normales TTS ist zwischen Alert-Hauptsound und die passende Alert-TTS gerutscht.

## Bestätigte Endwerte aus Status

Sound-System nach Test:

- `queuedCount = 0`
- `currentBundle = null`
- `activeBundleLock = null`
- `started = 15`
- `queued = 11`
- `stopped = 1`
- `cleared = 1`
- `failed = 0`
- `deviceStarted = 14`
- `deviceFailed = 0`
- `discordStarted = 12`
- `discordFailed = 3`
- `bundlesQueued = 4`
- `bundleItemsQueued = 8`
- `levelCorrectionFailed = 0`

Alert-System nach Test:

- `queueLength = 0`
- drei V5-Bits-Alerts wurden vollständig verarbeitet
- alle drei Alerts endeten mit `finishReason = client_ack`
- Alert-Visual-Standard blieb `legacy`

SoundBus:

- `soundBus.enabled = true`
- `soundBus.communicationBusAvailable = true`
- `soundBus.stats.errors = 0`
- SoundBus-Events wurden während des Tests fortlaufend erzeugt.

## Ergebnis

### Bestanden

Der SoundBus hat die bestehende Sound-/Queue-/Bundle-Reihenfolge nicht beschädigt.

Bestätigt:

- Alert-Bundles bleiben zusammen.
- Alert-Hauptsound bleibt vor der passenden Alert-TTS.
- SoundAlerts werden hinter aktive Alert-Bundle-Locks gelegt.
- Real-Mod-Sounds werden hinter aktive Alert-Bundle-Locks gelegt.
- Normales TTS drängt sich nicht zwischen Alert-Hauptsound und Alert-TTS.
- Queue ist am Ende leer.
- `activeBundleLock` ist am Ende leer.
- `currentBundle` ist am Ende leer.
- `soundBus.stats.errors = 0`.
- `failed = 0`.
- `deviceFailed = 0`.

### Warnung / Nebenbefund

Im V5-Test wurden `discordFailed = 3` gezählt.

Der konkrete Fehler aus dem Status/Trace war:

```text
sound nicht gefunden: media/alerts/bits/100-249.mp3
```

Das betrifft die Discord-Routing-/Dateipfad-Auflösung für Media-Registry-Alert-Sounds. Der Stream-/Device-Pfad lief weiter, die Alert-Reihenfolge blieb stabil und `soundBus.stats.errors` blieb 0.

Dieser Befund wird als separater Folgepunkt behandelt und ist kein Grund, den SoundBus-Queue-Test als gescheitert zu bewerten. Für eine spätere Produktivfreigabe der gesamten Sound-Schicht muss der Discord-Media-Pfad aber geprüft werden.

## Bewertung

STEP291 gilt als:

**SoundBus V5 Queue-/Bundle-Regression bestanden mit Discord-Routing-Warnung.**

## Nicht geändert

- Keine Codeänderung.
- Keine Queue-Logik geändert.
- Keine Bundle-/`activeBundleLock`-Logik geändert.
- Keine Caller-Module geändert.
- Keine DB-Migration.
- Keine Funktionalität entfernt.

## Empfehlung

1. SoundBus kann für weitere Tests aktiv bleiben.
2. Vor Produktivfreigabe als Standard sollte `soundBus.enabled` bewusst entschieden werden.
3. Nächster sinnvoller STEP: Discord-Routing-/Media-Pfad-Audit für `media/alerts/...` bei Sounds mit `target = both`.

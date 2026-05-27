# Sound-System Routing für Channelpoints

Stand: 2026-05-27

## Ziel

Channelpoints soll nicht selbst entscheiden, ob ein Sound über Browser-Overlay oder Audio-Device läuft. Channelpoints übergibt Media-Aufträge an das Sound-System. Das Sound-System entscheidet Routing, Queue und Discord-Ziel.

## Aktueller Standard

```text
Audio/Sound: Device
Video: Overlay/Media-Bridge, wenn nötig
Ziel: Stream + Discord
Queue: Sound-System entscheidet
```

## Wichtige Korrektur

Problem vor STEP523:

```text
Reward stand auf Auto,
Sound-System defaults.outputTarget stand aber auf overlay,
dadurch lief Audio weiter über Overlay.
```

Korrektur in `config/sound_system.json`:

```text
output.defaultTarget  = device
defaults.outputTarget = device
targets.discord       = enabled
targets.both          = enabled
output.targets.both   = enabled
```

## Diagnose

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status" | ConvertTo-Json -Depth 6
```

Prüfen:

```text
config.defaults.outputTarget = device
config.output.defaultTarget  = device
```

Wenn trotz JSON noch `overlay` erscheint, überschreibt eine DB-/Runtime-Einstellung den Config-Wert.

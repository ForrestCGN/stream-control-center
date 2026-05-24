# ALERT/SOUNDBUS HANDOFF – STEP351

## Zusammenfassung

Die Kommunikations-/Timingprobleme zwischen Alerts, Sound, Overlays und Dashboard wurden nicht nur als einzelner Alert-Bug betrachtet, sondern in mehreren Blöcken systematisch in Richtung CommunicationBus/SoundBus ausgebaut.

## Ergebnisstand

- Sound-System erzeugt SoundBus-Ereignisse.
- SoundBus ist im Sound-Dashboard sichtbar.
- Sound-nahe Systeme sind über Kontext unterscheidbar.
- Alert-System übergibt Alert-Sounds/TTS als SoundBundle.
- Alert/SoundBundle/SoundBus-Korrelation ist in Statusdaten sichtbar.
- Alert-Dashboard hat eine eigene `Bus / Sync`-Sicht.

## Bestätigte Tests

### STEP310

- SoundAlerts / Channel Rewards
- Mod-/VIP-Sounds
- normales TTS
- Alerts mit TTS
- Queue-Reihenfolge
- Bundle-Lock
- Discord/Device
- SoundBus Kontext

### STEP340

- 3 Alert-Bundles vorbereitet.
- 3 Alert-Bundles gepostet.
- 3 Alert-Bundles OK.
- 0 Bundle-Fehler.
- 0 SoundBus-Fehler.

### STEP350

- Alert-Dashboard-Bus/Sync aktiv.
- `alertStep=350` bestätigt.
- Sound-System bleibt auf logisch korrektem `soundStep=340`.
- Keine Queue/Bundle/Device/Discord-Fehler.

## Wichtige Endpunkte

```text
/api/sound/status
/api/alerts/status
/api/sound/play?id=test_ping
```

Wichtiger Test:

```cmd
tools\easy_SOUND_QUEUE_FULL_ORDER_TRACE_TEST_V5_REAL_MOD.cmd
```

Kompakter Prüfblock:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status"
$a = Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/status"

[pscustomobject]@{
  soundStep            = $s.step
  alertStep            = $a.step
  queuedCount          = $s.queuedCount
  activeBundleLock     = $s.activeBundleLock
  soundBusErrors       = $s.soundBus.stats.errors
  alertBundlesPrepared = $a.alertSoundCorrelation.stats.bundlesPrepared
  alertBundlesPosted   = $a.alertSoundCorrelation.stats.bundlesPosted
  alertBundlesOk       = $a.alertSoundCorrelation.stats.bundlesOk
  alertBundlesFailed   = $a.alertSoundCorrelation.stats.bundlesFailed
  failed               = $s.stats.failed
  deviceFailed         = $s.stats.deviceFailed
  discordFailed        = $s.stats.discordFailed
}
```

## Nächste Empfehlung

`STEP360 – Alert Bus/Sync Praxismodus + Dashboard Feinschliff`

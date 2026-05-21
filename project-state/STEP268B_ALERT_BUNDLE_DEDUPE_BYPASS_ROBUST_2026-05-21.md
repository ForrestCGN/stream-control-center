# STEP268B - Alert Bundle Dedupe Bypass Robust

## Zweck

Der aktuelle Trace nach STEP268A zeigt:

- Alert 1: Hauptsound + TTS korrekt.
- Alert 2: Bundle wird sofort gebaut und ans Sound-System geschickt.
- Alert 2: Hauptsound wird im Sound-System mit `cooldown_same_sound` gedroppt.
- Alert 2: TTS bleibt in der Queue und spielt allein.

Damit ist nachgewiesen: Die Immediate-Prequeue arbeitet, aber die globale Sound-System-Dedupe entfernt gleiche Alert-Hauptsounds.

## Fix

`backend/modules/sound_system.js` erkennt Alert-Bundle-Items jetzt robuster anhand von:

- `item.bundle.bundleType === "alert"`
- `item.meta.bundleType === "alert"`
- `item.meta.bundleManagedBy === "alert_system"`
- `item.visual.module === "alert_system"`
- `meta/visual.alertEventUid`
- `source === "alert_system"` / `source === "alert_tts"`

Für diese Items gilt:

- `checkCooldown(item)` liefert direkt `null`.
- `rememberCooldown(item)` schreibt sie nicht in die globale Same-Sound-Historie.

Damit werden gleiche Alert-Sounds nicht mehr durch `cooldown_same_sound` oder `dedupe_same_user_sound` verworfen.

## Zusätzlich

`backend/modules/alert_system.js` bleibt funktional unverändert, speichert aber etwas mehr Diagnose in `alertBundlePrequeue`:

- `bundleId`
- `bundleQueuedAt`
- `mainDropped`
- `mainDropReason`

## Nicht geändert

- `app.sqlite`
- `config`
- Streamer.bot-Flows
- Overlay-HTML
- VIP-Logik

## Einbau

```powershell
Copy-Item "D:\Downloads\STEP268B_ALERT_BUNDLE_DEDUPE_BYPASS_ROBUST\backend\modules\alert_system.js" "D:\Streaming\stramAssets\backend\modules\alert_system.js" -Force
Copy-Item "D:\Downloads\STEP268B_ALERT_BUNDLE_DEDUPE_BYPASS_ROBUST\backend\modules\sound_system.js" "D:\Streaming\stramAssets\backend\modules\sound_system.js" -Force
```

Danach Node neu starten.

## Test

Erst nur:

1. Alert mit TTS.
2. 1 Sekunde warten.
3. Zweiter Alert mit gleichem Alert-Sound + TTS.

Erwartung:

- Alert 1 Hauptsound
- Alert 1 TTS
- Alert 2 Hauptsound
- Alert 2 TTS
- Kein `cooldown_same_sound` bei Alert-Bundle-Items

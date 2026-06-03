# CURRENT_STATUS

## Aktueller Arbeitsstand

CAN-42.14 vorbereitet: VIP-Sound Moduldatei auf `vip-sound.js` umgestellt und `/api/vip-sound/status` auf Diagnostics-Standard erweitert.

## Ergebnis

Die bisherige Datei `backend/modules/vip_sound_overlay.js` wird durch `backend/modules/vip-sound.js` ersetzt. Die produktiven API-Prefixes bleiben unverändert bei `/api/vip-sound` und `/api/vip-sound-overlay`. Es wird kein neuer `/api/vip`-Prefix registriert.

Die bestehende Statusroute `/api/vip-sound/status` liefert zusätzlich einen standardisierten `diagnostics`-Block mit Counts, Datenbankstatus, Runtime-/State-Daten, Warnungen und Fehlern. Die zentrale Dashboard-Diagnose liest VIP nun über `/api/vip-sound/status`.

## Geändert

```text
backend/modules/vip-sound.js
htdocs/dashboard/index.html
htdocs/dashboard/modules/diagnostics_generic_details.js
htdocs/dashboard/modules/diagnostics_hug_display_fix.js
docs/current/VIP_SOUND_STATUS_DIAGNOSTICS_CAN42_14.md
docs/current/CURRENT_CHAT_HANDOFF_CAN42_14.md
project-state/*
```

## Wichtig beim Entpacken

Vor `stepdone` muss die alte Datei gelöscht werden, sonst lädt der Server beide Module:

```powershell
Remove-Item backend\modules\vip_sound_overlay.js
```

## Nicht geändert

```text
Keine VIP-/Mod-Sound-Ausführung
Keine Queue-/Overlay-/Daily-Usage-Logik
Keine Upload-/Command-/Twitch-Sync-Logik
Keine produktiven Prefixes geändert
Kein neuer /api/vip-Prefix
Keine DB-Migration
Keine Funktionalität entfernt
```

## Nächster Schritt

CAN-42.14 anwenden, alte Datei löschen, `stepdone` ausführen und `/api/vip-sound/status` testen.

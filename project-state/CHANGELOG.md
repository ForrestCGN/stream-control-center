# CHANGELOG

## CAN-42.14

VIP-Sound Status-Diagnostics vorbereitet und Moduldatei umbenannt.

Geändert:

```text
backend/modules/vip-sound.js
htdocs/dashboard/modules/diagnostics_generic_details.js
htdocs/dashboard/index.html
```

Änderungen:

```text
backend/modules/vip_sound_overlay.js wird durch backend/modules/vip-sound.js ersetzt
MODULE_META.version 0.1.0 -> 0.1.1
MODULE_META.build diagnostics-standard ergänzt
/api/vip-sound/status liefert zusätzlich module/moduleVersion/moduleBuild/diagnosticVersion/routes/routeCount/dataEndpoints/diagnostics
Dashboard-Diagnose liest VIP über /api/vip-sound/status
```

Wichtig:

```text
Die alte Datei backend/modules/vip_sound_overlay.js muss nach dem Entpacken gelöscht werden, bevor stepdone ausgeführt wird.
Es wird kein /api/vip-Prefix registriert.
```

Keine VIP-/Mod-Sound-Ausführung, keine Queue-/Overlay-/Daily-Usage-Logik, keine Upload-/Command-/Twitch-Sync-Logik, keine DB-Migration und keine Funktionalität entfernt.

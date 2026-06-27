# CAN-44.21.25 Queue-Test-Routine

## Ziel

Dieser Stand ergänzt eine Diagnose-Routine für die manuelle Clip-Shoutout-Queue. Damit muss nicht mehr per Chatbefehl, Screenshot und mehreren PowerShell-Abfragen geprüft werden, ob ein zweiter Shoutout still verschwindet.

## Geänderte Dateien

- `backend/modules/clip_shoutout.js`
- `tools/test_clip_shoutout_queue.ps1`

## Neue Route

- `GET/POST /api/clip-shoutout/debug/test-queue`

Beispiel:

```text
http://127.0.0.1:8080/api/clip-shoutout/debug/test-queue?targets=pretos1,together_not_alone&force=1&chat=0&process=0&cleanup=0&holdMs=600000
```

## Verhalten

Die Route simuliert mehrere manuelle `!so`-Requests über den echten `handleRun`-Pfad und gibt einen kompakten Bericht zurück:

- Ziel-Login
- ob der Request angenommen wurde
- ob ein Queue-Eintrag entstanden ist
- Queue-ID
- Status
- Wartezeit
- ob ein Silent-Drop erkannt wurde
- Queue-Zustand vor und nach dem Test

Standardmäßig werden Testeinträge mit `holdMs=600000` zehn Minuten in die Zukunft gesetzt, damit sie nicht sofort starten. `process=0` verhindert den direkten Start durch den Request selbst. Der normale Worker kann später trotzdem arbeiten, wenn Einträge nicht entfernt werden.

## PowerShell-Test

```powershell
.\tools\test_clip_shoutout_queue.ps1
```

Optional mit Entfernen der Testeinträge:

```powershell
.\tools\test_clip_shoutout_queue.ps1 -Cleanup
```

Optional mit echten Chatmeldungen:

```powershell
.\tools\test_clip_shoutout_queue.ps1 -Chat
```

## Nicht geändert

- Kein Player-/Overlay-Umbau
- Kein IFrame
- Kein Twitch-Embed
- Keine Cooldowns entfernt
- Kein offizieller Twitch-Shoutout-Workflow umgebaut
- Keine produktive SQLite-Datenbank ersetzt oder neu aufgebaut

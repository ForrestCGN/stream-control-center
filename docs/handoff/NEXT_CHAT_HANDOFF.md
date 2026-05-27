# NEXT CHAT HANDOFF – Channelpoints / Sound / Media

Stand: 2026-05-27

## Wichtigster aktueller Stand

Aktueller gültiger Channelpoints-Step:

```text
STEP527_CHANNELPOINTS_CREATE_SAVE_TWITCH_INACTIVE_DEFAULT_v0.9.13
```

Der vorige STEP526 hat den Startfehler behoben, STEP527 enthält zusätzlich das gewünschte neue Verhalten für neue Rewards.

## Nicht verwenden

```text
STEP524_MEDIA_ASSET_FILENAME_ENCODING_CLEANUP_v0.1.0
STEP525_CHANNELPOINTS_SAVE_ACTIVE_SYNCS_TWITCH_v0.9.11
STEP525_CHANNELPOINTS_SIMPLIFIED_TWITCH_ACTIVATION_FLOW_v0.9.11
```

STEP526 ist durch STEP527 ersetzt.

## Bedienkonzept Channelpoints

```text
Editor:
- kein Aktiv-Häkchen
- Speichern legt lokal an/ändert lokal
- Speichern erstellt/aktualisiert Twitch
- neuer Twitch-Reward standardmäßig inaktiv

Übersicht:
- Aktiv/Inaktiv-Schalter betrifft nur Twitch sichtbar/einlösbar
```

## Kritischer letzter Fehler

Beim Serverstart fehlte `channelpoints.js` in `/api/_status`, obwohl Datei existierte. Ursache im Log:

```text
[module] FAILED: channelpoints.js
deleteRewardFromTwitch is not defined
```

Nach STEP527 muss `/api/_status` `channelpoints.js` wieder in der Modulliste zeigen.

## Direkt nach Start prüfen

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/_status" | ConvertTo-Json -Depth 5
```

Dann:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/status" | ConvertTo-Json -Depth 6
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/twitch/manage/status" | ConvertTo-Json -Depth 6
```

## Bekannte Twitch-Sache

Wenn Twitch offline meldet, Reward könne nur während eines Streams eingelöst werden, `max_per_stream` prüfen. Bei `max_per_stream > 0` ist die Belohnung streamgebunden.

## Sound-System

Aktueller Standard:

```text
Channelpoints: Auto / Sound-System entscheidet
Sound-System: Device für Audio
Ziel: Stream + Discord
```

## Arbeitsregel

Vor jedem neuen Fix echte Dateien prüfen. Keine neuen ZIPs auf Basis von Annahmen. Wenn Dateien benötigt werden, konkret anfordern:

```text
Ich brauche genau diese Datei: [Pfad]
```

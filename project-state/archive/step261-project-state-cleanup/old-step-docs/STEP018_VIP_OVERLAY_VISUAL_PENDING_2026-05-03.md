# STEP018 - VIP-Overlay Sound-System-Visual angebunden, Anzeige noch offen

Stand: 2026-05-03

## Art des STEP

Zwischenstand / Handover. Sound-Backend funktioniert, VIP-Overlay zeigt trotz Anpassung noch nicht sichtbar an.

## Aktueller stabiler Stand vor diesem offenen Punkt

STEP017 ist abgeschlossen und live getestet:

- VIP-Command prueft Daily-Usage.
- VIP-Command prueft MP3-Datei unter `htdocs/assets/sounds/vip/<Anzeigename>.mp3`.
- VIP-Command sendet an `POST /api/sound/play`.
- Daily-Usage wird erst nach akzeptiertem Sound-System-Request geschrieben.
- Chat-Ausgabe laeuft ueber `helper_chat_output.js` / Heimleitungs-Bot.
- Streamer.bot soll nicht mehr selbst posten.
- Test mit `araglor`:
  - `vip/araglor.mp3` wurde abgespielt.
  - Duplicate wurde danach korrekt geblockt.

## Geaenderte Datei in STEP018

- `htdocs/overlays/vip_sound_overlay.html`

## Aktueller Stand der STEP018-Aenderung

Das VIP-Overlay hoert jetzt zusaetzlich auf den WebSocket:

- `op === "sound_system"`

Es verarbeitet inzwischen Sound-System-Item-Events analog zum Alert-Prinzip:

- `data.item`
- `payload.item`
- `data.current`

Start-Reasons im Overlay:

- `item_starting`
- `started`
- `play_stream`
- `interrupted_started`
- `next_started`
- `resumed`
- `parallel_started`
- `device_play_started`

Stop-Reasons im Overlay:

- `finished`
- `auto_finished`
- `client_audio_ended`
- `device_play_finished`
- `device_play_stopped`
- `manual_stop`
- `manual_skip`
- `stop_stream`
- `skip_stream`
- `stopped`
- `reset`

Fuer Sound-System-Visuals nutzt das Overlay:

- `visual.module === "vip_sound_overlay"`

Bei Sound-System-Visuals setzt das Overlay:

- `externalAudio: true`

Damit soll das VIP-Overlay kein eigenes Audio mehr starten. Audio kommt weiter ausschliesslich ueber Sound-System / AudioDeviceHelper.

## Aktuelles Problem

Sound wird abgespielt, aber VIP-Overlay zeigt weiterhin nichts sichtbar an.

Damit ist der naechste Diagnosepunkt nicht mehr die VIP-Command-/Sound-System-Kette, sondern:

1. Kommt das WebSocket-Event im VIP-Overlay wirklich an?
2. Enthaelt das Event wirklich `data.item.visual.module = "vip_sound_overlay"`?
3. Wird `startOverlay(overlay)` im Browser ausgefuehrt?
4. Ist die OBS-Browserquelle wirklich die aktuelle Datei / richtige URL?
5. Ist die Quelle sichtbar, nicht verdeckt und nicht ausserhalb des Bildes?
6. Wird die Quelle aus Cache geladen?

## Wichtiger Vergleich mit Alert-System

Alert-Overlay reagiert auf:

- WebSocket `op === "sound_system"`
- `reason === "item_starting"`
- `data.item`
- `item.visual.module === "alert_system"`

VIP wurde deshalb auf `data.item`/`item_starting` erweitert.

## Nicht eingebaut

- Kein dauerhaftes 250-ms-Polling auf `/api/sound/status` eingebaut.
- Grund: Alert-System arbeitet ebenfalls primaer ueber WebSocket/`item_starting`.
- Polling bleibt als moeglicher Fallback, aber erst nach gezielter Diagnose.

## Naechster sinnvoller Schritt morgen

1. Sicherstellen, dass Repo und Live identisch sind:

```powershell
cd D:\Git\stream-control-center

git status --short
git log --oneline -10

$repo = "D:\Git\stream-control-center\htdocs\overlays\vip_sound_overlay.html"
$live = "D:\Streaming\stramAssets\htdocs\overlays\vip_sound_overlay.html"
[PSCustomObject]@{
  Same = ((Get-FileHash $repo -Algorithm SHA256).Hash -eq (Get-FileHash $live -Algorithm SHA256).Hash)
  RepoHash = (Get-FileHash $repo -Algorithm SHA256).Hash
  LiveHash = (Get-FileHash $live -Algorithm SHA256).Hash
}
```

2. Live-Datei pruefen:

```powershell
Select-String -Path "D:\Streaming\stramAssets\htdocs\overlays\vip_sound_overlay.html" -Pattern "item_starting|data.item|device_play_started|handleSoundSystemMessage|externalAudio"
```

3. OBS-Browserquelle pruefen:

- richtige URL?
- Quelle sichtbar?
- Quelle in aktiver Szene?
- Browserquelle refreshen/cache leeren?
- liegt Quelle oberhalb anderer Elemente?

4. Wenn OBS-Quelle korrekt ist: temporaeres Debug im Overlay ergaenzen:

- sichtbarer kleiner Debug-Text oben links oder `console.log`-freie DOM-Debuganzeige.
- Anzeigen, ob WebSocket verbunden ist.
- Anzeigen, welches letzte `sound_system`-Event kam.
- Anzeigen, ob `isVipVisual(item)` true/false ist.
- Anzeigen, ob `startOverlay()` aufgerufen wurde.

## Wichtig

Keine Funktionalitaet entfernen. Sound-System bleibt alleiniger Besitzer von Prioritaet, Queue und Audio-Start. VIP-Overlay darf kein zweites Audio starten.

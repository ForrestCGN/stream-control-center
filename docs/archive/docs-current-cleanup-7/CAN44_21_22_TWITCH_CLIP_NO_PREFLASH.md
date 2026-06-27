# CAN-44.21.22 Twitch Clip No Preflash

## Ziel

Der Twitch-Clip-Shoutout lief nach CAN-44.21.21 grundsätzlich korrekt direkt im Sound-System-Overlay, aber vor dem eigentlichen Clip wurde kurz der leere/initiale Player eingeblendet.

CAN-44.21.22 behebt diesen Start-Flicker.

## Geänderte Datei

- `htdocs/overlays/sound_system_overlay.html`

## Änderung

- `twitch_clip` bereitet die ClipCard nur noch intern vor und blendet sie zunächst nicht ein.
- Twitch-GQL/MP4-Auflösung läuft im Hintergrund.
- Das Video wird gesetzt, geladen und bis `canplay`/`loadeddata` vorbereitet.
- Erst nach erfolgreichem Start wird die ClipCard eingeblendet.
- Kein IFrame.
- Kein offizieller Twitch-Embed als Standard.
- Keine Queue-, Backend- oder OBS-Steuerungsänderung.

## Erwartetes Verhalten

`!vso @user --force` zeigt den Clip erst dann im Overlay, wenn das Video bereit ist. Der kurze leere Player/Preflash am Anfang sollte verschwinden.

## Test

```powershell
node -c backend\modules\sound_system.js
```

Für die HTML-Datei wurde der Script-Block separat mit `node --check` geprüft.

## Nach dem Entpacken

```powershell
.\stepdone.cmd "CAN-44.21.22 Twitch Clip No Preflash"
```

Danach OBS-Browserquelle bzw. Node/Overlay wie üblich neu laden und testen:

```text
!vso @pretos1 --force
```

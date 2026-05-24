# CURRENT_SYSTEM_STATUS – STEP277A_FIX7

Clip-Shoutout ist aktuell auf Direct Playback umgestellt.

## Stand
- Modul: `clip_shoutout`
- Statusversion: `6`
- Step: `STEP277A_FIX7`
- Command: `!vso`
- Aliase: `!clipso`, `!videoso`

## Ablauf
1. Zielkanal wird aus Chat/API korrekt geparst.
2. Twitch-Userdaten inkl. Avatar werden aufgelöst.
3. Clips werden über Helix gesucht.
4. Aus den passenden Clips wird zufällig gewählt.
5. Die Twitch-Playback-URL wird direkt an das Sound-System übergeben.
6. Das Sound-System spielt das Video über das bestehende Overlay ab.

## Wichtig
Im Standardmodus werden neue Clip-MP4s nicht mehr dauerhaft unter `htdocs/assets/sounds/clip_shoutout` gespeichert. Der alte Downloadpfad bleibt als optionaler Fallback im Code erhalten.

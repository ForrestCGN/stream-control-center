# CHANGELOG

## STEP462_SHOUTOUT_DIRECT_CHAT_COMMAND_BYPASS_FIX

- `backend/modules/clip_shoutout.js` auf Runtime-Version `0.2.5` erhöht.
- Direkten Chat-Command-Wrapper für Clip-Shoutout-Trigger ergänzt.
- `!vso` wird im Testbetrieb direkt an den Clip-Shoutout-Modulablauf übergeben.
- Command-System-Cooldowns können den zweiten `!vso` dadurch nicht mehr verschlucken.
- Display-Queue bleibt allein zuständig für 2-Minuten-Abstand.

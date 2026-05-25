# CHANGELOG

## STEP463_SHOUTOUT_CHAT_MESSAGE_CLEANUP_TEST_MODE

- `backend/modules/clip_shoutout.js` auf Runtime-Version `0.2.6` erhöht.
- Direkten Chat-Command-Wrapper für Clip-Shoutout-Trigger ergänzt.
- `!vso` wird im Testbetrieb direkt an den Clip-Shoutout-Modulablauf übergeben.
- Command-System-Cooldowns können den zweiten `!vso` dadurch nicht mehr verschlucken.
- Display-Queue bleibt allein zuständig für 2-Minuten-Abstand.

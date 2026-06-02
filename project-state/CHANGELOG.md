# CHANGELOG

## CAN-24.11

- Channelpoints Sound-Migration-Payload ergaenzt `mediaId` und `mediaAssetId`.
- Sound-Bus-DryRun akzeptiert jetzt `mediaId`/`mediaAssetId` als Alternative zu Sound-Preset-`soundId`.
- DryRun nutzt Sound-Preset-Weg nur, wenn `soundId` als Preset existiert.
- Andernfalls wird bei vorhandener Media-ID der Media-Registry-Weg verwendet.
- Kein Sound-Play.
- Keine Queue.
- Keine produktive Migration.

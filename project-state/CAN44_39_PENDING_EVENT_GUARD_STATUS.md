# CAN44.39 Pending Event Guard Status

Status: bereit zum Test

## Änderung
`twitch_events` schützt `twitch.stream.offline` vor falscher Veröffentlichung bei `pending`, `reconnect`, `ending`, `closed`, `offline` und `bandwidth_test`, solange vorher kein echter Online-Event veröffentlicht wurde.

## Versionen
- twitch_events: 0.1.11

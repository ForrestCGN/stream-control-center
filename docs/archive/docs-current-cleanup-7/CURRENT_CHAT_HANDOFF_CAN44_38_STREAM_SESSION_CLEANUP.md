# Current Chat Handoff – CAN44.38 Stream Session Cleanup

## Kontext
CAN44.37 führte die Stream Session Authority ein. Beim Test wurde korrekt verhindert, dass Bandbreitentest als echter Stream zählt. Dabei fielen zwei Diagnose-Unsauberkeiten auf:

1. Bandbreitentest löste ein `twitch.stream.offline` aus, obwohl vorher kein echter Online-State aktiv war.
2. Nach `clear-override` blieben in `streamSession` noch `closedReason = bandwidth_test` und `bandwidthTest = true` sichtbar.

## CAN44.38 Änderung
- `backend/modules/twitch_events.js`
- Version `0.1.10`
- Build `CAN44.38_STREAM_SESSION_CLEANUP`

## Ergebnis
- Bandbreitentest bleibt `live=false`, `status=bandwidth_test`, ohne echte Session.
- Bandbreitentest published kein Offline-Event mehr, wenn vorher offline war.
- Clear Override räumt Bandbreitentest-Reste aus State/Session auf.
- Neuer Counter `bandwidthTestDetected`.

## Danach testen
1. `node -c backend/modules/twitch_events.js`
2. Bandbreitentest-Override setzen.
3. Prüfen, dass kein neuer Offline-Event entsteht, wenn vorher offline war.
4. Override löschen.
5. Prüfen, dass `streamSession.bandwidthTest=false` und `closedReason=""` ist.

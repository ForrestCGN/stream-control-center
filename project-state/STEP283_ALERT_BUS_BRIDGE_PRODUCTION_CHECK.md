# STEP283 – Alert Bus Bridge Production Check

## Ergebnis
Die Alert-Bus-Bridge wurde für den produktionsnahen OBS-Test erweitert.

## Änderungen
- `_overlay-alerts-v2-bus.html` Version 0.1.1
- Bridge-Modus per Query: `mode=bridge`, `mode=bus-first`, `mode=bus-only`, `mode=legacy-only`
- Debugpanel zeigt Modus, Bus-Primary und Legacy-Fallback
- Bus-Hello-Metadaten enthalten Bridge-Modus
- Communication Debug View Version 0.1.9
- Normalbetrieb erkennt die Alert-Bus-Bridge
- Normalbetrieb warnt, wenn alte Alert-Quelle zusätzlich parallel verbunden ist

## Nicht geändert
- Keine Sound-System-Änderung
- Keine TTS-Änderung
- Keine Alert-Queue-Änderung
- Kein Umbau am bestehenden `_overlay-alerts-v2.html`
- Keine DB-Migration

## Test-URL
`http://127.0.0.1:8080/overlays/_overlay-alerts-v2-bus.html?debug=1&mode=bridge`

## OBS-Hinweis
Für den echten Migrationstest sollte die alte Alert-Quelle ausgeblendet und die neue Bridge als sichtbare Quelle verwendet werden. Der Legacy-WebSocket bleibt in der Bridge aktiv, damit das Alert-System weiterhin `finished` erhält.

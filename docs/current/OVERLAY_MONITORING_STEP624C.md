# Overlay-Monitor – STEP624C

STEP624C trennt lokale CGN-Overlays von externen Browserquellen.

Lokale Quellen (`localhost`, `127.0.0.1`, `/overlays/...` oder lokale Datei) erwarten weiterhin einen CGN-EventBus-Client und Heartbeats.

Externe Quellen (`soundalerts.com`, `streamstickers.com`, `viewerattack.com` usw.) erwarten keinen CGN-Heartbeat. Sie werden nur über OBS-Sichtbarkeit bewertet und nicht als Bus-Problem gezählt.

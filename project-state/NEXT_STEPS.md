# NEXT STEPS

- STEP274C live testen:
  - `/api/commands/media-bridge/status`
  - `/api/commands/media-options?type=audio&status=active`
  - `/api/commands/media-options?type=video,animation&status=active`
- Dashboard öffnen: `http://127.0.0.1:8080/dashboard`
- Commands → Commands → Action-Typ `MP3 / Sound abspielen` prüfen: Medien-Dropdown muss Audio-Medien anzeigen.
- Commands → Commands → Action-Typ `Video abspielen` prüfen: Medien-Dropdown muss Video/Animation anzeigen.
- Einen Test-Command speichern und prüfen, ob `config.mediaId` erhalten bleibt.
- Danach STEP274D planen: tatsächliche Medienausführung über Sound-System/Overlay sauber anbinden.

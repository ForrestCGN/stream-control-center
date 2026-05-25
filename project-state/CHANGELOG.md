# CHANGELOG – STEP452

## Added
- VIP-Sound als Kategorie im bestehenden Command-Catalog ergänzt.
- Default-Seed für `vip` ergänzt:
  - trigger: `vip`
  - alias: `vipsound`
  - moduleKey: `vip_sound_overlay`
  - targetUrl: `/api/vip-sound/command`
  - targetMethod: `POST`
  - permissionLevel: `everyone`

## Confirmed
- `!vip` läuft nicht mehr über Streamer.bot.
- Produktiver VIP-Sound-Flow läuft über den Sound-Bus.
- Legacy ist nur noch `fallback_only`.
- Produktiver Bus-Test erfolgreich mit `vip/adoredpenny.mp3`.

## Not changed
- Keine DB-Migration.
- Keine neue Bus-Route.
- Kein neuer Admin-Testpfad.
- Kein Dashboard-Umbau.
- Kein Entfernen bestehender Funktionalität.

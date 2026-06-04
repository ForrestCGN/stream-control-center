# Next Steps

## Sofort beim nächsten Chat

1. `docs/current/CURRENT_CHAT_HANDOFF_CAN44_21_SHOUTOUT_PLAYBACK.md` lesen.
2. Master-Prompt beachten: keine Apply-/Patch-Scripte, nur vollständige Ersatzdateien mit echten Zielpfaden.
3. Für CAN-44.21.16 zuerst echte Dateien prüfen.

## CAN-44.21.16 Planung

Ziel: Clip Player Overlay Fallback innerhalb der bestehenden Queue/Sound-Queue.

Vor Code prüfen:

- Wie konsumiert das Sound-/Overlay-System `mediaUrl` und `videoUrl`?
- Kann es HTML-/Browser-Embed-URLs anzeigen?
- Falls nein: Wo muss ein sauberer `browser_embed`/`clip_player_overlay` Item-Modus ergänzt werden?

Voraussichtlich relevante Dateien:

- `backend/modules/clip_shoutout.js`
- Sound-/Bundle-Modul, das `/api/sound/bundle` verarbeitet
- Overlay-Datei(en), die Sound-/Bundle-Items anzeigen
- `htdocs/overlays/_overlay-clip_player.html`

## Geplanter technischer Flow

```text
Display-Queue bleibt aktiv
→ direct playback probieren
→ wenn alle direct playback Kandidaten scheitern
→ lokalen Clip-Player-Overlay-Fallback verwenden
→ weiterhin über buildBundlePayload / Sound-Bundle / Sound-Queue laufen
→ danach Official Twitch Shoutout
```

## Nicht tun

- Kein Streamer.bot-Wait zurückbringen.
- Kein direktes OBS-Show/Hide als Ersatz für Queue.
- Keine Sound-Queue umgehen.
- Keine DB-Migration ohne separate Planung.
- Keine Funktionalität entfernen.

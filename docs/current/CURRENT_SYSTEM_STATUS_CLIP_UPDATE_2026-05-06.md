# CURRENT SYSTEM STATUS - Clip-System Update

Stand: 2026-05-06

## Clip-System

Der Backend-Clip-Flow ist erfolgreich getestet:

- Twitch-Clip erstellt
- Twitch-Titel per Backend gesetzt
- Twitch-Duration per Backend übergeben
- Chat über `twitch_presence`
- Texte über `module_text_variants` / `helper_texts`
- Discord-Post
- OBS Replay Save
- Replay-Datei per Prefix `Replay ` erkannt
- Lokales Rename
- SQLite-History

Letzter Titel-Test:
- Eingabe: `BackendTitelTest`
- Sichtbarer Twitch-Titel: `BackendTitelTest | Supermarket Together`

## Streamer.bot Zielzustand

Streamer.bot soll nur noch `/api/clip/create` triggern:

```text
http://127.0.0.1:8080/api/clip/create?input=%rawInput%&triggerUser=%user%&triggerLogin=%userName%
```

Keine Chattexte, kein Create Clip, kein OBS Save, kein Rename mehr in Streamer.bot.

## Message-Rotator

Autopost-System:
- Modul: `backend/modules/message_rotator.js`
- Config: `config/message_rotator.json`
- Status: `/api/message-rotator/status`
- Manuell nächster Post: `/api/message-rotator/next`

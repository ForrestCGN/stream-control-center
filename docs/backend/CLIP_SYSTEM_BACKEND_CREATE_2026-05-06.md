# Backend Doku - Clip-System Backend-Create

Stand: 2026-05-06

## Route

```text
GET/POST /api/clip/create
```

## Parameter

```text
input
triggerUser
triggerLogin
```

## Ablauf

1. Clip-Titel bauen.
2. Twitch Clip mit `title` und `duration` erstellen.
3. Startmeldung über `twitch_presence` senden.
4. History initial schreiben.
5. Async Backend-Job:
   - Twitch Clip pollen
   - Discord posten
   - OBS Replay Save auslösen
   - Replay-Datei mit Prefix `Replay ` suchen
   - lokale Datei umbenennen
   - History aktualisieren
   - Ergebnis-Chatmeldung senden

## Titel-Logik

```text
!clip
→ Streamtitel

!clip eigener text
→ eigener text | Game
```

## Replay-Dateien

Nur Dateien mit Prefix werden genommen:

```text
Replay 2026-05-06 19-02-19.mp4
```

Normale OBS-Aufnahmen werden ignoriert:

```text
2026-05-06 18-14-05.mp4
```

## Chat-Texte

Quelle:
- `module_text_variants`
- `helper_texts`

Versand:
- `twitch_presence.sendChatMessage()`

## Wichtig

Der frühere Live-Guard über `channelInfo.is_live` wurde entfernt, weil Twitch Helix `/streams` im Live-Test fälschlich offline meldete.

Wenn Twitch wirklich offline ist, entscheidet Twitch Create Clip selbst und der Flow schreibt `failed`.

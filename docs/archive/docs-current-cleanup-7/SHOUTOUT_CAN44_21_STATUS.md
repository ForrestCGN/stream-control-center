# Shoutout-System – CAN-44.21 Statusnotiz

Stand: 2026-06-04 Abend

## Stabil / bestätigt

- Shoutout-Modul läuft nach CAN-44.21.15 mit `moduleVersion = 0.2.27`.
- DB-Textvarianten sind aktiv und wurden im Chat sichtbar genutzt.
- Display-Queue/Worker laufen grundsätzlich.
- Official Twitch Shoutouts wurden in der History/EventSub mehrfach als `sent` sichtbar.
- Clip-Suche findet bei Testkanälen Clips.

## Problem

Video-/Clip-Shoutout scheitert bei bestimmten Clips/Kanälen nicht wegen fehlender Clips, sondern wegen direkter Twitch-GQL-Playback-Auflösung.

Aktueller Fehler:

```text
clip_playback_failed_all_candidates
```

Vorheriger Fehler:

```text
clip_playback_missing
```

## Betroffene Testkanäle

- `pretos1`
- `together_not_alone`

## Diagnose

`pretos1`:

- 1 Clip gefunden
- Clip länger als 30 Sekunden, aber innerhalb Fallback-Limit
- Fehler passiert erst beim Playback

`together_not_alone`:

- 8 Clips gefunden
- mehrere Clips mit gültiger Dauer
- Fehler passiert trotzdem beim Playback

## Schlussfolgerung

Mehr Zeitraum allein löst das Problem nicht vollständig. Der direkte Playback-Weg ist zu empfindlich.

## Nächster sinnvoller Fix

CAN-44.21.16:

- Bestehende Queue/Sound-Queue beibehalten
- Direct Playback als ersten Versuch behalten
- Wenn direct Playback für alle Kandidaten scheitert:
  - lokalen `_overlay-clip_player.html?clipId=...&user=...` als Fallback nutzen
- Vorher prüfen, ob Sound-/Overlay-Bundle HTML-/Browser-URLs unterstützt oder ob ein `browser_embed`-Item-Modus ergänzt werden muss.

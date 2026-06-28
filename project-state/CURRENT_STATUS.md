# Current Status

Stand: 2026-06-28

Aktueller vorbereiteter Stand dieses Steps:

```text
0.2.14B - OBS read-only UI Label-Fix
```

## Ergebnis

0.2.14B korrigiert den sichtbaren UI-Fehler aus 0.2.14:

```text
page.system.obs.label / page.system.obs.title sollen nicht mehr als Rohkeys angezeigt werden.
```

OBS bleibt sichtbar und read-only.

## Nicht geaendert

- keine grosse Navigation neu gebaut,
- OBS bleibt aktuell am bestehenden Platz,
- keine DB-Migration,
- keine produktiven Writes,
- keine Agent-Actions,
- keine OBS-WebSocket-Kommandos durch den lokalen Adapter,
- kein Szenenwechsel,
- kein Mute/Unmute,
- keine Media-Steuerung,
- keine Shell-/Datei-/Prozess-Actions.

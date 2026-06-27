# TODO – Sound-System Dashboard-Konfiguration

Stand: 2026-06-16

Diese Punkte müssen später in die zentrale Dashboard-/Config-Verwaltung des Sound-Systems übernommen werden.

## SOUND-GAP / Post-Playback-Pause
Aktuell in SOUND-GAP-1 intern vorbereitet:
- Standard: `postPlaybackGapMs = 2000`
- nach jedem Sound bleibt das Sound-System kurz blockiert/reserviert
- EventSound-Overlay bleibt während dieser Zeit sichtbar und blendet erst danach aus

Später dashboardfähig machen:
- Sound-System Einstellung: „Pause zwischen Sounds“
- Wert in Millisekunden oder Sekunden, streamerfreundlich als z. B. `0s`, `1s`, `2s`, `3s`, `5s`
- Standard: `2s`
- Tooltip: „Verhindert, dass Sounds/Alerts direkt ohne kurze Pause ineinander laufen.“
- Option: EventSound-Overlay während dieser Pause sichtbar halten: ja/nein
- Audit/Log bei Änderung
- Speicherung über vorhandenes DB-/Config-Pattern, keine Parallelstruktur

## Nicht vergessen
Diese Einstellung gehört später ins Dashboard, nicht dauerhaft nur hart/intern im Code.

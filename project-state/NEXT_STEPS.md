# NEXT_STEPS – stream_events / Event-System

Stand: 2026-06-13 nach EVS-23b

## Aktuelle Lage

EVS-23 ist im Dashboard sichtbar bestätigt:

- `Event-System → Sicherheit`
- Bereich `Live-Schalter Konzept`
- Status `gesperrt`
- Hinweis `EVS-23 bleibt Testmodus`
- keine Live-Aktion ausführbar

## Danach mögliche Arbeitsblöcke

### Option A – EVS-24 Rollen-/Audit-/Live-Config Prep

Ziel:

- echten Config-Endpoint für spätere Live-Schalter vorbereiten,
- Rollen-/Rechteprüfung vorbereiten,
- Audit-Log vorbereiten,
- Status weiterhin nur vorbereitet/gesperrt,
- noch kein echtes Senden aktivieren.

Empfohlen, bevor irgendwann wirklich Live gesendet wird.

### Option B – EVS-24 ChatOutput Dry-Run Erweiterung

Ziel:

- einzelne ChatOutputs im Dashboard detaillierter prüfen,
- mögliche Bündelung/Spam-Schutz anzeigen,
- Rate-Limit- und Cooldown-Regeln planen,
- Vorschau für spätere Live-Ausgabe verständlicher machen,
- weiterhin kein echtes Senden.

## Harte Grenzen

- Keine Twitch-Ausgabe ohne späteren expliziten Go.
- Kein Sound-Playback ohne späteren expliziten Go.
- Keine Sound-System-Queue-Berührung.
- Kein Aktivieren eines echten Live-Schalters ohne erneute Entscheidung.

# NEXT_STEPS – stream_events / Event-System

Stand: 2026-06-13 nach EVS-23

## Sofortiger Test

### EVS-23 prüfen

- Syntaxcheck ausführen.
- StepDone ausführen.
- `/api/stream-events/status` auf Version `0.5.17` prüfen.
- Dashboard öffnen: `Event-System → Sicherheit`.
- Bereich `Live-Schalter Konzept` prüfen.

## Danach mögliche Arbeitsblöcke

### Option A – EVS-24 Rollen-/Audit-/Live-Config Prep

Ziel:

- echten Config-Endpoint für spätere Live-Schalter planen,
- Rollen-/Rechteprüfung vorbereiten,
- Audit-Log vorbereiten,
- noch kein echtes Senden aktivieren.

### Option B – EVS-24 ChatOutput Dry-Run Erweiterung

Ziel:

- einzelne ChatOutputs im Dashboard detaillierter prüfen,
- mögliche Bündelung/Spam-Schutz anzeigen,
- Rate-Limit- und Cooldown-Regeln planen,
- weiterhin kein echtes Senden.

## Harte Grenzen

- Keine Twitch-Ausgabe ohne späteren expliziten Go.
- Kein Sound-Playback ohne späteren expliziten Go.
- Keine Sound-System-Queue-Berührung.
- Kein Aktivieren eines echten Live-Schalters ohne erneute Entscheidung.

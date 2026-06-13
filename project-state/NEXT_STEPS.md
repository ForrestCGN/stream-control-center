# NEXT_STEPS – stream_events / Event-System

Stand: 2026-06-13 nach EVS-22

## Aktueller nächster Test

### EVS-22 Dashboard Safety View prüfen

```powershell
node -c .\backend\modules\stream_events.js
node -c .\htdocs\dashboard\modules\stream_events.js
.\stepdone.cmd "EVS-22 Dashboard Safety View"
```

Danach im Dashboard:

```text
Event-System → Sicherheit
```

Prüfen:

- Status zeigt TESTMODUS, solange nichts live sendet.
- wouldSend bleibt 0.
- Blockiergründe werden verständlich angezeigt.
- Archivieren ist nur bei Beendet aktiv.
- Löschen fragt DELETE ab.

## Danach sinnvoll

### EVS-23 – Live-Schalter-Konzept Dashboard Prep

Ziel:

- Konfigurierbare Live-Schalter sichtbar machen.
- Noch kein echtes Senden.
- Warnstatus und Rollen-/Audit-Konzept vorbereiten.

### EVS-24 – ChatOutput Dispatch Dry-Run Erweiterung

Ziel:

- Einzelnen Output im Dashboard prüfen.
- Gebündelte ChatOutput-Vorschau vorbereiten.
- Spam-/Rate-Limit-Regeln planen.

# Changelog

## 2026-05-09

### STEP203.3.2 - Loyalty Stream-State Table Safety-Net

- Safety-Net für fehlende Tabelle `loyalty_stream_state` ergänzt.
- `ensureStreamStateRow()` führt jetzt `CREATE TABLE IF NOT EXISTS loyalty_stream_state` aus.
- Behebt Fehler:
  - `no such table: loyalty_stream_state`
- Keine Datenänderung.
- Keine Funktionalität entfernt.

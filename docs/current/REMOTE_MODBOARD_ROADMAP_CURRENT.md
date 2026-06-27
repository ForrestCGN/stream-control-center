# Remote-Modboard Roadmap – aktuell nach RDAP121

## Erledigt

- RDAP119: Streaming-PC-Verbindung Client MVP.
- RDAP120: Verbindung sichtbar und verständlich im Dashboard.
- RDAP121: Komponentenstatus read-only über Heartbeat sichtbar.

## Nächster sinnvoller Schritt

`RDAP122_FIRST_SAFE_MODULE_ACTION_PLAN`

Ziel:
- erste echte Modul-Anbindung auswählen
- nur feste Allowlist-Aktion
- keine freie Shell
- keine freien Dateipfade
- Permission + Confirm + Audit + Lock/Readback planen, bevor produktive Steuerung gebaut wird

Mögliche erste sichere Richtung:
- Status erweitern: OBS verbunden ja/nein wirklich auslesen
- danach Sound-/Media-Status lesen
- erst später Aktionen

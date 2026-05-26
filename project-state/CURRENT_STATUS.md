# CURRENT_STATUS

## STEP470 aktiv

Shoutout-Dashboard wurde um read-only Statistiken erweitert.

- `backend/modules/clip_shoutout.js` steht auf Runtime-Version `0.2.10`.
- Neue Routen:
  - `GET /api/clip-shoutout/stats`
  - `GET /api/clip-shoutout/stats/user`
- Dashboard-Modul `Community -> Shoutout-System` zeigt jetzt:
  - Gesamtstatistik
  - Zielkanal-Statistik
  - Auslöser-Statistik
  - Wer-zu-Wen-Statistik
  - Einzelansicht per Dropdown für Zielkanal und Auslöser
- Statistik ist read-only und nutzt vorhandene Queue-/History-Tabellen.

## Weiterhin aktiv

- `stream_status` steht auf Runtime-Version `0.1.2`.
- Twitch-API ist Primärquelle für den zentralen Live-Status.
- Auto-Refresh läuft standardmäßig alle 60 Sekunden, bei live/grace alle 30 Sekunden.
- `clip_shoutout` nutzt den zentralen Stream-Status für Official-Live-Gate und Streamtag-Logik.

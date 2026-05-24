# Current System Status

## STEP277A_FIX9
Clip-Shoutout Direct Playback ist aktiv und speichert Clips nicht mehr dauerhaft als MP4. Zusätzlich wurde ein In-Memory Repeat Guard ergänzt: pro Zielkanal werden die zuletzt gespielten Clips gemerkt, damit zufällige Wiederholungen vermieden werden, solange genug Alternativen vorhanden sind.

Statusprüfung:
- `/api/clip-shoutout/status` → `version: 8`, `step: STEP277A_FIX9`

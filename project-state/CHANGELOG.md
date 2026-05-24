# CHANGELOG

## STEP303 – Sound Dashboard Bus-Monitor Auto Refresh – 2026-05-24

- Dashboard-Modul `htdocs/dashboard/modules/sound.js` angepasst.
- Bus-Monitor aktualisiert sich automatisch alle 5 Sekunden, solange der Tab aktiv ist.
- Auto-Refresh nutzt ausschließlich `GET /api/sound/status`.
- Manuelles `Status neu laden` bleibt rein lesend.
- Keine Backend-Logik geändert.
- Keine Sound-/Queue-/Bundle-/SoundBus-Logik geändert.

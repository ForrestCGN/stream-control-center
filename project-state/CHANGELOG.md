# CHANGELOG

## STEP302 – Sound Dashboard Bus-Monitor Readonly Refresh Fix – 2026-05-24

- Button **Status neu laden** im Dashboard-Tab **SoundBus Monitoring** von steuernder Reload-Action getrennt.
- Neue Action `refresh-status` ergänzt.
- Neue Funktion `refreshStatusOnly()` ergänzt.
- Bus-Monitor ruft für Statusaktualisierung nur noch `GET /api/sound/status` auf.
- Globaler Sound-System-Button **Neu laden** bleibt unverändert.
- Keine Backend-Änderung.
- Keine Sound-/Queue-/Bundle-/SoundBus-Logik geändert.

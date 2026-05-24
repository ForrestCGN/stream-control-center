# CHANGELOG

## STEP310 – SoundBus Consumer Integration Block – 2026-05-24

- `backend/modules/sound_system.js` erweitert.
- `MODULE_STEP` auf 310 gesetzt.
- SoundBus-Events erhalten normalisierten `payload.context`.
- `soundBus.recentEvents` als kleiner Runtime-Cache ergänzt.
- `publicSoundSummary()` so angepasst, dass Recent-Events nicht rekursiv in Bus-Payloads eingebettet werden.
- Dashboard Bus-Monitor erweitert.
- Quellen-Zusammenfassung im Bus-Monitor ergänzt.
- Liste der letzten SoundBus-Events im Bus-Monitor ergänzt.
- Keine Queue-/Bundle-/Playback-/Discord-/Alert-Logik verändert.

## STEP298 – SoundBus Consumer-/Dashboard-Planung – 2026-05-24

- SoundBus Consumer-Klassen dokumentiert.
- Dashboard-Zielbild für SoundBus Monitoring beschrieben.
- Regeln für Debug Views, Dashboard, Overlay-Consumer und Modul-Consumer festgelegt.
- Festgelegt: SoundBus bleibt im Dev-/Testbetrieb aktiv.
- Festgelegt: keine Bus-only-Produktivmigration in diesem Schritt.
- Keine Codeänderung.

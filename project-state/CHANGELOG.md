# CHANGELOG

## STEP300 – Sound Dashboard Monitoring Test bestätigt – 2026-05-24

- Dashboard-Tab `SoundBus Monitoring` live getestet.
- SoundBus-Status wird korrekt angezeigt.
- Communication-Bus-Verfügbarkeit wird korrekt angezeigt.
- Queue-, Current-Sound-, Current-Bundle- und Active-Bundle-Lock-Status werden korrekt angezeigt.
- Sound-/Device-/Discord-Fehler werden angezeigt und standen im Test auf 0.
- Dashboard-Monitor bleibt rein lesend.
- Keine Codeänderung in diesem Schritt.

## STEP299 – Sound Dashboard Monitoring Modul – 2026-05-24

- Rein lesender Bus-Monitor im bestehenden Sound-System Dashboard-Modul ergänzt.
- Anzeige basiert auf `/api/sound/status`.
- Link zur SoundBus Debug View ergänzt.
- Keine Backend-, SoundBus-, Queue- oder Bundle-Logik geändert.

## STEP298 – SoundBus Consumer-/Dashboard-Planung – 2026-05-24

- SoundBus Consumer-Klassen dokumentiert.
- Dashboard-Zielbild für SoundBus Monitoring beschrieben.
- Regeln für Debug Views, Dashboard, Overlay-Consumer und Modul-Consumer festgelegt.
- Festgelegt: SoundBus bleibt im Dev-/Testbetrieb aktiv.
- Festgelegt: keine Bus-only-Produktivmigration in diesem Schritt.
- Keine Codeänderung.

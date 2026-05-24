# STEP281 – Normalbetrieb / Live-Check in der Communication Debug View

## Ziel

Nach dem abgeschlossenen Kommunikations-Audit soll die Debug View nicht nur Rohdaten anzeigen, sondern auch schnell bewerten, ob das Alert-/Overlay-System im Normalbetrieb sauber aussieht.

## Ergebnis

Die Communication Debug View wurde auf Version 0.1.7 erhöht und um einen Bereich `Normalbetrieb / Live-Check` ergänzt.

Der Bereich prüft:

- Communication Bus aktiv.
- Echtes Alert-Overlay verbunden.
- Overlay-Watchdog ohne offene Issues.
- Alert-Queue frei.
- Bus ohne Fehler/Drops.
- Real Alert Mirror im Normalbetrieb ausgeschaltet.

## Wichtige Hinweise

- Der Mirror darf für Tests aktiv sein.
- Für den normalen Betrieb soll der Mirror wieder deaktiviert werden.
- Bei einem echten Fehler zuerst Snapshot erzeugen, danach Recovery/Clear/OBS-Reload.

## Technisch

- Kein neues Modul.
- Keine DB-Migration.
- Keine Änderung an Alert-, Sound-, TTS- oder Queue-Logik.
- Die Debug View liest zusätzlich `/api/alerts/queue` im Auto-Refresh.

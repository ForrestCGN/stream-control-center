# STEP276H_FIX3 — Alert Graphic Fallback Card Style

## Ziel

Die Kachel „Alte Grafik / Fallback“ soll optisch wie die benachbarten Dashboard-Kacheln aussehen.

## Änderung

- Die alten Grafik-Fallback-Bereiche wurden von verschachtelten `details`-Boxen auf einfache Label/Select-Kacheln umgestellt.
- Betroffen sind die Design-Grafik-Auswahl und die Regel-Grafik-Fallback-Auswahl.
- Keine Speicherlogik geändert.
- Keine Backend-Änderung.

## Tests

- `node --check htdocs/dashboard/modules/alerts.js` OK
- Keine bestehenden Funktionen entfernt.

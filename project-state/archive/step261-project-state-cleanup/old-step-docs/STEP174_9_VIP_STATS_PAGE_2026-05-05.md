# STEP174.9 VIP-Statistikseite

Stand: 2026-05-05

## Ziel

VIP-Statistikseite im Dashboard ergänzen, ohne Backend-Route oder Datenbank zu verändern.

## Geänderte Dateien

- `htdocs/dashboard/modules/vip.js`
- `htdocs/dashboard/modules/vip.css`

## Änderung

- Neuer Tab `Statistik` im VIP-Dashboard.
- Statistikseite nutzt vorhandene Responses aus:
  - `GET /api/vip-sound/stats`
  - `GET /api/vip-sound/events/recent`
  - `GET /api/vip-sound/daily-usage/today`
  - `GET /api/vip-sound/sounds/users`
- Anzeige ergänzt für:
  - Events gesamt
  - akzeptierte Events
  - abgelehnte/fehlerhafte Events
  - heutige Daily-Usage
  - Sound-Queue-Status aus Eventdaten
  - Sounds vorhanden/fehlend
  - Top User
  - Sound-Typen
  - Sounddatei-Statistik inklusive Durchschnitt und längstem Sound
  - letzte Auslösungen
  - abgelehnte Events / Handlungsbedarf
  - User ohne Sound
  - letzte Nutzung pro User aus geladenen Recent-Events

## Bewusst nicht geändert

- Keine Backend-Routen geändert.
- Keine Datenbank geändert.
- Keine neue Tabelle erstellt.
- Keine bestehende Funktionalität entfernt.
- 7-/30-Tage-Statistiken wurden noch nicht hart eingebaut, weil die vorhandene Route aktuell keine aggregierten Zeitfenster liefert. Das sollte später sauber im Backend ergänzt werden.

## Tests

Vor Commit lokal ausführen:

```powershell
cd D:\Git\stream-control-center
node -c .\htdocs\dashboard\modules\vip.js
Select-String -Path .\htdocs\dashboard\modules\vip.js,.\htdocs\dashboard\modules\vip.css -Pattern "Ã|â|Â|﻿" -SimpleMatch
```

Live nach Deploy prüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/stats" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/events/recent" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/sounds/users" | ConvertTo-Json -Depth 8
```

## Offen

- Falls echte 7-/30-Tage-Auswertungen gewünscht sind, Backend-Statistikroute in einem späteren Step erweitern.
- Nach Sichtprüfung ggf. UI-Abstände/Kartengrößen feinjustieren.

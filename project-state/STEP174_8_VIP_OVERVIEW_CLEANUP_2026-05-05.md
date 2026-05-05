# STEP174.8 VIP-Übersicht aufgeräumt

Stand: 2026-05-05

## Ziel

VIP-Übersicht von Entwickler-/Debug-Inhalten befreien und als kompakte Betriebsübersicht darstellen.

## Geänderte Dateien

- `htdocs/dashboard/modules/vip.js`
- `htdocs/dashboard/modules/vip.css`

## Änderung

- Technische Box `Aktueller VIP-Standard` aus der Übersicht entfernt.
- Rohe Event-Tabelle aus der Übersicht entfernt. Events bleiben unverändert im Tab `Events`.
- Übersicht zeigt jetzt kompakte Metriken für System, Twitch-Sync, VIPs/Mods, Sounds, nächsten Sync und Events heute.
- Neue Statuskarten für System, Twitch, Sounds und Datenbank ergänzt.
- Neue Warnkarten ergänzt für fehlenden Twitch-Token, Sync-Fehler, fehlenden Sync, fehlende Sounds, unklare Sounddauer, deaktivierten Auto-Sync und laufenden Sync.
- Buttons für `Aktualisieren` und `Twitch-Sync starten` nutzen bestehende Dashboard-Actions.

## Bewusst nicht geändert

- Keine Backend-Routen geändert.
- Keine Datenbank geändert.
- Keine Tabs entfernt.
- Events-/Daily-/Settings-/Texte-/Sounds-/VIPs-&-Mods-Seiten bleiben funktional erhalten.
- Keine neue Parallelstruktur gebaut.

## Tests

Vor Commit lokal ausführen:

```powershell
cd D:\Git\stream-control-center
node -c .\htdocs\dashboard\modules\vip.js
Select-String -Path .\htdocs\dashboard\modules\vip.js,.\htdocs\dashboard\modules\vip.css -Pattern "Ã|â|Â|﻿" -SimpleMatch
```

Live nach Deploy prüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/twitch-sync/status" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/sounds/users" | ConvertTo-Json -Depth 8
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/admin/summary" | ConvertTo-Json -Depth 8
```

## Offen

- Nach Sichtprüfung im Dashboard ggf. Feinschliff an Kartengrößen/Abständen.
- Danach STEP174.9 Statistikseite planen.
